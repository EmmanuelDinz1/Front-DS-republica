import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NavegadorComponent } from '../../components/navegador/navegador.component';
import { ApiService } from '../../services/api.service';
import { Morador, MoradorDTO } from '../../types/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-meu-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavegadorComponent],
  templateUrl: './meu-perfil.component.html',
  styleUrls: ['./meu-perfil.component.scss']
})
export class MeuperfilComponent implements OnInit {
  
  perfilForm!: FormGroup;
  isLoading = true;
  moradorId: number = 1; // ID fixo, pois não temos um sistema de login real

  constructor(private apiService: ApiService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.iniciarFormulario();
    this.carregarDadosMorador();
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
    // NOTA: Em uma aplicação real, o ID do morador viria de um serviço de autenticação
    // após o login. Como não temos isso, estamos usando um ID fixo (1).
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
    if (this.perfilForm.invalid) {
      this.toastr.warning('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const formData = this.perfilForm.value;
    const moradorDto: MoradorDTO = {
      ...formData,
      dataNascimento: new Date(formData.dataNascimento).toISOString()
    };
    
    this.apiService.updateMorador(this.moradorId, moradorDto).subscribe({
      next: () => {
        this.toastr.success('Perfil atualizado com sucesso!');
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
  }
}
