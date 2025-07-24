// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // BehaviorSubject para manter o nome do usuário logado e emitir para quem se inscrever
  private _moradorNome = new BehaviorSubject<string | null>(null);
  // BehaviorSubject para manter o ID do usuário logado
  private _moradorId = new BehaviorSubject<number | null>(null);

  // Observable público para o nome do usuário
  moradorNome$: Observable<string | null> = this._moradorNome.asObservable();
  // Observable público para o ID do usuário
  moradorId$: Observable<number | null> = this._moradorId.asObservable();

  constructor() {
    // Tenta carregar o nome e ID do localStorage ao iniciar o serviço (se o usuário recarregar a página)
    const storedName = localStorage.getItem('moradorNome');
    const storedId = localStorage.getItem('moradorId');
    if (storedName) {
      this._moradorNome.next(storedName);
    }
    if (storedId) {
      this._moradorId.next(parseInt(storedId, 10));
    }
  }

  // Método para definir o usuário logado
  login(id: number, nome: string): void {
    this._moradorId.next(id);
    this._moradorNome.next(nome);
    localStorage.setItem('moradorId', id.toString()); // Salva no localStorage
    localStorage.setItem('moradorNome', nome); // Salva no localStorage
    // IMPORTANTE: Em um sistema real, aqui você também salvaria o token JWT.
  }

  // Método para fazer logout
  logout(): void {
    this._moradorId.next(null);
    this._moradorNome.next(null);
    localStorage.removeItem('moradorId'); // Remove do localStorage
    localStorage.removeItem('moradorNome'); // Remove do localStorage
    // IMPORTANTE: Remove o token JWT também.
  }

  // Getter para o nome atual do morador (síncrono)
  getMoradorNome(): string | null {
    return this._moradorNome.getValue();
  }

  // Getter para o ID atual do morador (síncrono)
  getMoradorId(): number | null {
    return this._moradorId.getValue();
  }
}