// src/app/pages/profile/profile.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavegadorComponent } from '../../components/navegador/navegador.component';
import { CardsComponent } from '../../components/cards/cards.component';
import { ApiService } from '../../services/api.service';
import { Conta } from '../../types/models'; // Interface Conta foi corrigida
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    CommonModule,
    NavegadorComponent,
    CardsComponent,
    RouterModule
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {
  todasAsContas: Conta[] = [];
  contasEmAberto: Conta[] = [];
  contasDoMoradorLogado: Conta[] = [];
  contasPagas: Conta[] = [];

  isLoading = true;
  error: string | null = null;

  nomeUsuario: string | null = null;
  moradorLogadoId: number | null = null;

  private authSubscription: Subscription | undefined;
  private dataSubscription: Subscription | undefined;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.moradorNome$.subscribe(name => {
      this.nomeUsuario = name;
    });
    this.authSubscription.add(
      this.authService.moradorId$.subscribe(id => {
        this.moradorLogadoId = id;
      })
    );

    this.dataSubscription = this.authService.moradorToken$.subscribe((token: string | null) => {
        console.log('ProfileComponent: Token no AuthService (ngOnInit):', token ? 'Presente (parcial): ' + token.substring(0,10) + '...' : 'Nulo');
        if (token) {
            this.loadTodasAsContas();
        } else {
            this.todasAsContas = [];
            this.contasEmAberto = [];
            this.contasDoMoradorLogado = [];
            this.contasPagas = [];
            this.isLoading = false;
            this.error = 'Você precisa estar logado para ver as contas. Faça login.';
            console.warn('ProfileComponent: Nenhuma ação para carregar contas sem token. Redirecionando...');
            if (!this.authService.getMoradorNome()) {
              this.router.navigate(['/login']);
            }
        }
    });
  }

  loadTodasAsContas(): void {
    this.isLoading = true;
    this.error = null;
    
    if (!this.authService.getToken()) {
        console.warn('ProfileComponent: Tentativa de carregar contas sem token válido no momento da chamada API.');
        this.isLoading = false;
        this.error = 'Não foi possível carregar as contas: Token de autenticação ausente ou inválido.';
        this.authService.logout();
        this.router.navigate(['/login']);
        return;
    }

    this.apiService.getContas().subscribe({
      next: (data) => {
        this.todasAsContas = data;
        
        this.contasEmAberto = data.filter(conta => conta.situacao === 'PENDENTE');
        this.contasPagas = data.filter(conta => conta.situacao === 'QUITADA');

        if (this.moradorLogadoId) {
            // <--- CORREÇÃO AQUI: Acessando responsavelId diretamente
            this.contasDoMoradorLogado = data.filter(conta => 
                // Usa responsavelId e não responsavel.id
                conta.responsavelId === this.moradorLogadoId ||
                // Usa moradorId, que já estava correto
                conta.rateios.some(rateio => rateio.moradorId === this.moradorLogadoId)
            );
        } else {
            this.contasDoMoradorLogado = [];
            console.warn('ProfileComponent: ID do morador logado não disponível para filtrar contas incluídas.');
        }

        this.isLoading = false;
        console.log('ProfileComponent: Todas as contas carregadas:', data);
        console.log('ProfileComponent: Contas do Morador Logado (filtradas):', this.contasDoMoradorLogado);
        console.log('ProfileComponent: Contas Pagas (filtradas):', this.contasPagas);

        // Verificação de depuração de dados (usando as novas propriedades achatadas)
        if (data && data.length > 0) {
            const firstConta = data[0];
            if (!firstConta.tipoContaDescricao) { // Verifica tipoContaDescricao
                console.warn('ProfileComponent: Dados de contas podem estar incompletos (tipoContaDescricao ausente na resposta da API).');
            }
            if (!firstConta.responsavelNome) { // Verifica responsavelNome
                console.warn('ProfileComponent: Dados de contas podem estar incompletos (responsavelNome ausente na resposta da API).');
            }
        } else {
            console.log('ProfileComponent: Nenhuma conta retornada pela API.');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Falha ao carregar as contas.';
        this.isLoading = false;
        console.error('ProfileComponent: Erro ao carregar contas (HTTP):', err);
        if (err.status === 401 || err.status === 403) {
          console.warn('ProfileComponent: Token inválido ou acesso negado. Fazendo logout.');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  get totalAberto(): number {
    return this.contasEmAberto.reduce((acc, conta) => acc + conta.valor, 0);
  }

  get totalAbertoDoMoradorLogado(): number {
    return this.contasDoMoradorLogado
               .filter(conta => conta.situacao === 'PENDENTE' || conta.situacao === 'EM_ABERTO')
               .reduce((acc, conta) => acc + conta.valor, 0);
  }

  get numContasAbertasDoMoradorLogado(): number {
    return this.contasDoMoradorLogado.filter(conta => conta.situacao === 'PENDENTE' || conta.situacao === 'EM_ABERTO').length;
  }

  mostrarConta(contaId: number): void {
    this.router.navigate(['/mostrar-conta', contaId]);
  }

  editConta(contaId: number): void {
    this.router.navigate(['/conta', contaId]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  handlePrimaryNav(): void {
    this.logout();
  }

  handleSecondaryNav(): void {
    this.router.navigate(['/meuperfil']);
  }

  handleThirdNav(): void {
    this.router.navigate(['/extrato']);
  }
}