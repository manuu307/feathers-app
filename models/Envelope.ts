import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEnvelope extends Document {
  name: string;
  price: number;
  is_default: boolean;
  css_class: string; // For Tailwind classes or specific style identifiers
  layout: 'classic' | 'airmail' | 'royal';
  description?: string;
}

const EnvelopeSchema = new Schema<IEnvelope>({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  is_default: { type: Boolean, default: false },
  css_class: { type: String, required: true },
  layout: { type: String, enum: ['classic', 'airmail', 'royal'], default: 'classic' },
  description: { type: String },
});

const Envelope: Model<IEnvelope> = mongoose.models.Envelope || mongoose.model<IEnvelope>('Envelope', EnvelopeSchema);

export default Envelope;
