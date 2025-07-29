// src/app/pages/mostrar-conta/mostrar-conta.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor, pipes
import { ActivatedRoute, Router } from '@angular/router'; // Para ler o ID da rota
import { ApiService } from '../../services/api.service';
import { Conta, Rateio } from '../../types/models'; // Importar Conta e Rateio
import { NavegadorComponent } from '../../components/navegador/navegador.component';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service'; // Importar AuthService
import { Subscription } from 'rxjs'; // Importar Subscription

@Component({
  selector: 'app-mostrar-conta',
  standalone: true,
  imports: [
    CommonModule,
    NavegadorComponent // Se for usar navegador na página de detalhes
  ],
  templateUrl: './mostrar-conta.component.html',
  styleUrls: ['./mostrar-conta.component.scss']
})
export class MostrarContaComponent implements OnInit, OnDestroy {

  conta: Conta | undefined; // Para armazenar os detalhes da conta
  isLoading = true;
  error: string | null = null;
  contaId: number | null = null;
  moradorLogadoId: number | null = null; // Ainda útil para saber quem está logado (se precisar no futuro)

  private authSubscription: Subscription | undefined; // Para gerenciar a inscrição no ID do morador logado

  constructor(
    private route: ActivatedRoute, // Para obter o ID da rota
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService // Injetar AuthService
  ) { }

  ngOnInit(): void {
    // Obter o ID do morador logado (ainda útil para saber quem está logado)
    this.authSubscription = this.authService.moradorId$.subscribe(id => {
      this.moradorLogadoId = id;
    });

    // Obter o ID da conta da URL e carregar detalhes
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.contaId = +idParam; // Converte string para number
        this.carregarDetalhesDaConta(this.contaId);
      } else {
        this.error = 'ID da conta não fornecido na URL.';
        this.isLoading = false;
        this.toastr.error(this.error);
        this.router.navigate(['/profile']); // Redireciona se não houver ID
      }
    });
  }

  // Desinscrever do Observable ao destruir o componente
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  carregarDetalhesDaConta(id: number): void {
    this.isLoading = true;
    this.apiService.getContaById(id).subscribe({
      next: (data) => {
        this.conta = data;
        this.isLoading = false;
        this.error = null;
        console.log('MostrarContaComponent: Detalhes da conta carregados:', data);
        // Verificação adicional para o TypeError em tipoConta/responsavel (se a API retornar objetos incompletos)
        if (data && (!data.tipoContaDescricao || !data.responsavelNome)) { // Acessando as novas propriedades
             console.warn('MostrarContaComponent: Objeto Conta pode estar incompleto (tipoContaDescricao/responsavelNome ausente).', data);
        }
      },
      error: (err: HttpErrorResponse) => { // 'err' tipado
        console.error('MostrarContaComponent: Erro ao carregar detalhes da conta (HTTP):', err);
        this.error = 'Não foi possível carregar os detalhes da conta.';
        this.toastr.error(this.error);
        this.isLoading = false;
        // Redireciona para o dashboard em caso de erro (ex: 404 Not Found, 403 Forbidden)
        if (err.status === 401 || err.status === 403) {
          this.toastr.warning('Sua sessão expirou ou acesso negado. Faça login novamente.');
          this.router.navigate(['/login']);
        } else if (err.status === 404) {
          this.toastr.error('Conta não encontrada.');
          this.router.navigate(['/profile']);
        } else {
          this.router.navigate(['/profile']);
        }
      }
    });
  }

  // MÉTODO: Navegar para a tela de edição (sem verificação de permissão aqui)
  editarConta(): void {
    if (this.contaId) {
      this.router.navigate(['/conta', this.contaId]); // Redireciona para a tela de edição
    } else {
        this.toastr.error('Não foi possível editar: ID da conta ausente.');
    }
  }

  // Método para navegar de volta (ex: para o dashboard)
  voltar(): void {
    this.router.navigate(['/profile']);
  }

  // Helper para obter o nome do morador pelo ID do rateio (se necessário)
  getMoradorNome(moradorId: number): string {
    if (this.conta && this.conta.rateios) {
        const rateio = this.conta.rateios.find(r => r.moradorId === moradorId);
        return rateio ? rateio.moradorNome : 'Desconhecido';
    }
    return 'Desconhecido';
  }
}