import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILetter extends Document {
  sender_id: mongoose.Types.ObjectId;
  receiver_address: string;
  content: string;
  status: 'sending' | 'received';
  sent_at: Date;
  available_at: Date;
  received_at?: Date;
  images: string[];
  stamp_id?: string;
}

const LetterSchema = new Schema<ILetter>({
  sender_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver_address: { type: String, required: true },
  content: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['sending', 'received'], 
    default: 'sending',
    required: true 
  },
  sent_at: { type: Date, default: Date.now, required: true },
  available_at: { type: Date, required: true },
  received_at: { type: Date },
  images: { 
    type: [String], 
    validate: [arrayLimit, '{PATH} exceeds the limit of 3'] 
  },
  stamp_id: { type: String },
});

function arrayLimit(val: string[]) {
  return val.length <= 3;
}

// Indexes for querying
LetterSchema.index({ receiver_address: 1 });
LetterSchema.index({ sender_id: 1 });
LetterSchema.index({ available_at: 1 });

// Prevent recompilation of model in development
// Check if model exists before compiling
const Letter: Model<ILetter> = mongoose.models.Letter || mongoose.model<ILetter>('Letter', LetterSchema);

export default Letter;
