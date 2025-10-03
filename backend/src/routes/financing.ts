import { Router } from "express";
import { z } from "zod";
import Financing from "../models/Financing";

const router = Router();

const finSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  type: z.enum(["LOAN", "FINANCING", "CREDIT_CARD"]),
  originalAmount: z.number().positive("Valor original deve ser positivo"),
  outstandingBalance: z.number().min(0, "Saldo devedor não pode ser negativo"),
  installmentAmount: z.number().positive("Valor da parcela deve ser positivo"),
  totalInstallments: z
    .number()
    .int()
    .positive("Total de parcelas deve ser positivo"),
  paidInstallments: z.number().int().min(0).default(0),
  interestRate: z
    .number()
    .min(0)
    .max(100, "Taxa de juros deve estar entre 0 e 100%"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().min(1, "Data de fim é obrigatória"),
  isActive: z.boolean().default(true),
  // Campos de compatibilidade
  name: z.string().optional(),
  account: z.string().optional(),
  category: z.string().optional(),
});

// GET /api/financing - Listar financiamentos
router.get("/", async (_req, res) => {
  try {
    const financings = await Financing.find().sort({ createdAt: -1 }).lean();
    res.json(financings);
  } catch (error) {
    console.error("Erro ao buscar financiamentos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET /api/financing/stats - Estatísticas de financiamentos
router.get("/stats", async (_req, res) => {
  try {
    const stats = await Financing.aggregate([
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
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET /api/financing/:id - Buscar financiamento por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const financing = await Financing.findById(id).lean();

    if (!financing) {
      return res.status(404).json({ error: "Financiamento não encontrado" });
    }

    res.json(financing);
  } catch (error) {
    console.error("Erro ao buscar financiamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET /api/financing/:id/payments - Buscar parcelas de um financiamento
router.get("/:id/payments", async (req, res) => {
  try {
    const { id } = req.params;

    const financing = await Financing.findById(id).lean();
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
  } catch (error) {
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
      name: data.description,
      account: data.account,
      category: data.category || "Financiamentos",
    };

    const doc = await Financing.create(payload);
    res.status(201).json(doc);
  } catch (error) {
    console.error("Erro ao criar financiamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST /api/financing/:id/pay - Pagar parcela
router.post("/:id/pay", async (req, res) => {
  try {
    const { id } = req.params;
    const { installmentNumber, amount } = req.body;

    const financing = await Financing.findById(id);
    if (!financing) {
      return res.status(404).json({ error: "Financiamento não encontrado" });
    }

    // Atualizar parcelas pagas
    const newPaidInstallments = Math.max(
      financing.paidInstallments || 0,
      installmentNumber
    );
    const paymentAmount = amount || financing.installmentAmount;

    // Reduzir saldo devedor
    const newOutstandingBalance = Math.max(
      0,
      financing.outstandingBalance - paymentAmount
    );

    // Verificar se foi quitado
    const isFullyPaid =
      newPaidInstallments >= financing.totalInstallments ||
      newOutstandingBalance === 0;

    await Financing.findByIdAndUpdate(id, {
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
  } catch (error) {
    console.error("Erro ao pagar parcela:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST /api/financing/:id/simulate-early-payment - Simular pagamento antecipado
router.post("/:id/simulate-early-payment", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const financing = await Financing.findById(id).lean();
    if (!financing) {
      return res.status(404).json({ error: "Financiamento não encontrado" });
    }

    const currentBalance = financing.outstandingBalance;
    const monthlyPayment = financing.installmentAmount;
    const interestRate = financing.interestRate / 100 / 12; // Taxa mensal

    // Calcular economia de juros (simulação simplificada)
    const remainingInstallments = Math.ceil(currentBalance / monthlyPayment);
    const totalInterestWithoutEarlyPayment =
      remainingInstallments * monthlyPayment - currentBalance;

    const newBalance = Math.max(0, currentBalance - amount);
    const newRemainingInstallments = Math.ceil(newBalance / monthlyPayment);
    const totalInterestWithEarlyPayment =
      newRemainingInstallments * monthlyPayment - newBalance;

    const interestSaved =
      totalInterestWithoutEarlyPayment - totalInterestWithEarlyPayment;
    const monthsSaved = remainingInstallments - newRemainingInstallments;

    const startDate = new Date(financing.startDate);
    const newEndDate = new Date(startDate);
    newEndDate.setMonth(
      newEndDate.getMonth() +
        (financing.paidInstallments || 0) +
        newRemainingInstallments
    );

    const simulation = {
      currentBalance,
      earlyPaymentAmount: amount,
      interestSaved: Math.max(0, interestSaved),
      monthsSaved: Math.max(0, monthsSaved),
      newEndDate: newEndDate.toISOString(),
    };

    res.json(simulation);
  } catch (error) {
    console.error("Erro ao simular pagamento antecipado:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST /api/financing/:id/early-payment - Realizar pagamento antecipado
router.post("/:id/early-payment", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const financing = await Financing.findById(id);
    if (!financing) {
      return res.status(404).json({ error: "Financiamento não encontrado" });
    }

    const newOutstandingBalance = Math.max(
      0,
      financing.outstandingBalance - amount
    );
    const isFullyPaid = newOutstandingBalance === 0;

    const updated = await Financing.findByIdAndUpdate(
      id,
      {
        outstandingBalance: newOutstandingBalance,
        isActive: !isFullyPaid,
      },
      { new: true }
    );

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
  } catch (error) {
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
    const updateData: any = { ...data };

    if (updateData.startDate)
      updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    // Atualizar campo name para compatibilidade
    if (updateData.description) {
      updateData.name = updateData.description;
    }

    const updated = await Financing.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Financiamento não encontrado" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar financiamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// DELETE /api/financing/:id - Deletar financiamento
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Financing.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Financiamento não encontrado" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar financiamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
