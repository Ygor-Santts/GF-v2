import axios, { AxiosInstance, AxiosResponse } from "axios";

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptors para request
    this.api.interceptors.request.use(
      (config) => {
        // Adicionar token de autenticação se existir
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptors para response
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        // Tratamento global de erros
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos HTTP genéricos
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.patch(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete(url);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
