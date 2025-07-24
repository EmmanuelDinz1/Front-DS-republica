// src/app/pages/profile/profile.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core'; // Adicionado OnDestroy para gerenciar inscrição
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor, pipes
import { NavegadorComponent } from '../../components/navegador/navegador.component'; // Seu componente de navegação
import { CardsComponent } from '../../components/cards/cards.component'; // Seu componente de cards
import { ApiService } from '../../services/api.service'; // Serviço para comunicação com o backend
import { Conta } from '../../types/models'; // Interface da Conta
import { Router, RouterModule } from '@angular/router'; // Serviço de roteamento do Angular e RouterModule para routerLink
import { AuthService } from '../../services/auth.service'; // Importar AuthService
import { Subscription } from 'rxjs'; // Importar Subscription para gerenciar a inscrição

@Component({
  selector: 'app-profile',
  standalone: true, // Componente standalone
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    CommonModule,
    NavegadorComponent,
    CardsComponent,
    RouterModule // MANTIDO: Necessário para os [routerLink] em seu template HTML
  ]
})
export class ProfileComponent implements OnInit, OnDestroy { // Implementar OnDestroy
  contasAbertas: Conta[] = []; // Array para armazenar as contas pendentes
  isLoading = true; // Flag para indicar estado de carregamento
  error: string | null = null; // Mensagem de erro, se houver

  nomeUsuario: string | null = null; // AGORA: Pode ser null inicialmente, será preenchido pelo AuthService
  private authSubscription: Subscription | undefined; // Para gerenciar a inscrição no AuthService

  constructor(
    private apiService: ApiService, // Injeta o serviço de API
    private router: Router, // Injeta o serviço de roteamento
    private authService: AuthService // INJETADO: Serviço de autenticação para obter o nome do usuário
  ) {}

  ngOnInit() {
    // Inscrever-se para receber o nome do usuário logado do AuthService
    // Isso garante que o nome seja atualizado se o usuário logar/deslogar ou recarregar a página
    this.authSubscription = this.authService.moradorNome$.subscribe(name => {
      this.nomeUsuario = name;
    });

    this.isLoading = true; // Define o estado de carregamento como verdadeiro
    // Chama o serviço para obter as contas em aberto
    this.apiService.getContasAbertas().subscribe({
      next: (data) => {
        this.contasAbertas = data; // Atribui os dados recebidos às contas em aberto
        this.isLoading = false; // Carregamento concluído
      },
      error: (err) => {
        this.error = 'Falha ao carregar as contas em aberto.'; // Define mensagem de erro
        this.isLoading = false; // Carregamento concluído
        console.error(err); // Loga o erro no console para depuração
        // Opcional: Redirecionar para login se a API retornar 401 ou 403 aqui
        // if (err.status === 401 || err.status === 403) {
        //   this.authService.logout();
        //   this.router.navigate(['/login']);
        // }
      }
    });
  }

  // ngOnDestroy é crucial para "desinscrever" de Observables e evitar vazamentos de memória
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Getter para calcular o total das contas em aberto
  get totalAberto(): number {
    return this.contasAbertas.reduce((acc, conta) => acc + conta.valor, 0);
  }

  // Método para navegar para a tela de edição de conta
  editConta(contaId: number): void {
    this.router.navigate(['/conta', contaId]); // Navega para a rota de edição de conta com o ID
  }

  // Lida com a ação do botão primário do navegador (Ex: Nova Conta)
  handlePrimaryNav(): void {
    this.router.navigate(['/conta']); // Navega para a rota de criação de conta
  }

  // Lida com a ação do botão secundário do navegador (Ex: Meu Perfil)
  handleSecondaryNav(): void {
    this.router.navigate(['/meuperfil']); // Navega para a rota do perfil do usuário
  }
}