import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getTraceId } from '../utils/trace-context';

@Injectable()
export class HttpService {
  private readonly logger = new Logger(HttpService.name);
  private httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create();

    // Adiciona o traceId em todas as requisições
    this.httpClient.interceptors.request.use((config) => {
      config.headers['x-trace-id'] = getTraceId();
      return config;
    });
  }

  /**
   * Configura o cliente HTTP com URL base e timeout
   */
  configure(baseURL: string, timeout: number): void {
    this.httpClient = axios.create({
      baseURL,
      timeout,
    });

    // Readiciona o interceptor após reconfigurar
    this.httpClient.interceptors.request.use((config) => {
      config.headers['x-trace-id'] = getTraceId();
      return config;
    });
  }

  /**
   * Executa uma chamada GET para uma API
   * @param endpoint Endpoint a ser chamado
   * @param params Parâmetros adicionais para a requisição
   * @returns Resposta da API
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        params,
      };

      this.logger.debug(`Making API request to ${endpoint}`);
      const response = await this.httpClient.get<T>(endpoint, config);
      return response.data;
    } catch (error) {
      this.logger.error(
        `API call failed: ${error.message}`,
        error.response?.data
          ? JSON.stringify(error.response.data)
          : error.stack,
      );
      throw error;
    }
  }

  /**
   * Executa uma chamada POST para uma API
   * @param endpoint Endpoint a ser chamado
   * @param data Dados a serem enviados no corpo da requisição
   * @param params Parâmetros adicionais para a requisição
   * @returns Resposta da API
   */
  async post<T>(endpoint: string, data?: any, params?: Record<string, any>): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        params: params?.params,
        headers: params?.headers,
        timeout: params?.timeout
      };

      this.logger.debug(`Making API POST request to ${endpoint}`);
      const response = await this.httpClient.post<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      this.logger.error(
        `API POST call failed: ${error.message}`,
        error.response?.data
          ? JSON.stringify(error.response.data)
          : error.stack,
      );
      throw error;
    }
  }
}
