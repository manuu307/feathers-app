import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStamp extends Document {
  name: string;
  icon: string;
  color: string;
  price: number;
  is_default: boolean;
  description?: string;
}

const StampSchema = new Schema<IStamp>({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  price: { type: Number, default: 0 },
  is_default: { type: Boolean, default: false },
  description: { type: String },
});

const Stamp: Model<IStamp> = mongoose.models.Stamp || mongoose.model<IStamp>('Stamp', StampSchema);

export default Stamp;
