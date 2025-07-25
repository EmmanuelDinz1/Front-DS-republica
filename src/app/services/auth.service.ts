// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _moradorNome = new BehaviorSubject<string | null>(null);
  private _moradorId = new BehaviorSubject<number | null>(null);
  private _moradorToken = new BehaviorSubject<string | null>(null); // <--- NOVO: Token JWT

  moradorNome$: Observable<string | null> = this._moradorNome.asObservable();
  moradorId$: Observable<number | null> = this._moradorId.asObservable();
  moradorToken$: Observable<string | null> = this._moradorToken.asObservable(); // <--- NOVO Observable para o token

  constructor() {
    const storedName = localStorage.getItem('moradorNome');
    const storedId = localStorage.getItem('moradorId');
    const storedToken = localStorage.getItem('moradorToken'); // <--- NOVO

    if (storedName) { this._moradorNome.next(storedName); }
    if (storedId) { this._moradorId.next(parseInt(storedId, 10)); }
    if (storedToken) { this._moradorToken.next(storedToken); } // <--- NOVO
  }

  // Método para definir o usuário logado com o TOKEN JWT
  login(id: number, nome: string, token: string): void { // <--- Adicionado 'token' como argumento
    this._moradorId.next(id);
    this._moradorNome.next(nome);
    this._moradorToken.next(token); // <--- NOVO

    localStorage.setItem('moradorId', id.toString());
    localStorage.setItem('moradorNome', nome);
    localStorage.setItem('moradorToken', token); // <--- NOVO
  }

  logout(): void {
    this._moradorId.next(null);
    this._moradorNome.next(null);
    this._moradorToken.next(null); // <--- NOVO

    localStorage.removeItem('moradorId');
    localStorage.removeItem('moradorNome');
    localStorage.removeItem('moradorToken'); // <--- NOVO
  }

  getMoradorNome(): string | null { return this._moradorNome.getValue(); }
  getMoradorId(): number | null { return this._moradorId.getValue(); }
  getToken(): string | null { return this._moradorToken.getValue(); } // <--- NOVO GETTER para o token
}