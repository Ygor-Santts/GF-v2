import { apiService } from "./api";

export interface Transaction {
  _id?: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string;
  plannedAmount?: number;
  amount?: number;
  status: "PLANNED" | "PAID" | "CANCELLED";
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionFilters {
  type?: "INCOME" | "EXPENSE";
  category?: string;
  status?: "PLANNED" | "PAID" | "CANCELLED";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TransactionResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

class TransactionService {
  private readonly baseUrl = "/api/transactions";

  // Listar transações com filtros
  async getTransactions(
    filters?: TransactionFilters
  ): Promise<TransactionResponse> {
    return apiService.get<TransactionResponse>(this.baseUrl, filters);
  }

  // Buscar transação por ID
  async getTransactionById(id: string): Promise<Transaction> {
    return apiService.get<Transaction>(`${this.baseUrl}/${id}`);
  }

  // Criar nova transação
  async createTransaction(
    transaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">
  ): Promise<Transaction> {
    return apiService.post<Transaction>(this.baseUrl, transaction);
  }

  // Atualizar transação
  async updateTransaction(
    id: string,
    transaction: Partial<Transaction>
  ): Promise<Transaction> {
    return apiService.put<Transaction>(`${this.baseUrl}/${id}`, transaction);
  }

  // Deletar transação
  async deleteTransaction(id: string): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Marcar transação como paga
  async markAsPaid(id: string, amount?: number): Promise<Transaction> {
    return apiService.patch<Transaction>(`${this.baseUrl}/${id}/pay`, {
      amount,
    });
  }

  // Cancelar transação
  async cancelTransaction(id: string): Promise<Transaction> {
    return apiService.patch<Transaction>(`${this.baseUrl}/${id}/cancel`);
  }

  // Buscar transações recentes
  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    return apiService.get<Transaction[]>(`${this.baseUrl}/recent`, { limit });
  }

  // Estatísticas de transações
  async getTransactionStats(period?: string): Promise<any> {
    return apiService.get<any>(`${this.baseUrl}/stats`, { period });
  }
}

export const transactionService = new TransactionService();
export default transactionService;
