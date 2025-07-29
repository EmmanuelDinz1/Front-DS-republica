// src/app/pages/meu-perfil/meu-perfil.component.ts

// src/app/pages/meu-perfil/meu-perfil.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NavegadorComponent } from '../../components/navegador/navegador.component';
import { ApiService } from '../../services/api.service';
import { Morador, MoradorDTO } from '../../types/models';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-meu-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavegadorComponent, RouterModule],
  templateUrl: './meu-perfil.component.html',
  styleUrls: ['./meu-perfil.component.scss']
})
export class MeuperfilComponent implements OnInit, OnDestroy {
  
  perfilForm!: FormGroup;
  isLoading = true;
  moradorId: number | null = null;
  private authSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.iniciarFormulario();
    this.authSubscription = this.authService.moradorId$.subscribe(id => {
      this.moradorId = id;
      if (this.moradorId) {
        this.carregarDadosMorador();
      } else {
        this.toastr.error('Nenhum morador logado para carregar o perfil.');
        this.isLoading = false;
      }
    });
  }

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
      // Adicionado um FormControl para a senha, mesmo que desabilitado no HTML, para capturar o valor
      // Ele não é 'required' porque a senha não é sempre atualizada
      senha: new FormControl('') // <--- ADICIONADO: Campo para a senha (pode ser vazio se não for alterada)
    });
  }
  
  carregarDadosMorador(): void {
    if (!this.moradorId) {
      this.toastr.error('ID do morador não disponível para carregar perfil.');
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.apiService.getMoradorById(this.moradorId).subscribe({
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
    // Para a senha, se o campo for vazio (não alterado), não o inclua no DTO
    const currentPassword = this.perfilForm.get('senha')?.value;
    if (currentPassword === '') {
      this.perfilForm.get('senha')?.disable(); // Desabilita para que o valor não seja incluído no .value
    }

    if (this.perfilForm.invalid) {
      this.toastr.warning('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!this.moradorId) {
      this.toastr.error('Não foi possível atualizar o perfil: ID do morador não encontrado.');
      return;
    }

    const formData = this.perfilForm.value; // Pega os valores do formulário (senha estará vazia se desabilitada)
    const moradorDto: MoradorDTO = {
      nome: formData.nome ?? '',
      email: formData.email ?? '',
      cpf: formData.cpf ?? '',
      dataNascimento: new Date(formData.dataNascimento).toISOString().split('T')[0],
      celular: formData.celular ?? '',
      contatosFamilia: formData.contatosFamilia ?? '',
      // APENAS INCLUI A SENHA SE ELA FOI PREENCHIDA NO FORMULÁRIO (ou seja, não é vazia)
      senha: currentPassword && currentPassword !== '' ? currentPassword : undefined // <--- AQUI GARANTIMOS QUE A SENHA SÓ É ENVIADA SE ALTERADA
    };

    // Re-habilita o campo de senha se foi desabilitado, para permitir nova edição
    this.perfilForm.get('senha')?.enable();

    this.apiService.updateMorador(this.moradorId, moradorDto).subscribe({
      next: () => {
        this.toastr.success('Perfil atualizado com sucesso!');
        // ATUALIZA O AUTHSERVICE COM OS NOVOS DADOS (incluindo o email e a senha se foi alterada)
        // Se a senha não foi alterada (currentPassword é vazio), pegamos a senha que já está no AuthService
        this.authService.login(
            this.moradorId!,
            moradorDto.nome ?? '',
            moradorDto.email ?? '',
        );
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
    // Ao clicar em "Alterar Senha", talvez você queira habilitar o campo de senha para edição
    this.perfilForm.get('senha')?.enable();
    this.perfilForm.get('senha')?.setValue(''); // Limpa o campo para o usuário digitar a nova senha
    this.toastr.info('Digite a nova senha no campo e clique em "Salvar Alterações".');
  }

  desativarConta(): void {
    this.toastr.warning('Cuidado! Ação de desativar a conta não pode ser desfeita.');
  }

  handlePrimaryNav(): void {
    this.router.navigate(['/profile']); // Navega para a rota de criação de conta
  }

  // Lida com a ação do botão secundário do navegador (Ex: Meu Perfil)
  handleSecondaryNav(): void {
    this.router.navigate(['/profile']); // Navega para a rota do perfil do usuário
  }
}

