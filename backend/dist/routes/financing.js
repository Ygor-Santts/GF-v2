"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Financing_1 = __importDefault(require("../models/Financing"));
const router = (0, express_1.Router)();
const finSchema = zod_1.z.object({
    description: zod_1.z.string(),
    type: zod_1.z.enum(["LOAN", "FINANCING", "CREDIT_CARD"]),
    originalAmount: zod_1.z.number().positive(),
    outstandingBalance: zod_1.z.number().positive(),
    installmentAmount: zod_1.z.number().positive(),
    totalInstallments: zod_1.z.number().int().positive(),
    paidInstallments: zod_1.z.number().int().min(0).optional(),
    interestRate: zod_1.z.number().min(0).max(100),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    isActive: zod_1.z.boolean().optional(),
    // Campos de compatibilidade
    name: zod_1.z.string().optional(),
    account: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
});
// GET /api/financing - Listar financiamentos
router.get("/", async (_req, res) => {
    try {
        const financings = await Financing_1.default.find().sort({ createdAt: -1 }).lean();
        // Mapear para o formato esperado pelo frontend
        const mappedFinancings = financings.map((item) => ({
            _id: item._id,
            description: item.description || item.name,
            type: item.type || "FINANCING",
            originalAmount: item.originalAmount || item.installmentAmount * item.totalInstallments,
            outstandingBalance: item.outstandingBalance || item.originalAmount,
            installmentAmount: item.installmentAmount,
            totalInstallments: item.totalInstallments,
            paidInstallments: item.paidInstallments || 0,
            interestRate: item.interestRate || 0,
            startDate: item.startDate,
            endDate: item.endDate,
            isActive: item.isActive !== false,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        }));
        res.json(mappedFinancings);
    }
    catch (error) {
        console.error("Erro ao buscar financiamentos:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// GET /api/financing/stats - Estatísticas de financiamentos
router.get("/stats", async (_req, res) => {
    try {
        const stats = await Financing_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalFinancings: { $sum: 1 },
                    activeFinancings: {
                        $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                    },
                    totalOriginalAmount: { $sum: "$originalAmount" },
                    totalOutstandingBalance: { $sum: "$outstandingBalance" },
                    totalMonthlyPayments: {
                        $sum: {
                            $cond: [{ $eq: ["$isActive", true] }, "$installmentAmount", 0],
                        },
                    },
                    averageInterestRate: { $avg: "$interestRate" },
                },
            },
        ]);
        const result = stats[0] || {
            totalFinancings: 0,
            activeFinancings: 0,
            totalOriginalAmount: 0,
            totalOutstandingBalance: 0,
            totalMonthlyPayments: 0,
            averageInterestRate: 0,
        };
        res.json(result);
    }
    catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// GET /api/financing/:id - Buscar financiamento por ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const financing = await Financing_1.default.findById(id).lean();
        if (!financing) {
            return res.status(404).json({ error: "Financiamento não encontrado" });
        }
        // Mapear para o formato esperado pelo frontend
        const mapped = {
            _id: financing._id,
            description: financing.description || financing.name,
            type: financing.type || "FINANCING",
            originalAmount: financing.originalAmount ||
                financing.installmentAmount * financing.totalInstallments,
            outstandingBalance: financing.outstandingBalance || financing.originalAmount,
            installmentAmount: financing.installmentAmount,
            totalInstallments: financing.totalInstallments,
            paidInstallments: financing.paidInstallments || 0,
            interestRate: financing.interestRate || 0,
            startDate: financing.startDate,
            endDate: financing.endDate,
            isActive: financing.isActive !== false,
            createdAt: financing.createdAt,
            updatedAt: financing.updatedAt,
        };
        res.json(mapped);
    }
    catch (error) {
        console.error("Erro ao buscar financiamento:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// GET /api/financing/:id/payments - Buscar parcelas de um financiamento
router.get("/:id/payments", async (req, res) => {
    try {
        const { id } = req.params;
        const financing = await Financing_1.default.findById(id).lean();
        if (!financing) {
            return res.status(404).json({ error: "Financiamento não encontrado" });
        }
        // Gerar lista de parcelas baseada no financiamento
        const payments = [];
        const startDate = new Date(financing.startDate);
        for (let i = 1; i <= financing.totalInstallments; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(dueDate.getMonth() + i - 1);
            const isPaid = i <= (financing.paidInstallments || 0);
            const isOverdue = !isPaid && dueDate < new Date();
            payments.push({
                _id: `${id}-${i}`,
                financingId: id,
                installmentNumber: i,
                amount: financing.installmentAmount,
                dueDate: dueDate.toISOString(),
                paidDate: isPaid ? dueDate.toISOString() : null,
                status: isPaid ? "PAID" : isOverdue ? "OVERDUE" : "PENDING",
            });
        }
        res.json(payments);
    }
    catch (error) {
        console.error("Erro ao buscar parcelas:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// POST /api/financing - Criar novo financiamento
router.post("/", async (req, res) => {
    try {
        const parsed = finSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Dados inválidos",
                details: parsed.error.errors,
            });
        }
        const data = parsed.data;
        const payload = {
            description: data.description,
            type: data.type,
            originalAmount: data.originalAmount,
            outstandingBalance: data.outstandingBalance,
            installmentAmount: data.installmentAmount,
            totalInstallments: data.totalInstallments,
            paidInstallments: data.paidInstallments || 0,
            interestRate: data.interestRate,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            isActive: data.isActive !== false,
            // Campos de compatibilidade
            name: data.description || data.name,
            account: data.account,
            category: data.category,
        };
        const doc = await Financing_1.default.create(payload);
        // Retornar no formato esperado pelo frontend
        const response = {
            _id: doc._id,
            description: doc.description || doc.name,
            type: doc.type || "FINANCING",
            originalAmount: doc.originalAmount,
            outstandingBalance: doc.outstandingBalance,
            installmentAmount: doc.installmentAmount,
            totalInstallments: doc.totalInstallments,
            paidInstallments: doc.paidInstallments || 0,
            interestRate: doc.interestRate || 0,
            startDate: doc.startDate,
            endDate: doc.endDate,
            isActive: doc.isActive !== false,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error("Erro ao criar financiamento:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// POST /api/financing/:id/pay - Pagar parcela
router.post("/:id/pay", async (req, res) => {
    try {
        const { id } = req.params;
        const { installmentNumber, amount } = req.body;
        const financing = await Financing_1.default.findById(id);
        if (!financing) {
            return res.status(404).json({ error: "Financiamento não encontrado" });
        }
        // Atualizar parcelas pagas
        const newPaidInstallments = Math.max(financing.paidInstallments || 0, installmentNumber);
        const paymentAmount = amount || financing.installmentAmount;
        // Reduzir saldo devedor
        const newOutstandingBalance = Math.max(0, financing.outstandingBalance - paymentAmount);
        // Verificar se foi quitado
        const isFullyPaid = newPaidInstallments >= financing.totalInstallments ||
            newOutstandingBalance === 0;
        await Financing_1.default.findByIdAndUpdate(id, {
            paidInstallments: newPaidInstallments,
            outstandingBalance: newOutstandingBalance,
            isActive: !isFullyPaid,
        });
        // Simular retorno de pagamento
        const startDate = new Date(financing.startDate);
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + installmentNumber - 1);
        const payment = {
            _id: `${id}-${installmentNumber}`,
            financingId: id,
            installmentNumber,
            amount: paymentAmount,
            dueDate: dueDate.toISOString(),
            paidDate: new Date().toISOString(),
            status: "PAID",
        };
        res.json(payment);
    }
    catch (error) {
        console.error("Erro ao pagar parcela:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// POST /api/financing/:id/simulate-early-payment - Simular pagamento antecipado
router.post("/:id/simulate-early-payment", async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const financing = await Financing_1.default.findById(id).lean();
        if (!financing) {
            return res.status(404).json({ error: "Financiamento não encontrado" });
        }
        const currentBalance = financing.outstandingBalance;
        const monthlyPayment = financing.installmentAmount;
        const interestRate = financing.interestRate / 100 / 12; // Taxa mensal
        // Calcular economia de juros (simulação simplificada)
        const remainingInstallments = Math.ceil(currentBalance / monthlyPayment);
        const totalInterestWithoutEarlyPayment = remainingInstallments * monthlyPayment - currentBalance;
        const newBalance = Math.max(0, currentBalance - amount);
        const newRemainingInstallments = Math.ceil(newBalance / monthlyPayment);
        const totalInterestWithEarlyPayment = newRemainingInstallments * monthlyPayment - newBalance;
        const interestSaved = totalInterestWithoutEarlyPayment - totalInterestWithEarlyPayment;
        const monthsSaved = remainingInstallments - newRemainingInstallments;
        const startDate = new Date(financing.startDate);
        const newEndDate = new Date(startDate);
        newEndDate.setMonth(newEndDate.getMonth() +
            (financing.paidInstallments || 0) +
            newRemainingInstallments);
        const simulation = {
            currentBalance,
            earlyPaymentAmount: amount,
            interestSaved: Math.max(0, interestSaved),
            monthsSaved: Math.max(0, monthsSaved),
            newEndDate: newEndDate.toISOString(),
        };
        res.json(simulation);
    }
    catch (error) {
        console.error("Erro ao simular pagamento antecipado:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// POST /api/financing/:id/early-payment - Realizar pagamento antecipado
router.post("/:id/early-payment", async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const financing = await Financing_1.default.findById(id);
        if (!financing) {
            return res.status(404).json({ error: "Financiamento não encontrado" });
        }
        const newOutstandingBalance = Math.max(0, financing.outstandingBalance - amount);
        const isFullyPaid = newOutstandingBalance === 0;
        const updated = await Financing_1.default.findByIdAndUpdate(id, {
            outstandingBalance: newOutstandingBalance,
            isActive: !isFullyPaid,
        }, { new: true });
        // Retornar no formato esperado pelo frontend
        const response = {
            _id: updated._id,
            description: updated.description || updated.name,
            type: updated.type || "FINANCING",
            originalAmount: updated.originalAmount,
            outstandingBalance: updated.outstandingBalance,
            installmentAmount: updated.installmentAmount,
            totalInstallments: updated.totalInstallments,
            paidInstallments: updated.paidInstallments || 0,
            interestRate: updated.interestRate || 0,
            startDate: updated.startDate,
            endDate: updated.endDate,
            isActive: updated.isActive !== false,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        };
        res.json(response);
    }
    catch (error) {
        console.error("Erro ao realizar pagamento antecipado:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// PUT /api/financing/:id - Atualizar financiamento
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const parsed = finSchema.partial().safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Dados inválidos",
                details: parsed.error.errors,
            });
        }
        const data = parsed.data;
        const updateData = { ...data };
        if (updateData.startDate)
            updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate)
            updateData.endDate = new Date(updateData.endDate);
        // Atualizar campo name para compatibilidade
        if (updateData.description) {
            updateData.name = updateData.description;
        }
        const updated = await Financing_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
        });
        if (!updated) {
            return res.status(404).json({ error: "Financiamento não encontrado" });
        }
        // Retornar no formato esperado pelo frontend
        const response = {
            _id: updated._id,
            description: updated.description || updated.name,
            type: updated.type || "FINANCING",
            originalAmount: updated.originalAmount,
            outstandingBalance: updated.outstandingBalance,
            installmentAmount: updated.installmentAmount,
            totalInstallments: updated.totalInstallments,
            paidInstallments: updated.paidInstallments || 0,
            interestRate: updated.interestRate || 0,
            startDate: updated.startDate,
            endDate: updated.endDate,
            isActive: updated.isActive !== false,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        };
        res.json(response);
    }
    catch (error) {
        console.error("Erro ao atualizar financiamento:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// DELETE /api/financing/:id - Deletar financiamento
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Financing_1.default.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: "Financiamento não encontrado" });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error("Erro ao deletar financiamento:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
exports.default = router;
