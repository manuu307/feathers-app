import dbConnect from '@/lib/db';
import Letter, { ILetter } from '@/models/Letter';
import User from '@/models/User';
import { SendLetterInput } from '@/lib/validation';
import { addMinutes } from 'date-fns';

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
    let availableAt = addMinutes(new Date(), deliveryDelayMinutes);

    if (data.scheduled_at) {
      const scheduledDate = new Date(data.scheduled_at);
      // Ensure scheduled date is at least the delivery delay from now
      if (scheduledDate > availableAt) {
        availableAt = scheduledDate;
      }
    }

    // 5. Create Letter
    const newLetter = new Letter({
      sender_id: data.sender_id,
      receiver_address: data.receiver_address,
      content: data.content,
      status: 'sending',
      sent_at: new Date(),
      available_at: availableAt,
      images: data.images || [],
      stamp_id: data.stamp_id,
      scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
    });

    return await newLetter.save();
  }

  static async getIncomingLetters(address: string): Promise<ILetter[]> {
    await dbConnect();
    const now = new Date();
    
    // Return letters that have "arrived" (available_at <= now) and are not processed (saved/dropped)
    return await Letter.find({
      receiver_address: address,
      available_at: { $lte: now },
      status: { $in: ['sending', 'received'] }
    }).sort({ available_at: -1 });
  }

  static async getSavedLetters(address: string): Promise<ILetter[]> {
    await dbConnect();
    return await Letter.find({
      receiver_address: address,
      status: 'saved'
    }).sort({ available_at: -1 });
  }

  static async updateStatus(id: string, status: 'saved' | 'dropped', tags: string[] = []): Promise<ILetter | null> {
    await dbConnect();
    return await Letter.findByIdAndUpdate(
      id,
      { status, tags },
      { new: true }
    );
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

  static async getSentLetters(userId: string): Promise<ILetter[]> {
    await dbConnect();
    return await Letter.find({
      sender_id: userId
    }).sort({ sent_at: -1 });
  }
}
