import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDraft extends Document {
  sender_id: mongoose.Types.ObjectId;
  content: string;
  receiver_address?: string;
  stamp_id?: string;
  updated_at: Date;
}

const DraftSchema = new Schema<IDraft>({
  sender_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  receiver_address: { type: String },
  stamp_id: { type: String },
  updated_at: { type: Date, default: Date.now },
});

DraftSchema.index({ sender_id: 1 });

const Draft: Model<IDraft> = mongoose.models.Draft || mongoose.model<IDraft>('Draft', DraftSchema);

export default Draft;
