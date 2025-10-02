"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Transaction_1 = __importDefault(require("../models/Transaction"));
const ensureMonth_1 = require("../services/ensureMonth");
const router = (0, express_1.Router)();
const txSchema = zod_1.z.object({
    date: zod_1.z.string().or(zod_1.z.date()),
    type: zod_1.z.enum(["INCOME", "EXPENSE"]),
    category: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    plannedAmount: zod_1.z.number().optional(),
    amount: zod_1.z.number().optional(),
    account: zod_1.z.string().optional(),
    isFixed: zod_1.z.boolean().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(["PLANNED", "PAID", "CANCELLED"]).optional(),
    linkedFinancing: zod_1.z.string().nullish(),
});
// GET /api/transactions - Listar transações com filtros e paginação
router.get("/", async (req, res) => {
    try {
        const { type, category, status, startDate, endDate, page = 1, limit = 10, year, month, } = req.query;
        const filter = {};
        // Filtros existentes
        if (year && !isNaN(Number(year)))
            filter.year = Number(year);
        if (month && !isNaN(Number(month)))
            filter.month = Number(month);
        if (year && month && !isNaN(Number(year)) && !isNaN(Number(month))) {
            await (0, ensureMonth_1.ensureMonth)(Number(year), Number(month));
        }
        // Novos filtros
        if (type)
            filter.type = type;
        if (category)
            filter.category = category;
        if (status)
            filter.status = status;
        // Filtro por data
        if (startDate || endDate) {
            filter.date = {};
            if (startDate)
                filter.date.$gte = new Date(startDate);
            if (endDate)
                filter.date.$lte = new Date(endDate);
        }
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Math.min(100, Number(limit)));
        const skip = (pageNum - 1) * limitNum;
        const [transactions, total] = await Promise.all([
            Transaction_1.default.find(filter)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Transaction_1.default.countDocuments(filter),
        ]);
        const totalPages = Math.ceil(total / limitNum);
        res.json({
            transactions,
            total,
            page: pageNum,
            totalPages,
            limit: limitNum,
        });
    }
    catch (error) {
        console.error("Erro ao buscar transações:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// GET /api/transactions/recent - Transações recentes
router.get("/recent", async (req, res) => {
    try {
        const limit = Math.min(50, Number(req.query.limit) || 10);
        const transactions = await Transaction_1.default.find()
            .sort({ date: -1, createdAt: -1 })
            .limit(limit)
            .lean();
        res.json(transactions);
    }
    catch (error) {
        console.error("Erro ao buscar transações recentes:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// GET /api/transactions/stats - Estatísticas de transações
router.get("/stats", async (req, res) => {
    try {
        const { period = "current" } = req.query;
        let startDate;
        let endDate = new Date();
        switch (period) {
            case "current":
                startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                break;
            case "last3":
                startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
                break;
            case "last6":
                startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1);
                break;
            case "last12":
                startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 12, 1);
                break;
            default:
                startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        }
        const stats = await Transaction_1.default.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: { $ifNull: ["$amount", "$plannedAmount"] } },
                    count: { $sum: 1 },
                },
            },
        ]);
        const result = {
            totalIncome: 0,
            totalExpenses: 0,
            incomeCount: 0,
            expenseCount: 0,
        };
        stats.forEach((stat) => {
            if (stat._id === "INCOME") {
                result.totalIncome = stat.total;
                result.incomeCount = stat.count;
            }
            else if (stat._id === "EXPENSE") {
                result.totalExpenses = stat.total;
                result.expenseCount = stat.count;
            }
        });
        res.json(result);
    }
    catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// GET /api/transactions/:id - Buscar transação por ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction_1.default.findById(id).lean();
        if (!transaction) {
            return res.status(404).json({ error: "Transação não encontrada" });
        }
        res.json(transaction);
    }
    catch (error) {
        console.error("Erro ao buscar transação:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// POST /api/transactions - Criar nova transação
router.post("/", async (req, res) => {
    try {
        const parsed = txSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Dados inválidos",
                details: parsed.error.errors,
            });
        }
        const data = parsed.data;
        const d = new Date(data.date);
        const doc = await Transaction_1.default.create({
            ...data,
            date: d,
            month: d.getMonth() + 1,
            year: d.getFullYear(),
            status: data.status || "PLANNED",
        });
        res.status(201).json(doc);
    }
    catch (error) {
        console.error("Erro ao criar transação:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// PUT /api/transactions/:id - Atualizar transação
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const parsed = txSchema.partial().safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Dados inválidos",
                details: parsed.error.errors,
            });
        }
        const data = parsed.data;
        // Se a data foi alterada, recalcular month e year
        if (data.date) {
            const d = new Date(data.date);
            data.month = d.getMonth() + 1;
            data.year = d.getFullYear();
        }
        const updated = await Transaction_1.default.findByIdAndUpdate(id, data, {
            new: true,
        });
        if (!updated) {
            return res.status(404).json({ error: "Transação não encontrada" });
        }
        res.json(updated);
    }
    catch (error) {
        console.error("Erro ao atualizar transação:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// PATCH /api/transactions/:id/pay - Marcar como pago
router.patch("/:id/pay", async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const updateData = { status: "PAID" };
        if (amount !== undefined) {
            updateData.amount = amount;
        }
        const updated = await Transaction_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
        });
        if (!updated) {
            return res.status(404).json({ error: "Transação não encontrada" });
        }
        res.json(updated);
    }
    catch (error) {
        console.error("Erro ao marcar como pago:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// PATCH /api/transactions/:id/cancel - Cancelar transação
router.patch("/:id/cancel", async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Transaction_1.default.findByIdAndUpdate(id, { status: "CANCELLED" }, { new: true });
        if (!updated) {
            return res.status(404).json({ error: "Transação não encontrada" });
        }
        res.json(updated);
    }
    catch (error) {
        console.error("Erro ao cancelar transação:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// DELETE /api/transactions/:id - Deletar transação
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Transaction_1.default.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: "Transação não encontrada" });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error("Erro ao deletar transação:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
exports.default = router;
