import dbConnect from '@/lib/db';
import User, { IUser } from '@/models/User';
import { CreateUserInput } from '@/lib/validation';
import { StampService } from './stampService';

export class UserService {
  static async createUser(data: CreateUserInput): Promise<IUser> {
    await dbConnect();

    // Ensure stamps are seeded
    await StampService.seedDefaultStamps();
    const defaultStamps = await (await import('@/models/Stamp')).default.find({ is_default: true });

    // Check if address already exists
    const existingUser = await User.findOne({ 'addresses.address': data.address });
    if (existingUser) {
      throw new Error('Address already claimed');
    }

    const newUser = new User({
      full_name: data.full_name,
      birth_date: new Date(data.birth_date),
      addresses: [{ address: data.address, label: 'Primary' }],
      bird: {
        name: data.bird_name,
        type: data.bird_type,
        colors: ['#d4af37'], // Default gold accent
      },
      gold: 100,
      stamps: defaultStamps.map(s => ({ stamp_id: s._id.toString(), quantity: 3 })),
    });

    return await newUser.save();
  }

  static async getUserByAddress(address: string): Promise<IUser | null> {
    await dbConnect();
    return await User.findOne({ 'addresses.address': address });
  }

  static async getUserById(id: string): Promise<IUser | null> {
    await dbConnect();
    return await User.findById(id);
  }
}
