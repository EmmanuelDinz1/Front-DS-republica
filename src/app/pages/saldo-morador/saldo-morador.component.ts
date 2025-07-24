// src/app/pages/saldo-morador/saldo-morador.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor, currency pipe
import { ApiService } from '../../services/api.service';
import { SaldoMoradorDTO } from '../../types/models'; // Importe a interface do DTO
import { NavegadorComponent } from '../../components/navegador/navegador.component'; // Se for usar navegador na página
import { ToastrService } from 'ngx-toastr'; // Para feedback de erro

@Component({
  selector: 'app-saldo-morador',
  standalone: true,
  imports: [
    CommonModule,
    NavegadorComponent // Inclua se for usar
  ],
  templateUrl: './saldo-morador.component.html',
  styleUrls: ['./saldo-morador.component.scss']
})
export class SaldoMoradorComponent implements OnInit {

  saldos: SaldoMoradorDTO[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.carregarSaldos();
  }

  carregarSaldos(): void {
    this.isLoading = true;
    this.apiService.getSaldosMoradores().subscribe({
      next: (data) => {
        this.saldos = data;
        this.isLoading = false;
        this.error = null; // Limpa qualquer erro anterior
      },
      error: (err) => {
        console.error('Erro ao carregar saldos dos moradores:', err);
        this.error = 'Não foi possível carregar os saldos. Tente novamente mais tarde.';
        this.toastr.error(this.error);
        this.isLoading = false;
      }
    });
  }
}