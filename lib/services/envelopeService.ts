import dbConnect from '@/lib/db';
import Envelope, { IEnvelope } from '@/models/Envelope';
import User from '@/models/User';

export class EnvelopeService {
  static async getAllEnvelopes(): Promise<IEnvelope[]> {
    await dbConnect();
    return await Envelope.find({}).sort({ price: 1 });
  }

  static async buyEnvelope(userId: string, envelopeId: string): Promise<any> {
    await dbConnect();
    
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const envelope = await Envelope.findById(envelopeId);
    if (!envelope) throw new Error('Envelope not found');

    if (user.envelopes.includes(envelopeId)) {
      throw new Error('You already own this envelope.');
    }

    if (user.gold < envelope.price) {
      throw new Error('Not enough gold to purchase this envelope.');
    }

    // Deduct gold
    user.gold -= envelope.price;

    // Add to inventory
    user.envelopes.push(envelopeId);

    await user.save();
    return { user, envelope };
  }

  static async seedDefaultEnvelopes(): Promise<void> {
    await dbConnect();
    const count = await Envelope.countDocuments();
    if (count === 0) {
      const defaults = [
        { 
          name: 'Classic Parchment', 
          price: 0, 
          is_default: true, 
          css_class: 'bg-[#f0e6d2] border-none shadow-sm', 
          layout: 'classic',
          description: 'A standard, reliable envelope for everyday correspondence.'
        },
        { 
          name: 'Airmail', 
          price: 50, 
          is_default: false, 
          css_class: 'bg-white border-[8px] border-transparent border-image-[repeating-linear-gradient(45deg,#f44336_0,#f44336_10px,transparent_10px,transparent_20px,#2196f3_20px,#2196f3_30px,transparent_30px,transparent_40px)] border-image-slice-1', 
          layout: 'airmail',
          description: 'For urgent messages that must fly swiftly across the realm.'
        },
        { 
          name: 'Royal Velvet', 
          price: 100, 
          is_default: false, 
          css_class: 'bg-[#4a148c] border-2 border-[#ffd700] text-[#ffd700]', 
          layout: 'royal',
          description: 'A luxurious envelope fit for kings and queens.'
        },
      ];
      // @ts-ignore
      await Envelope.insertMany(defaults);
    }
  }
}
