import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavegadorComponent } from '../../components/navegador/navegador.component';
import { CardsComponent } from '../../components/cards/cards.component';
import { ApiService } from '../../services/api.service';
import { Conta } from '../../types/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    CommonModule,
    NavegadorComponent,
    CardsComponent
  ]
})
export class ProfileComponent implements OnInit {
  contasAbertas: Conta[] = [];
  isLoading = true;
  error: string | null = null;
  
  // Supondo que o nome do usuário viria de um serviço de autenticação
  nomeUsuario = 'Admin'; 

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.isLoading = true;
    this.apiService.getContasAbertas().subscribe({
      next: (data) => {
        this.contasAbertas = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Falha ao carregar as contas em aberto.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  get totalAberto(): number {
    return this.contasAbertas.reduce((acc, conta) => acc + conta.valor, 0);
  }
}
