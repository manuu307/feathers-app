import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress {
  address: string;
  label?: string;
  created_at: Date;
}

export interface IBird {
  name: string;
  type: 'owl' | 'raven' | 'dove' | 'falcon'; // Example types
  colors: string[];
}

export interface IUser extends Document {
  full_name: string;
  birth_date: Date;
  addresses: IAddress[];
  bird: IBird;
  gold: number;
  stamps: {
    stamp_id: string;
    quantity: number;
  }[];
  envelopes: string[]; // Array of envelope IDs (unlockable)
  created_at: Date;
}

const AddressSchema = new Schema<IAddress>({
  address: { type: String, required: true }, // Uniqueness handled at User level index
  label: { type: String },
  created_at: { type: Date, default: Date.now },
});

const BirdSchema = new Schema<IBird>({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['owl', 'raven', 'dove', 'falcon'], 
    required: true 
  },
  colors: { type: [String], default: [] },
});

const UserSchema = new Schema<IUser>({
  full_name: { type: String, required: true },
  birth_date: { type: Date, required: true },
  addresses: { type: [AddressSchema], default: [] },
  bird: { type: BirdSchema, required: true },
  gold: { type: Number, default: 100 }, // Starting gold
  stamps: [{
    stamp_id: { type: String, required: true },
    quantity: { type: Number, default: 1 }
  }],
  envelopes: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now },
});

// Index for unique addresses across the entire collection
UserSchema.index({ 'addresses.address': 1 }, { unique: true });

// Prevent recompilation of model in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
