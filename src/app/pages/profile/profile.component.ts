import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavegadorComponent } from '../../components/navegador/navegador.component';
import { CardsComponent } from '../../components/cards/cards.component';
import { ApiService } from '../../services/api.service';
import { Conta } from '../../types/models';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

interface ProfileFilterForm {
  dataInicio: FormControl<string | null>;
  dataFim: FormControl<string | null>;
  situacao: FormControl<string | null>;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    CommonModule,
    NavegadorComponent,
    CardsComponent,
    RouterModule,
    ReactiveFormsModule
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {
  todasAsContas: Conta[] = [];
  contasEmAberto: Conta[] = [];
  contasPagas: Conta[] = [];

  contasDoMoradorLogadoSemFiltro: Conta[] = []; // contas do morador, sem filtro
  contasDoMoradorLogadoBase: Conta[] = []; // base para filtro
  filteredMinhasContas: Conta[] = []; // contas filtradas

  filterForm!: FormGroup<ProfileFilterForm>;
  situacoes: string[] = ['TODAS', 'PENDENTE', 'QUITADA', 'CANCELADA', 'EM_ABERTO', 'PAGO'];

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
    this.iniciarFormularioFiltro();

    this.authSubscription = this.authService.moradorNome$.subscribe(name => {
      this.nomeUsuario = name;
    });
    this.authSubscription.add(
      this.authService.moradorId$.subscribe(id => {
        this.moradorLogadoId = id;
      })
    );

    this.dataSubscription = this.authService.moradorToken$.subscribe((token: string | null) => {
      if (token) {
        this.loadTodasAsContas();
      } else {
        this.todasAsContas = [];
        this.contasEmAberto = [];
        this.contasPagas = [];
        this.contasDoMoradorLogadoSemFiltro = [];
        this.contasDoMoradorLogadoBase = [];
        this.filteredMinhasContas = [];
        this.isLoading = false;
        this.error = 'Você precisa estar logado para ver as contas. Faça login.';
        if (!this.authService.getMoradorNome()) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.dataSubscription?.unsubscribe();
  }

  iniciarFormularioFiltro(): void {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];

    this.filterForm = new FormGroup<ProfileFilterForm>({
      dataInicio: new FormControl(primeiroDiaMes),
      dataFim: new FormControl(ultimoDiaMes),
      situacao: new FormControl('TODAS')
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadTodasAsContas(): void {
    this.isLoading = true;
    this.error = null;

    if (!this.authService.getToken()) {
      this.isLoading = false;
      this.error = 'Não foi possível carregar as contas: Token de autenticação ausente ou inválido.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.apiService.getContas().subscribe({
      next: (data) => {
        this.todasAsContas = data;

        this.contasEmAberto = data.filter(conta => conta.situacao === 'PENDENTE' || conta.situacao === 'EM_ABERTO');
        this.contasPagas = data.filter(conta => conta.situacao === 'QUITADA' || conta.situacao === 'PAGO');

        if (this.moradorLogadoId) {
          this.contasDoMoradorLogadoSemFiltro = data.filter(conta =>
            conta.responsavelId === this.moradorLogadoId ||
            conta.rateios.some(rateio => rateio.moradorId === this.moradorLogadoId)
          );

          this.contasDoMoradorLogadoBase = [...this.contasDoMoradorLogadoSemFiltro];
          this.applyFilters();
        } else {
          this.contasDoMoradorLogadoSemFiltro = [];
          this.contasDoMoradorLogadoBase = [];
          this.filteredMinhasContas = [];
        }

        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Falha ao carregar as contas.';
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  applyFilters(): void {
    const { dataInicio, dataFim, situacao } = this.filterForm.value;
    let tempContas = [...this.contasDoMoradorLogadoBase];

    if (dataInicio) {
      const inicio = new Date(dataInicio);
      tempContas = tempContas.filter(conta => new Date(conta.dataVencimento) >= inicio);
    }
    if (dataFim) {
      const fim = new Date(dataFim);
      tempContas = tempContas.filter(conta => new Date(conta.dataVencimento) <= fim);
    }

    if (situacao && situacao !== 'TODAS') {
      tempContas = tempContas.filter(conta => conta.situacao === situacao);
    }

    this.filteredMinhasContas = tempContas;
  }

  limparFiltros(): void {
    this.filterForm.reset({
      dataInicio: null,
      dataFim: null,
      situacao: 'TODAS'
    });
    // Após reset, a função applyFilters() será chamada pelo valueChanges do formulário
    // Para garantir que todas as contas do morador apareçam:
    this.contasDoMoradorLogadoBase = [...this.todasAsContas];
    this.filteredMinhasContas = [...this.todasAsContas];

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
}
