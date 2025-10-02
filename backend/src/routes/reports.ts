import { Router } from "express";
import { monthlyReport } from "../services/report";
import { ensureMonth } from "../services/ensureMonth";
import Transaction from "../models/Transaction";

const router = Router();

// GET /api/reports/dashboard - Dados completos do dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const { period = "current", startDate, endDate, year, month } = req.query;

    let dateFilter: any = {};
    let currentPeriodFilter: any = {};
    let previousPeriodFilter: any = {};
    const now = new Date();

    // Se year e month foram fornecidos, usar período específico
    if (year && month) {
      const targetYear = Number(year);
      const targetMonth = Number(month);

      // Período atual (mês/ano selecionado)
      currentPeriodFilter = {
        year: targetYear,
        month: targetMonth,
      };

      // Período anterior (mês anterior)
      const prevDate = new Date(targetYear, targetMonth - 2, 1);
      previousPeriodFilter = {
        year: prevDate.getFullYear(),
        month: prevDate.getMonth() + 1,
      };

      // Filtro para saldo atual (apenas transações até hoje do mês selecionado)
      const endOfSelectedMonth = new Date(targetYear, targetMonth, 0);
      const today = new Date();
      const endDateForBalance =
        targetYear === now.getFullYear() && targetMonth === now.getMonth() + 1
          ? today
          : endOfSelectedMonth;

      dateFilter = {
        year: targetYear,
        month: targetMonth,
        date: { $lte: endDateForBalance },
      };
    } else {
      // Lógica original para períodos predefinidos
      switch (period) {
        case "current":
          currentPeriodFilter = {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
          };
          previousPeriodFilter = {
            year:
              now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
            month: now.getMonth() === 0 ? 12 : now.getMonth(),
          };
          dateFilter = {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            date: { $lte: now },
          };
          break;
        case "last3":
          const last3Months = new Date(
            now.getFullYear(),
            now.getMonth() - 3,
            1
          );
          dateFilter = {
            date: { $gte: last3Months, $lte: now },
          };
          break;
        case "last6":
          const last6Months = new Date(
            now.getFullYear(),
            now.getMonth() - 6,
            1
          );
          dateFilter = {
            date: { $gte: last6Months, $lte: now },
          };
          break;
        case "last12":
          const last12Months = new Date(
            now.getFullYear(),
            now.getMonth() - 12,
            1
          );
          dateFilter = {
            date: { $gte: last12Months, $lte: now },
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
          currentPeriodFilter = {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
          };
          previousPeriodFilter = {
            year:
              now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
            month: now.getMonth() === 0 ? 12 : now.getMonth(),
          };
          dateFilter = {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            date: { $lte: now },
          };
      }
    }

    // Buscar dados do período atual
    const currentTransactions = await Transaction.find(dateFilter).lean();
    const currentSummaryData = [
      {
        _id: "INCOME",
        total: currentTransactions
          .filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + (t.amount || t.plannedAmount || 0), 0),
        count: currentTransactions.filter((t) => t.type === "INCOME").length,
      },
      {
        _id: "EXPENSE",
        total: currentTransactions
          .filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + (t.amount || t.plannedAmount || 0), 0),
        count: currentTransactions.filter((t) => t.type === "EXPENSE").length,
      },
    ];

    // Buscar dados do período anterior para comparação (se não for período customizado)
    let previousSummaryData = [
      { _id: "INCOME", total: 0, count: 0 },
      { _id: "EXPENSE", total: 0, count: 0 },
    ];

    if (Object.keys(previousPeriodFilter).length > 0) {
      const previousTransactions = await Transaction.find(
        previousPeriodFilter
      ).lean();
      previousSummaryData = [
        {
          _id: "INCOME",
          total: previousTransactions
            .filter((t) => t.type === "INCOME")
            .reduce((sum, t) => sum + (t.amount || t.plannedAmount || 0), 0),
          count: previousTransactions.filter((t) => t.type === "INCOME").length,
        },
        {
          _id: "EXPENSE",
          total: previousTransactions
            .filter((t) => t.type === "EXPENSE")
            .reduce((sum, t) => sum + (t.amount || t.plannedAmount || 0), 0),
          count: previousTransactions.filter((t) => t.type === "EXPENSE")
            .length,
        },
      ];
    }

    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      incomeGrowth: 0,
      expenseGrowth: 0,
      savingsRate: 0,
      monthlyAverage: 0,
    };

    // Calcular totais do período atual
    currentSummaryData.forEach((item) => {
      if (item._id === "INCOME") {
        summary.totalIncome = item.total;
      } else if (item._id === "EXPENSE") {
        summary.totalExpenses = item.total;
      }
    });

    // Calcular totais do período anterior
    const previousIncome =
      previousSummaryData.find((item) => item._id === "INCOME")?.total || 0;
    const previousExpenses =
      previousSummaryData.find((item) => item._id === "EXPENSE")?.total || 0;

    // Calcular crescimento percentual
    summary.incomeGrowth =
      previousIncome > 0
        ? ((summary.totalIncome - previousIncome) / previousIncome) * 100
        : summary.totalIncome > 0
        ? 100
        : 0;

    summary.expenseGrowth =
      previousExpenses > 0
        ? ((summary.totalExpenses - previousExpenses) / previousExpenses) * 100
        : summary.totalExpenses > 0
        ? 100
        : 0;

    summary.netBalance = summary.totalIncome - summary.totalExpenses;
    summary.savingsRate =
      summary.totalIncome > 0
        ? (summary.netBalance / summary.totalIncome) * 100
        : 0;

    // Dados mensais para gráfico (últimos 6 meses)
    const monthlyData = [];
    const baseDate =
      year && month ? new Date(Number(year), Number(month) - 1, 1) : now;

    for (let i = 5; i >= 0; i--) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
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
        balance: income - expenses,
      });
    }

    // Dados por categoria (período atual)
    const categoryData: Array<{ category: string; amount: number }> = [];
    const categoryMap = new Map<string, number>();

    currentTransactions.forEach((transaction) => {
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
