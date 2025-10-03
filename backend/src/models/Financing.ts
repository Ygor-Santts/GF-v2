import mongoose, { Schema, Document } from "mongoose";

export interface IFinancing extends Document {
  description: string;
  type: "LOAN" | "FINANCING" | "CREDIT_CARD";
  originalAmount: number;
  outstandingBalance: number;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  interestRate: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  // Campos de compatibilidade
  name?: string;
  account?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FinancingSchema = new Schema<IFinancing>(
  {
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["LOAN", "FINANCING", "CREDIT_CARD"],
      required: true,
      default: "FINANCING",
    },
    originalAmount: { type: Number, required: true, min: 0 },
    outstandingBalance: { type: Number, required: true, min: 0 },
    installmentAmount: { type: Number, required: true, min: 0 },
    totalInstallments: { type: Number, required: true, min: 1 },
    paidInstallments: { type: Number, default: 0, min: 0 },
    interestRate: { type: Number, required: true, min: 0, max: 100 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    // Campos de compatibilidade
    name: { type: String },
    account: { type: String },
    category: { type: String, default: "Financiamentos" },
  },
  { timestamps: true }
);

export default mongoose.model<IFinancing>("Financing", FinancingSchema);
