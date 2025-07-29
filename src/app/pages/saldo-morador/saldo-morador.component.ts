import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { SaldoMoradorDTO } from '../../types/models';
import { NavegadorComponent } from '../../components/navegador/navegador.component';
import { ToastrService } from 'ngx-toastr';
import { Router , RouterLink } from '@angular/router';

@Component({
  selector: 'app-saldo-morador',
  standalone: true,
  imports: [
    CommonModule,
    NavegadorComponent,
    RouterLink
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
    private toastr: ToastrService,
    private router: Router // 2. Injete o Router no construtor
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

  // 3. Adicione a função para navegar
  voltarAoDashboard(): void {
    this.router.navigate(['/profile']);
  }
}
