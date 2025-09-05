import mongoose, { Schema, Document } from 'mongoose';
import { TransactionType } from './Transaction';

export interface IRecurring extends Document {
  name: string;
  type: TransactionType;
  category: string;
  amount: number;
  dayOfMonth: number;
  account?: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date | null;
  installments?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringSchema = new Schema<IRecurring>({
  name: { type: String, required: true },
  type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  dayOfMonth: { type: Number, required: true, min: 1, max: 31 },
  account: { type: String },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date, default: null },
  installments: { type: Number, default: null },
}, { timestamps: true });

export default mongoose.model<IRecurring>('Recurring', RecurringSchema);
