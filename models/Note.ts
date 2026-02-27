import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INote extends Document {
  user_id: mongoose.Types.ObjectId;
  content: string;
  color: string; // e.g., 'yellow', 'pink', 'blue', 'green'
  created_at: Date;
  updated_at: Date;
}

const NoteSchema = new Schema<INote>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  color: { type: String, default: 'yellow' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

NoteSchema.index({ user_id: 1 });

const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

export default Note;
