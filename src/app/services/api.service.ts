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
    LoginRequest, // Importar LoginRequest
    SaldoMoradorDTO // Importar SaldoMoradorDTO, pois você tem um método para ele
} from '../types/models'; // Certifique-se de que todas essas interfaces estão no models.ts

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    // URL base da API do backend
    private readonly API_BASE_URL = 'https://trabalho-ds-republica.onrender.com/api';
    // Token de autenticação Basic Auth (Base64 de admin:123456)
    // ATENÇÃO: Em uma aplicação real, este token não seria fixo aqui!
    // Ele viria de um processo de login real (ex: JWT) e seria armazenado de forma segura.
    private readonly AUTH_TOKEN = 'YWRtaW46MTIzNDU2';

    constructor(private http: HttpClient) { }

    // Método privado para obter os cabeçalhos comuns (Content-Type e Authorization para Basic Auth)
    private getHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Basic ${this.AUTH_TOKEN}`
        });
    }

    // Manipulador de erros centralizado para requisições HTTP
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Ocorreu um erro desconhecido!';
        if (error.error instanceof ErrorEvent) {
            // Erro do lado do cliente ou de rede
            errorMessage = `Erro: ${error.error.message}`;
        } else {
            // Erro do lado do servidor (resposta HTTP)
            // Se o back-end retornar uma mensagem de erro no corpo (string ou objeto com 'message')
            if (error.error && typeof error.error === 'string') {
                errorMessage = error.error; // Ex: "Credenciais inválidas" ou outra mensagem de erro do backend
            } else if (error.error && error.error.message) {
                errorMessage = error.error.message; // Para DTOs de erro mais complexos do backend
            } else if (error.status) {
                errorMessage = `Código do erro: ${error.status}`;
                if (error.statusText) {
                    errorMessage += ` - ${error.statusText}`;
                }
                if (error.message) {
                    errorMessage += `\nMensagem: ${error.message}`;
                }
            } else {
                errorMessage = `Erro de rede ou conexão.`;
            }
        }
        console.error("Erro na API Service:", errorMessage); // Log mais detalhado
        // Retorna um erro observável que pode ser capturado por quem chamou o serviço
        return throwError(() => new Error('Falha na comunicação com o servidor. Verifique o console para mais detalhes.'));
    }

    // --- MORADOR ENDPOINTS ---
    getMoradores(): Observable<Morador[]> {
        return this.http.get<Morador[]>(`${this.API_BASE_URL}/moradores`, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    getMoradorById(id: number): Observable<Morador> {
        return this.http.get<Morador>(`${this.API_BASE_URL}/moradores/${id}`, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    createMorador(data: MoradorDTO): Observable<Morador> {
        return this.http.post<Morador>(`${this.API_BASE_URL}/moradores`, data, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    updateMorador(id: number, data: MoradorDTO): Observable<Morador> {
        return this.http.put<Morador>(`${this.API_BASE_URL}/moradores/${id}`, data, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    deleteMorador(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_BASE_URL}/moradores/${id}`, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    getSaldosMoradores(): Observable<SaldoMoradorDTO[]> {
        return this.http.get<SaldoMoradorDTO[]>(`${this.API_BASE_URL}/moradores/saldos`, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    // --- TIPO DE CONTA ENDPOINTS ---
    getTiposConta(): Observable<TipoConta[]> {
        return this.http.get<TipoConta[]>(`${this.API_BASE_URL}/tipos`, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    createTipoConta(data: TipoContaDTO): Observable<TipoConta> {
        return this.http.post<TipoConta>(`${this.API_BASE_URL}/tipos`, data, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    updateTipoConta(id: number, data: TipoContaDTO): Observable<TipoConta> {
        return this.http.put<TipoConta>(`${this.API_BASE_URL}/tipos/${id}`, data, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    deleteTipoConta(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_BASE_URL}/tipos/${id}`, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    // --- CONTA ENDPOINTS ---
    getContas(): Observable<Conta[]> {
        return this.http.get<Conta[]>(`${this.API_BASE_URL}/contas`, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    getContaById(id: number): Observable<Conta> {
        return this.http.get<Conta>(`${this.API_BASE_URL}/contas/${id}`, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    createConta(data: ContaDTO): Observable<Conta> {
        return this.http.post<Conta>(`${this.API_BASE_URL}/contas`, data, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    updateConta(id: number, data: ContaDTO): Observable<Conta> {
        return this.http.put<Conta>(`${this.API_BASE_URL}/contas/${id}`, data, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    deleteConta(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_BASE_URL}/contas/${id}`, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    getContasAbertas(): Observable<Conta[]> {
        return this.http.get<Conta[]>(`${this.API_BASE_URL}/contas/abertas`, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    getGastosPorTipo(): Observable<GastoPorTipo[]> {
        return this.http.get<GastoPorTipo[]>(`${this.API_BASE_URL}/contas/gastos/por-tipo`, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    getExtrato(dataInicio: string, dataFim: string): Observable<Conta[]> {
        // Formato esperado pelo backend: YYYY-MM-DD
        return this.http.get<Conta[]>(`${this.API_BASE_URL}/contas/extrato?dataInicio=${dataInicio}&dataFim=${dataFim}`, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    // --- HISTÓRICO ENDPOINTS ---
    getHistoricos(): Observable<Historico[]> {
        return this.http.get<Historico[]>(`${this.API_BASE_URL}/historicos`, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    getHistoricosByConta(contaId: number): Observable<Historico[]> {
        return this.http.get<Historico[]>(`${this.API_BASE_URL}/historicos/conta/${contaId}`, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError.bind(this)));
    }

    // --- AUTENTICAÇÃO ENDPOINT (para /api/moradores/auth) ---
    authenticate(credentials: LoginRequest): Observable<string> {
        // Para o endpoint /api/moradores/auth (login), o backend não exige um cabeçalho 'Authorization' prévio
        // (porque ele está permitAll() no SecurityConfig e você está enviando as credenciais no corpo).
        // Se este endpoint fosse protegido por CORS, teríamos que garantir que 'Content-Type' fosse permitido.
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            // NÃO inclua 'Authorization' aqui, pois é a própria autenticação que estamos fazendo.
            // O backend autentica com base no email/senha do corpo da requisição.
        });

        // O backend retorna uma String ("Autenticado com sucesso" ou "Credenciais inválidas")
        // Usamos { responseType: 'text' as 'json' } para que o HttpClient não tente parsear como JSON por padrão.
        return this.http.post(`${this.API_BASE_URL}/moradores/auth`, credentials, { headers, responseType: 'text' })
            .pipe(
                catchError(this.handleError.bind(this))
            );
    }

    // --- Recuperação de Senha (Stub) ---
    recuperarSenha(email: string): Observable<string> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        // O backend espera um Map<String, String>, então enviamos um objeto JSON com o email
        return this.http.post(`${this.API_BASE_URL}/moradores/recuperar`, { email: email }, { headers, responseType: 'text' })
            .pipe(catchError(this.handleError.bind(this)));
    }
}