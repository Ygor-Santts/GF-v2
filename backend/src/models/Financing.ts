import mongoose, { Schema, Document } from 'mongoose';

export interface IFinancing extends Document {
  name: string;
  installmentAmount: number;
  totalInstallments: number;
  startDate: Date;
  account?: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FinancingSchema = new Schema<IFinancing>({
  name: { type: String, required: true },
  installmentAmount: { type: Number, required: true },
  totalInstallments: { type: Number, required: true },
  startDate: { type: Date, required: true },
  account: { type: String },
  category: { type: String, default: 'Financiamentos' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IFinancing>('Financing', FinancingSchema);
