import { Router } from "express";
import { monthlyReport } from "../services/report";
import { ensureMonth } from "../services/ensureMonth";
import Transaction from "../models/Transaction";

const router = Router();

// GET /api/reports/dashboard - Dados completos do dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const { period = "current", startDate, endDate } = req.query;

    let dateFilter: any = {};
    const now = new Date();

    // Definir período
    switch (period) {
      case "current":
        dateFilter = {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        };
        break;
      case "last3":
        const last3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        dateFilter = {
          date: { $gte: last3Months },
        };
        break;
      case "last6":
        const last6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        dateFilter = {
          date: { $gte: last6Months },
        };
        break;
      case "last12":
        const last12Months = new Date(
          now.getFullYear(),
          now.getMonth() - 12,
          1
        );
        dateFilter = {
          date: { $gte: last12Months },
        };
        break;
      case "custom":
        if (startDate && endDate) {
          dateFilter = {
            date: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string),
            },
          };
        }
        break;
      default:
        // Por padrão, pegar apenas o mês atual
        dateFilter = {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        };
    }

    // Buscar dados do resumo com filtro de data
    const allTransactions = await Transaction.find(dateFilter).lean();
    const summaryData = [
      {
        _id: "INCOME",
        total: allTransactions
          .filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + (t.amount || t.plannedAmount || 0), 0),
        count: allTransactions.filter((t) => t.type === "INCOME").length,
      },
      {
        _id: "EXPENSE",
        total: allTransactions
          .filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + (t.amount || t.plannedAmount || 0), 0),
        count: allTransactions.filter((t) => t.type === "EXPENSE").length,
      },
    ];

    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      incomeGrowth: 0,
      expenseGrowth: 0,
      savingsRate: 0,
      monthlyAverage: 0,
    };

    summaryData.forEach((item) => {
      if (item._id === "INCOME") {
        summary.totalIncome = item.total;
      } else if (item._id === "EXPENSE") {
        summary.totalExpenses = item.total;
      }
    });

    summary.netBalance = summary.totalIncome - summary.totalExpenses;
    summary.savingsRate =
      summary.totalIncome > 0
        ? (summary.netBalance / summary.totalIncome) * 100
        : 0;

    // Dados mensais para gráfico (últimos 6 meses)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthFilter = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      };

      const monthTransactions = await Transaction.find(monthFilter).lean();
      const income = monthTransactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + (t.amount || t.plannedAmount || 0), 0);
      const expenses = monthTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + (t.amount || t.plannedAmount || 0), 0);

      monthlyData.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`,
        income,
        expenses,
      });
    }

    // Dados por categoria (mês atual)
    const categoryData = [];
    const categoryMap = new Map();

    allTransactions.forEach((transaction) => {
      const category = transaction.category;
      const amount = transaction.amount || transaction.plannedAmount || 0;

      if (categoryMap.has(category)) {
        categoryMap.set(category, categoryMap.get(category) + amount);
      } else {
        categoryMap.set(category, amount);
      }
    });

    categoryMap.forEach((amount, category) => {
      categoryData.push({ category, amount });
    });

    categoryData.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

    // Transações recentes (usando o mesmo filtro de data)
    const recentTransactions = await Transaction.find(dateFilter)
      .sort({ date: -1, createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      summary,
      monthlyData,
      categoryData,
      recentTransactions,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET /api/reports/monthly - Relatório mensal
router.get("/monthly", async (req, res) => {
  try {
    const { period = "last12" } = req.query;

    let startDate: Date;
    const endDate = new Date();

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
      default:
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 12, 1);
        break;
    }

    const monthlyReports = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalIncome: {
            $sum: {
              $cond: [
                { $eq: ["$type", "INCOME"] },
                { $ifNull: ["$amount", "$plannedAmount"] },
                0,
              ],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [
                { $eq: ["$type", "EXPENSE"] },
                { $ifNull: ["$amount", "$plannedAmount"] },
                0,
              ],
            },
          },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          totalIncome: 1,
          totalExpenses: 1,
          netBalance: { $subtract: ["$totalIncome", "$totalExpenses"] },
          transactionCount: 1,
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(monthlyReports);
  } catch (error) {
    console.error("Erro ao buscar relatório mensal:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET /api/reports/categories - Relatório por categorias
router.get("/categories", async (req, res) => {
  try {
    const { period = "current", type } = req.query;

    let dateFilter: any = {};
    const now = new Date();

    switch (period) {
      case "current":
        dateFilter = {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        };
        break;
      case "last3":
        const last3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        dateFilter = { date: { $gte: last3Months } };
        break;
      case "last6":
        const last6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        dateFilter = { date: { $gte: last6Months } };
        break;
      case "last12":
        const last12Months = new Date(
          now.getFullYear(),
          now.getMonth() - 12,
          1
        );
        dateFilter = { date: { $gte: last12Months } };
        break;
    }

    if (type) {
      dateFilter.type = type;
    }

    const categoryReports = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          totalAmount: { $sum: { $ifNull: ["$amount", "$plannedAmount"] } },
          transactionCount: { $sum: 1 },
          averageAmount: { $avg: { $ifNull: ["$amount", "$plannedAmount"] } },
        },
      },
      {
        $project: {
          category: "$_id.category",
          type: "$_id.type",
          totalAmount: 1,
          transactionCount: 1,
          averageAmount: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json(categoryReports);
  } catch (error) {
    console.error("Erro ao buscar relatório por categorias:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET /api/reports/insights - Insights financeiros
router.get("/insights", async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = { year: now.getFullYear(), month: now.getMonth() + 1 };
    const lastMonth = {
      year: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
      month: now.getMonth() === 0 ? 12 : now.getMonth(),
    };

    // Dados do mês atual
    const currentData = await Transaction.aggregate([
      { $match: currentMonth },
      {
        $group: {
          _id: "$type",
          total: { $sum: { $ifNull: ["$amount", "$plannedAmount"] } },
        },
      },
    ]);

    // Dados do mês anterior
    const lastData = await Transaction.aggregate([
      { $match: lastMonth },
      {
        $group: {
          _id: "$type",
          total: { $sum: { $ifNull: ["$amount", "$plannedAmount"] } },
        },
      },
    ]);

    const insights: string[] = [];
    const recommendations: string[] = [];
    const alerts: string[] = [];

    // Gerar insights baseados nos dados
    const currentIncome =
      currentData.find((d) => d._id === "INCOME")?.total || 0;
    const currentExpenses =
      currentData.find((d) => d._id === "EXPENSE")?.total || 0;
    const lastIncome = lastData.find((d) => d._id === "INCOME")?.total || 0;
    const lastExpenses = lastData.find((d) => d._id === "EXPENSE")?.total || 0;

    const balance = currentIncome - currentExpenses;
    const savingsRate = currentIncome > 0 ? (balance / currentIncome) * 100 : 0;

    if (balance > 0) {
      insights.push(
        `Você teve um saldo positivo de R$ ${balance.toFixed(2)} este mês!`
      );
    } else {
      alerts.push(
        `Atenção: Você gastou R$ ${Math.abs(balance).toFixed(
          2
        )} a mais do que ganhou este mês.`
      );
    }

    if (savingsRate >= 20) {
      insights.push(
        `Excelente! Você conseguiu economizar ${savingsRate.toFixed(
          1
        )}% da sua renda.`
      );
    } else if (savingsRate >= 10) {
      insights.push(
        `Bom trabalho! Você economizou ${savingsRate.toFixed(1)}% da sua renda.`
      );
      recommendations.push(
        "Tente aumentar sua taxa de economia para 10% ou mais."
      );
    } else {
      recommendations.push(
        "Considere revisar seus gastos para aumentar sua capacidade de poupança."
      );
    }

    if (currentExpenses > lastExpenses * 1.1) {
      alerts.push(
        "Seus gastos aumentaram significativamente em relação ao mês anterior."
      );
    }

    res.json({
      insights,
      recommendations,
      alerts,
      goals: [], // Implementar sistema de metas futuramente
    });
  } catch (error) {
    console.error("Erro ao buscar insights:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Manter compatibilidade com rota antiga
router.get("/monthly-old", async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  if (isNaN(year) || isNaN(month))
    return res.status(400).json({ error: "year and month are required" });
  await ensureMonth(year, month);
  const data = await monthlyReport(year, month);
  res.json(data);
});

export default router;
