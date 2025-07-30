// src/app/services/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  Morador, MoradorDTO,
  Conta, ContaDTO,
  TipoConta, TipoContaDTO,
  GastoPorTipo, Historico,
  LoginRequest, LoginResponse,
  SaldoMoradorDTO
} from '../types/models';

import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // agora pega dinamicamente de environment.ts ou environment.prod.ts
  private readonly API_BASE_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    if (error.status >= 200 && error.status < 300) {
      console.log('Requisição bem‑sucedida, mas erro no handleError:', error);
      return throwError(() => new Error('Requisição HTTP bem‑sucedida, mas com processamento inesperado.'));
    }

    let errorMessage = 'Ocorreu um erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.status) {
        errorMessage = `Código do erro: ${error.status}`;
        if (error.statusText) {
          errorMessage += ` – ${error.statusText}`;
        }
        if (error.message) {
          errorMessage += `\nMensagem: ${error.message}`;
        }
      } else {
        errorMessage = 'Erro de rede ou conexão.';
      }
    }

    console.error('Erro na API Service:', errorMessage);
    return throwError(() => new Error('Falha na comunicação com o servidor. Verifique o console para mais detalhes.'));
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // --- MORADOR ---
  getMoradores(): Observable<Morador[]> {
    return this.http.get<Morador[]>(`${this.API_BASE_URL}/moradores`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getMoradorById(id: number): Observable<Morador> {
    return this.http.get<Morador>(`${this.API_BASE_URL}/moradores/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createMorador(data: MoradorDTO): Observable<Morador> {
    return this.http.post<Morador>(`${this.API_BASE_URL}/moradores`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateMorador(id: number, data: MoradorDTO): Observable<Morador> {
    return this.http.put<Morador>(`${this.API_BASE_URL}/moradores/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteMorador(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/moradores/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSaldosMoradores(): Observable<SaldoMoradorDTO[]> {
    return this.http.get<SaldoMoradorDTO[]>(`${this.API_BASE_URL}/moradores/saldos`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // --- TIPO DE CONTA ---
  getTiposConta(): Observable<TipoConta[]> {
    return this.http.get<TipoConta[]>(`${this.API_BASE_URL}/tipos`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createTipoConta(data: TipoContaDTO): Observable<TipoConta> {
    return this.http.post<TipoConta>(`${this.API_BASE_URL}/tipos`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateTipoConta(id: number, data: TipoContaDTO): Observable<TipoConta> {
    return this.http.put<TipoConta>(`${this.API_BASE_URL}/tipos/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteTipoConta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/tipos/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // --- CONTA ---
  getContas(): Observable<Conta[]> {
    return this.http.get<Conta[]>(`${this.API_BASE_URL}/contas`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getContaById(id: number): Observable<Conta> {
    return this.http.get<Conta>(`${this.API_BASE_URL}/contas/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createConta(data: ContaDTO): Observable<Conta> {
    return this.http.post<Conta>(`${this.API_BASE_URL}/contas`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateConta(id: number, data: ContaDTO): Observable<Conta> {
    return this.http.put<Conta>(`${this.API_BASE_URL}/contas/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteConta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/contas/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getContasAbertas(): Observable<Conta[]> {
    return this.http.get<Conta[]>(`${this.API_BASE_URL}/contas/abertas`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getGastosPorTipo(): Observable<GastoPorTipo[]> {
    return this.http.get<GastoPorTipo[]>(`${this.API_BASE_URL}/contas/gastos/por-tipo`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getExtrato(dataInicio: string, dataFim: string): Observable<Conta[]> {
    return this.http.get<Conta[]>(`${this.API_BASE_URL}/contas/extrato`, {
      headers: this.getHeaders(),
      params: { dataInicio, dataFim }
    }).pipe(catchError(this.handleError));
  }

  // --- HISTÓRICO ---
  getHistoricos(): Observable<Historico[]> {
    return this.http.get<Historico[]>(`${this.API_BASE_URL}/historicos`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getHistoricosByConta(contaId: number): Observable<Historico[]> {
    return this.http.get<Historico[]>(`${this.API_BASE_URL}/historicos/conta/${contaId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // --- AUTENTICAÇÃO ---
  authenticate(credentials: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<LoginResponse>(`${this.API_BASE_URL}/moradores/auth`, credentials, { headers })
      .pipe(catchError(this.handleError));
  }

  // --- Recuperação de Senha ---
  recuperarSenha(email: string): Observable<string> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.API_BASE_URL}/moradores/recuperar`, { email }, { headers, responseType: 'text' })
      .pipe(catchError(this.handleError));
  }
}
