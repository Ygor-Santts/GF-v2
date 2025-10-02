import { apiService } from "./api";

export interface Financing {
  _id?: string;
  description: string;
  type: "LOAN" | "FINANCING" | "CREDIT_CARD";
  originalAmount: number;
  outstandingBalance: number;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancingPayment {
  _id?: string;
  financingId: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "PENDING" | "PAID" | "OVERDUE";
}

export interface EarlyPaymentSimulation {
  currentBalance: number;
  earlyPaymentAmount: number;
  interestSaved: number;
  monthsSaved: number;
  newEndDate: string;
}

class FinancingService {
  private readonly baseUrl = "/api/financing";

  // Listar financiamentos
  async getFinancings(): Promise<Financing[]> {
    return apiService.get<Financing[]>(this.baseUrl);
  }

  // Buscar financiamento por ID
  async getFinancingById(id: string): Promise<Financing> {
    return apiService.get<Financing>(`${this.baseUrl}/${id}`);
  }

  // Criar novo financiamento
  async createFinancing(
    financing: Omit<Financing, "_id" | "createdAt" | "updatedAt">
  ): Promise<Financing> {
    return apiService.post<Financing>(this.baseUrl, financing);
  }

  // Atualizar financiamento
  async updateFinancing(
    id: string,
    financing: Partial<Financing>
  ): Promise<Financing> {
    return apiService.put<Financing>(`${this.baseUrl}/${id}`, financing);
  }

  // Deletar financiamento
  async deleteFinancing(id: string): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Buscar parcelas de um financiamento
  async getFinancingPayments(financingId: string): Promise<FinancingPayment[]> {
    return apiService.get<FinancingPayment[]>(
      `${this.baseUrl}/${financingId}/payments`
    );
  }

  // Pagar parcela
  async payInstallment(
    financingId: string,
    installmentNumber: number,
    amount?: number
  ): Promise<FinancingPayment> {
    return apiService.post<FinancingPayment>(
      `${this.baseUrl}/${financingId}/pay`,
      {
        installmentNumber,
        amount,
      }
    );
  }

  // Simular pagamento antecipado
  async simulateEarlyPayment(
    financingId: string,
    amount: number
  ): Promise<EarlyPaymentSimulation> {
    return apiService.post<EarlyPaymentSimulation>(
      `${this.baseUrl}/${financingId}/simulate-early-payment`,
      {
        amount,
      }
    );
  }

  // Realizar pagamento antecipado
  async makeEarlyPayment(
    financingId: string,
    amount: number
  ): Promise<Financing> {
    return apiService.post<Financing>(
      `${this.baseUrl}/${financingId}/early-payment`,
      {
        amount,
      }
    );
  }

  // Estatísticas de financiamentos
  async getFinancingStats(): Promise<any> {
    return apiService.get<any>(`${this.baseUrl}/stats`);
  }
}

export const financingService = new FinancingService();
export default financingService;
