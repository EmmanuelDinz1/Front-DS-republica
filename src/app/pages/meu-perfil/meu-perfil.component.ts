// src/app/pages/meu-perfil/meu-perfil.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core'; // Adicionado OnDestroy
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NavegadorComponent } from '../../components/navegador/navegador.component';
import { ApiService } from '../../services/api.service';
import { Morador, MoradorDTO } from '../../types/models';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service'; // <--- Importar AuthService
import { Subscription } from 'rxjs'; // <--- Importar Subscription
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-meu-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavegadorComponent, RouterModule],
  templateUrl: './meu-perfil.component.html',
  styleUrls: ['./meu-perfil.component.scss']
})
export class MeuperfilComponent implements OnInit, OnDestroy { // Implementar OnDestroy
  
  perfilForm!: FormGroup;
  isLoading = true;
  moradorId: number | null = null; // <--- AGORA PODE SER NULL
  private authSubscription: Subscription | undefined; // <--- Para gerenciar a inscrição

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastr: ToastrService,
    private authService: AuthService // <--- Injetar AuthService
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();
    // Se inscrever para receber o ID do morador logado
    this.authSubscription = this.authService.moradorId$.subscribe(id => {
      this.moradorId = id;
      if (this.moradorId) { // Só carrega os dados se tiver um ID de morador
        this.carregarDadosMorador();
      } else {
        // Se não houver ID (não logado ou deslogou), desabilita carregamento e mostra erro
        this.toastr.error('Nenhum morador logado para carregar o perfil.');
        this.isLoading = false;
        // Opcional: redirecionar para a tela de login
        // this.router.navigate(['/login']);
      }
    });
  }

  // <--- NOVO: Método para desinscrever do Observable ao destruir o componente
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  iniciarFormulario(morador?: Morador): void {
    this.perfilForm = new FormGroup({
      nome: new FormControl(morador?.nome || '', [Validators.required]),
      email: new FormControl(morador?.email || '', [Validators.required, Validators.email]),
      cpf: new FormControl(morador?.cpf || '', [Validators.required]),
      dataNascimento: new FormControl(this.formatDate(morador?.dataNascimento), [Validators.required]),
      celular: new FormControl(morador?.celular || '', [Validators.required]),
      contatosFamilia: new FormControl(morador?.contatosFamilia || ''),
    });
  }
  
  carregarDadosMorador(): void {
    // A NOTA agora se refere a como o ID é obtido dinamicamente.
    // O ID do morador vem do AuthService.
    if (!this.moradorId) {
      this.toastr.error('ID do morador não disponível para carregar perfil.');
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.apiService.getMoradorById(this.moradorId).subscribe({ // Usa o ID dinâmico
      next: (data) => {
        this.iniciarFormulario(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Não foi possível carregar os dados do perfil.');
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  salvar(): void {
    if (this.perfilForm.invalid) {
      this.toastr.warning('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!this.moradorId) { // Garante que há um ID para atualizar
      this.toastr.error('Não foi possível atualizar o perfil: ID do morador não encontrado.');
      return;
    }

    const formData = this.perfilForm.value;
    const moradorDto: MoradorDTO = {
      // Data de nascimento precisa ser string no formato ISO para o backend
      ...formData,
      dataNascimento: new Date(formData.dataNascimento).toISOString().split('T')[0] // Garante formato YYYY-MM-DD
    };
    
    this.apiService.updateMorador(this.moradorId, moradorDto).subscribe({ // Usa o ID dinâmico
      next: () => {
        this.toastr.success('Perfil atualizado com sucesso!');
        // Opcional: Atualizar o nome no AuthService caso o nome tenha sido alterado
        this.authService.login(this.moradorId!, moradorDto.nome ?? ''); 
      },
      error: (err) => {
        this.toastr.error('Falha ao atualizar o perfil.');
        console.error(err);
      }
    });
  }
  
  // Helper para formatar a data para o input type="date"
  private formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  alterarSenha(): void {
    this.toastr.info('Funcionalidade de alterar senha ainda não implementada.');
  }

  desativarConta(): void {
    this.toastr.warning('Cuidado! Ação de desativar a conta não pode ser desfeita.');
    // Aqui você adicionaria a lógica para chamar a API para desativar a conta
  }
  handlePrimaryNav(): void {
    this.router.navigate(['/profile']); // Navega para a rota de criação de conta
  }

  // Lida com a ação do botão secundário do navegador (Ex: Meu Perfil)
  handleSecondaryNav(): void {
    this.router.navigate(['/profile']); // Navega para a rota do perfil do usuário
  }
}

