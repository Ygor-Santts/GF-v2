import { apiService } from "./api";

export interface DashboardData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    incomeGrowth: number;
    expenseGrowth: number;
    savingsRate: number;
    monthlyAverage: number;
  };
  monthlyData: Array<{
    month: string;
    income: number;
    expenses: number;
    balance: number;
  }>;
  categoryData: Array<{
    category: string;
    amount: number;
    percentage: number;
    type: "INCOME" | "EXPENSE";
  }>;
  recentTransactions: Array<any>;
}

export interface ReportFilters {
  period?: "current" | "last3" | "last6" | "last12" | "custom";
  startDate?: string;
  endDate?: string;
  type?: "INCOME" | "EXPENSE";
  category?: string;
}

export interface MonthlyReport {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export interface CategoryReport {
  category: string;
  type: "INCOME" | "EXPENSE";
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  monthlyData: Array<{
    month: string;
    amount: number;
  }>;
}

export interface FinancialInsights {
  insights: string[];
  recommendations: string[];
  alerts: string[];
  goals: Array<{
    name: string;
    target: number;
    current: number;
    progress: number;
    deadline?: string;
  }>;
}

class ReportsService {
  private readonly baseUrl = "/api/reports";

  // Dados do dashboard
  async getDashboardData(filters?: ReportFilters): Promise<DashboardData> {
    return apiService.get<DashboardData>(`${this.baseUrl}/dashboard`, filters);
  }

  // Relatório mensal
  async getMonthlyReport(filters?: ReportFilters): Promise<MonthlyReport[]> {
    return apiService.get<MonthlyReport[]>(`${this.baseUrl}/monthly`, filters);
  }

  // Relatório por categoria
  async getCategoryReport(filters?: ReportFilters): Promise<CategoryReport[]> {
    return apiService.get<CategoryReport[]>(
      `${this.baseUrl}/categories`,
      filters
    );
  }

  // Insights financeiros
  async getFinancialInsights(
    filters?: ReportFilters
  ): Promise<FinancialInsights> {
    return apiService.get<FinancialInsights>(
      `${this.baseUrl}/insights`,
      filters
    );
  }

  // Comparação de períodos
  async getPeriodComparison(period1: string, period2: string): Promise<any> {
    return apiService.get<any>(`${this.baseUrl}/comparison`, {
      period1,
      period2,
    });
  }

  // Projeções financeiras
  async getFinancialProjections(months: number = 12): Promise<any> {
    return apiService.get<any>(`${this.baseUrl}/projections`, { months });
  }

  // Exportar relatório
  async exportReport(
    format: "pdf" | "excel" | "csv",
    filters?: ReportFilters
  ): Promise<Blob> {
    // Note: This would need to be implemented with direct axios call
    // since our apiService doesn't expose the raw axios instance
    throw new Error("Export functionality not implemented yet");
  }

  // Análise de tendências
  async getTrendAnalysis(period: string = "last12"): Promise<any> {
    return apiService.get<any>(`${this.baseUrl}/trends`, { period });
  }

  // Metas financeiras
  async getFinancialGoals(): Promise<any> {
    return apiService.get<any>(`${this.baseUrl}/goals`);
  }

  async createFinancialGoal(goal: any): Promise<any> {
    return apiService.post<any>(`${this.baseUrl}/goals`, goal);
  }

  async updateFinancialGoal(id: string, goal: any): Promise<any> {
    return apiService.put<any>(`${this.baseUrl}/goals/${id}`, goal);
  }

  async deleteFinancialGoal(id: string): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/goals/${id}`);
  }
}

export const reportsService = new ReportsService();
export default reportsService;
