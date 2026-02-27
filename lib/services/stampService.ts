import dbConnect from '@/lib/db';
import Stamp, { IStamp } from '@/models/Stamp';
import User from '@/models/User';

export class StampService {
  static async getAllStamps(): Promise<IStamp[]> {
    await dbConnect();
    return await Stamp.find({}).sort({ price: 1 });
  }

  static async buyStamp(userId: string, stampId: string, quantity: number = 1): Promise<any> {
    await dbConnect();
    
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const stamp = await Stamp.findById(stampId);
    if (!stamp) throw new Error('Stamp not found');

    const totalPrice = stamp.price * quantity;
    if (user.gold < totalPrice) {
      throw new Error('Not enough gold to purchase these stamps.');
    }

    // Deduct gold
    user.gold -= totalPrice;

    // Add to inventory
    const inventoryIndex = user.stamps.findIndex(s => s.stamp_id === stampId);
    if (inventoryIndex > -1) {
      user.stamps[inventoryIndex].quantity += quantity;
    } else {
      user.stamps.push({ stamp_id: stampId, quantity });
    }

    await user.save();
    return { user, stamp };
  }

  static async seedDefaultStamps(): Promise<void> {
    await dbConnect();
    const count = await Stamp.countDocuments();
    if (count === 0) {
      const defaults = [
        { name: 'Ancient Oak', icon: 'Tree', color: '#2e7d32', price: 0, is_default: true, description: 'A symbol of strength and longevity.' },
        { name: 'Cloud Peak', icon: 'Cloud', color: '#81d4fa', price: 0, is_default: true, description: 'For messages that drift like the wind.' },
        { name: 'Golden Sol', icon: 'Sun', color: '#fbc02d', price: 0, is_default: true, description: 'A warm greeting from the heart.' },
        { name: 'Silver Crescent', icon: 'Moon', color: '#9e9e9e', price: 50, is_default: false, description: 'Secrets whispered in the night.' },
        { name: 'Eternal Flame', icon: 'Flame', color: '#f44336', price: 75, is_default: false, description: 'Passionate words that never fade.' },
        { name: 'Deep Blue', icon: 'Waves', color: '#2196f3', price: 60, is_default: false, description: 'Calm thoughts from across the sea.' },
      ];
      await Stamp.insertMany(defaults);
    }
  }
}
