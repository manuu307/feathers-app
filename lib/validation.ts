import { z } from 'zod';

export const BirdTypeEnum = z.enum(['owl', 'raven', 'dove', 'falcon']);

export const CreateUserSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100),
  birth_date: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', { message: "Valid date is required" }),
  address: z.string().min(3, "Address must be at least 3 characters").regex(/^[a-zA-Z0-9-]+$/, "Address can only contain alphanumeric characters and hyphens"),
  bird_name: z.string().min(1, "Bird name is required"),
  bird_type: BirdTypeEnum,
});

export const SendLetterSchema = z.object({
  sender_id: z.string(),
  receiver_address: z.string().min(3),
  content: z.string().min(50, "Letter must be at least 50 characters long").max(5000, "Letter cannot exceed 5000 characters"),
  images: z.array(z.string().url()).max(3, "Maximum 3 images allowed").optional(),
  stamp_id: z.string().optional(), // Deprecated
  stamps: z.array(z.string()).max(3, "Maximum 3 stamps allowed").optional(),
  envelope_id: z.string().optional(),
  scheduled_at: z.string().optional().refine((date) => !date || new Date(date).toString() !== 'Invalid Date', { message: "Valid date is required" }),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type SendLetterInput = z.infer<typeof SendLetterSchema>;
