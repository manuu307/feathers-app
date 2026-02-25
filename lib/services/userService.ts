import dbConnect from '@/lib/db';
import User, { IUser } from '@/models/User';
import { CreateUserInput } from '@/lib/validation';

export class UserService {
  static async createUser(data: CreateUserInput): Promise<IUser> {
    await dbConnect();

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
