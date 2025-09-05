import mongoose, { Schema, Document } from 'mongoose';

export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'PLANNED' | 'PAID';

export interface ITransaction extends Document {
  date: Date;
  month: number;
  year: number;
  type: TransactionType;
  category: string;
  description?: string;
  plannedAmount?: number;
  amount?: number;
  account?: string;
  isFixed?: boolean;
  tags?: string[];
  status?: TransactionStatus;
  linkedFinancing?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  date: { type: Date, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
  category: { type: String, required: true },
  description: { type: String },
  plannedAmount: { type: Number },
  amount: { type: Number },
  account: { type: String },
  isFixed: { type: Boolean, default: false },
  tags: [{ type: String }],
  status: { type: String, enum: ['PLANNED', 'PAID'], default: 'PLANNED' },
  linkedFinancing: { type: Schema.Types.ObjectId, ref: 'Financing', default: null },
}, { timestamps: true });

TransactionSchema.index({ year: 1, month: 1, type: 1 });
TransactionSchema.index({ date: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
