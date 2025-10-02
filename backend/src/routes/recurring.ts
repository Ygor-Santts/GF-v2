import { Router } from "express";
import { z } from "zod";
import Recurring from "../models/Recurring";
import Transaction from "../models/Transaction";
import { seedRecurringForward } from "../services/ensureMonth";

const router = Router();

const recurringSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string(),
  description: z.string().optional(),
  amount: z.number(),
  dayOfMonth: z.number().min(1).max(31),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  // Campos de compatibilidade
  name: z.string().optional(),
  installments: z.number().int().positive().nullable().optional(),
  account: z.string().optional(),
});

// GET /api/recurring - Listar transações recorrentes
router.get("/", async (_req, res) => {
  try {
    const list = await Recurring.find().sort({ createdAt: -1 }).lean();

    // Mapear para o formato esperado pelo frontend
    const mappedList = list.map((item) => ({
      _id: item._id,
      type: item.type,
      category: item.category,
      description: item.description || item.name,
      amount: item.amount,
      dayOfMonth: item.dayOfMonth,
      isActive: item.isActive !== false,
      startDate: item.startDate,
      endDate: item.endDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    res.json(mappedList);
  } catch (error) {
    console.error("Erro ao buscar transações recorrentes:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET /api/recurring/:id - Buscar transação recorrente por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const recurring = await Recurring.findById(id).lean();

    if (!recurring) {
      return res
        .status(404)
        .json({ error: "Transação recorrente não encontrada" });
    }

    // Mapear para o formato esperado pelo frontend
    const mapped = {
      _id: recurring._id,
      type: recurring.type,
      category: recurring.category,
      description: recurring.description || recurring.name,
      amount: recurring.amount,
      dayOfMonth: recurring.dayOfMonth,
      isActive: recurring.isActive !== false,
      startDate: recurring.startDate,
      endDate: recurring.endDate,
      createdAt: recurring.createdAt,
      updatedAt: recurring.updatedAt,
    };

    res.json(mapped);
  } catch (error) {
    console.error("Erro ao buscar transação recorrente:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST /api/recurring - Criar nova transação recorrente
router.post("/", async (req, res) => {
  try {
    const parsed = recurringSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: parsed.error.errors,
      });
    }

    const data = parsed.data;
    const payload: any = {
      type: data.type,
      category: data.category,
      description: data.description,
      amount: data.amount,
      dayOfMonth: data.dayOfMonth,
      isActive: data.isActive !== false,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : null,
      // Campos de compatibilidade
      name: data.description || data.name || `${data.type} - ${data.category}`,
      account: data.account,
      installments: data.installments,
    };

    const doc = await Recurring.create(payload);
    await seedRecurringForward(doc); // auto-gera meses à frente

    // Retornar no formato esperado pelo frontend
    const response = {
      _id: doc._id,
      type: doc.type,
      category: doc.category,
      description: doc.description || doc.name,
      amount: doc.amount,
      dayOfMonth: doc.dayOfMonth,
      isActive: doc.isActive !== false,
      startDate: doc.startDate,
      endDate: doc.endDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Erro ao criar transação recorrente:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// PUT /api/recurring/:id - Atualizar transação recorrente
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = recurringSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: parsed.error.errors,
      });
    }

    const data = parsed.data;
    const patch: any = { ...data };

    if (patch.startDate) patch.startDate = new Date(patch.startDate);
    if (patch.endDate !== undefined && patch.endDate !== null) {
      patch.endDate = new Date(patch.endDate);
    }

    // Atualizar campo name para compatibilidade
    if (patch.description) {
      patch.name = patch.description;
    }

    const updated = await Recurring.findByIdAndUpdate(id, patch, { new: true });

    if (!updated) {
      return res
        .status(404)
        .json({ error: "Transação recorrente não encontrada" });
    }

    if (updated) await seedRecurringForward(updated); // re-semente

    // Retornar no formato esperado pelo frontend
    const response = {
      _id: updated._id,
      type: updated.type,
      category: updated.category,
      description: updated.description || updated.name,
      amount: updated.amount,
      dayOfMonth: updated.dayOfMonth,
      isActive: updated.isActive !== false,
      startDate: updated.startDate,
      endDate: updated.endDate,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao atualizar transação recorrente:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// PATCH /api/recurring/:id/toggle - Ativar/Desativar transação recorrente
router.patch("/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive deve ser um boolean" });
    }

    const updated = await Recurring.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ error: "Transação recorrente não encontrada" });
    }

    // Retornar no formato esperado pelo frontend
    const response = {
      _id: updated._id,
      type: updated.type,
      category: updated.category,
      description: updated.description || updated.name,
      amount: updated.amount,
      dayOfMonth: updated.dayOfMonth,
      isActive: updated.isActive !== false,
      startDate: updated.startDate,
      endDate: updated.endDate,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao alterar status:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST /api/recurring/process - Processar transações recorrentes manualmente
router.post("/process", async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Buscar transações recorrentes ativas
    const activeRecurring = await Recurring.find({ isActive: true }).lean();

    let processed = 0;
    let created = 0;

    for (const recurring of activeRecurring) {
      // Verificar se já existe transação para este mês
      const existingTransaction = await Transaction.findOne({
        year: currentYear,
        month: currentMonth,
        category: recurring.category,
        type: recurring.type,
        amount: recurring.amount,
        description: {
          $regex: new RegExp(
            recurring.name || recurring.description || "",
            "i"
          ),
        },
      });

      if (!existingTransaction) {
        // Criar nova transação
        const transactionDate = new Date(
          currentYear,
          currentMonth - 1,
          recurring.dayOfMonth
        );

        await Transaction.create({
          date: transactionDate,
          type: recurring.type,
          category: recurring.category,
          description: recurring.description || recurring.name,
          plannedAmount: recurring.amount,
          amount: recurring.amount,
          status: "PLANNED",
          month: currentMonth,
          year: currentYear,
        });

        created++;
      }

      processed++;
    }

    res.json({ processed, created });
  } catch (error) {
    console.error("Erro ao processar transações recorrentes:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// DELETE /api/recurring/:id - Deletar transação recorrente
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Recurring.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ error: "Transação recorrente não encontrada" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar transação recorrente:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
