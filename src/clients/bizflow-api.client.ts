import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import logger from '../utils/logger';

export class BizflowApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar el token de autenticación
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        logger.error('Error en la configuración de la petición:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar respuestas
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('Error en la respuesta de la API:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  // Método para establecer el token de autenticación
  setToken(token: string) {
    this.token = token;
  }

  // Método para limpiar el token
  clearToken() {
    this.token = null;
  }

  // Métodos genéricos para peticiones HTTP
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Métodos específicos para la API de Bizflow
  async authenticate(credentials: { email: string; password: string }): Promise<{ token: string }> {
    try {
      const response = await this.post<{ token: string }>('/auth/login', credentials);
      this.setToken(response.token);
      return response;
    } catch (error) {
      logger.error('Error en la autenticación:', error);
      throw error;
    }
  }

  async getAutomatedContent(id: string) {
    return this.get(`/automated-content/${id}`);
  }

  async listAutomatedContent(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }) {
    return this.get('/automated-content', { params });
  }

  async createAutomatedContent(data: {
    title: string;
    content: string;
    type: string;
    metadata?: Record<string, any>;
  }) {
    return this.post('/automated-content', data);
  }

  async updateAutomatedContent(id: string, data: {
    title?: string;
    content?: string;
    type?: string;
    metadata?: Record<string, any>;
  }) {
    return this.put(`/automated-content/${id}`, data);
  }

  async deleteAutomatedContent(id: string) {
    return this.delete(`/automated-content/${id}`);
  }

  async validateContent(data: {
    title: string;
    content: string;
    type: string;
  }) {
    return this.post('/automated-content/validate', data);
  }

  async processContent(data: {
    content: string;
    options?: {
      generateExcerpt?: boolean;
      calculateReadability?: boolean;
      suggestTags?: boolean;
    };
  }) {
    return this.post('/automated-content/process', data);
  }

  async getMetrics(params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }) {
    return this.get('/metrics', { params });
  }

  async getSystemStatus() {
    return this.get('/monitoring/status');
  }
} 