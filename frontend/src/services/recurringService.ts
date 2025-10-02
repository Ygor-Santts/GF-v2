import { apiService } from "./api";

export interface RecurringTransaction {
  _id?: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string;
  amount: number;
  dayOfMonth: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

class RecurringService {
  private readonly baseUrl = "/api/recurring";

  // Listar transações recorrentes
  async getRecurringTransactions(): Promise<RecurringTransaction[]> {
    return apiService.get<RecurringTransaction[]>(this.baseUrl);
  }

  // Buscar transação recorrente por ID
  async getRecurringById(id: string): Promise<RecurringTransaction> {
    return apiService.get<RecurringTransaction>(`${this.baseUrl}/${id}`);
  }

  // Criar nova transação recorrente
  async createRecurring(
    recurring: Omit<RecurringTransaction, "_id" | "createdAt" | "updatedAt">
  ): Promise<RecurringTransaction> {
    return apiService.post<RecurringTransaction>(this.baseUrl, recurring);
  }

  // Atualizar transação recorrente
  async updateRecurring(
    id: string,
    recurring: Partial<RecurringTransaction>
  ): Promise<RecurringTransaction> {
    return apiService.put<RecurringTransaction>(
      `${this.baseUrl}/${id}`,
      recurring
    );
  }

  // Deletar transação recorrente
  async deleteRecurring(id: string): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Ativar/Desativar transação recorrente
  async toggleActive(
    id: string,
    isActive: boolean
  ): Promise<RecurringTransaction> {
    return apiService.patch<RecurringTransaction>(
      `${this.baseUrl}/${id}/toggle`,
      { isActive }
    );
  }

  // Processar transações recorrentes (executar manualmente)
  async processRecurring(): Promise<{ processed: number; created: number }> {
    return apiService.post<{ processed: number; created: number }>(
      `${this.baseUrl}/process`
    );
  }
}

export const recurringService = new RecurringService();
export default recurringService;
