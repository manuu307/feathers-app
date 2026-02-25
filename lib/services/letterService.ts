import dbConnect from '@/lib/db';
import Letter, { ILetter } from '@/models/Letter';
import User from '@/models/User';
import { SendLetterInput } from '@/lib/validation';
import { addMinutes } from 'date-fns';
import { marked } from 'marked';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as any);

export class LetterService {
  static async sendLetter(data: SendLetterInput): Promise<ILetter> {
    await dbConnect();

    // 1. Validate Sender
    const sender = await User.findById(data.sender_id);
    if (!sender) {
      throw new Error('Sender not found');
    }

    // 2. Validate Receiver Address
    const receiver = await User.findOne({ 'addresses.address': data.receiver_address });
    if (!receiver) {
      throw new Error('Recipient address does not exist');
    }

    // 3. Check Cooldown (e.g., 1 hour between letters to same recipient)
    const lastLetter = await Letter.findOne({
      sender_id: data.sender_id,
      receiver_address: data.receiver_address,
    }).sort({ sent_at: -1 });

    if (lastLetter) {
      const now = new Date();
      const cooldownEnd = addMinutes(lastLetter.sent_at, 60); // 1 hour cooldown
      if (now < cooldownEnd) {
        throw new Error('You must wait before writing to this address again. Patience is a virtue.');
      }
    }

    // 4. Calculate Delivery Delay
    // "Delivery is ceremonial. Time is part of the experience."
    // For prototype: 2-5 minutes. For prod: 6-24 hours.
    // Let's make it 2 minutes for the preview to be testable, but architecture supports hours.
    const deliveryDelayMinutes = 2; 
    const availableAt = addMinutes(new Date(), deliveryDelayMinutes);

    // 5. Sanitize Content
    // Convert Markdown to HTML then sanitize
    const rawHtml = await marked.parse(data.content);
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);

    // 6. Create Letter
    const newLetter = new Letter({
      sender_id: data.sender_id,
      receiver_address: data.receiver_address,
      content_raw: data.content,
      content_rendered: sanitizedHtml,
      status: 'sending',
      sent_at: new Date(),
      available_at: availableAt,
      images: data.images || [],
    });

    return await newLetter.save();
  }

  static async getIncomingLetters(address: string): Promise<ILetter[]> {
    await dbConnect();
    const now = new Date();
    
    // Return letters that have "arrived" (available_at <= now)
    return await Letter.find({
      receiver_address: address,
      available_at: { $lte: now },
    }).sort({ available_at: -1 });
  }

  static async getPendingLetters(address: string): Promise<ILetter[]> {
    await dbConnect();
    const now = new Date();
    
    // Return letters that are "on the way"
    return await Letter.find({
      receiver_address: address,
      available_at: { $gt: now },
    }).sort({ available_at: 1 });
  }
}
