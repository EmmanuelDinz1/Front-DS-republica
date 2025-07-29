// src/app/pages/signup/signup.component.ts

import { Component } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { MoradorDTO } from '../../types/models';
import { CommonModule } from '@angular/common';

interface SignupForm {
  name: FormControl<string | null>;
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  passwordConfirm: FormControl<string | null>;
  dataNascimento: FormControl<string | null>;
  cpf: FormControl<string | null>;
  celular: FormControl<string | null>;
  contatosFamilia: FormControl<string | null>;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    PrimaryInputComponent
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignUpComponent {
  signupForm!: FormGroup<SignupForm>;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastService: ToastrService
  ) {
    this.signupForm = new FormGroup<SignupForm>({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordConfirm: new FormControl('', [Validators.required, Validators.minLength(6)]),
      dataNascimento: new FormControl('', [Validators.required]),
      cpf: new FormControl('', [Validators.required]),
      celular: new FormControl('', [Validators.required]),
      contatosFamilia: new FormControl('', [Validators.required, Validators.minLength(3)]),
    });
  }

  submit() {
    
    // ESSENCIAL: Marcar todos os controles como 'touched' para que as mensagens de erro sejam exibidas
    // Isso é importante porque o botão está desabilitado se o formulário for inválido e o submit não é chamado
    // automaticamente em cada input. Marcar touched aqui garante que as mensagens apareçam.
    this.signupForm.markAllAsTouched();

  // REMOVA/COMENTE ESTE BLOCO TEMPORARIAMENTE PARA TESTE
  /*
  if (this.signupForm.invalid) {
    this.toastService.error("Preencha todos os campos corretamente.");
    return;
  }

  if (this.signupForm.value.password !== this.signupForm.value.passwordConfirm) {
    this.toastService.error("As senhas não coincidem.");
    // Opcional: Você pode querer resetar o touched/dirty dos campos de senha para forçar a revalidação visual
    this.signupForm.get('password')?.setErrors({'mismatch': true}); // Exemplo de erro customizado
    this.signupForm.get('passwordConfirm')?.setErrors({'mismatch': true});
    return;
  }
  */
  // FIM DO BLOCO PARA REMOVER/COMENTAR

    const moradorData: MoradorDTO = {
      nome: this.signupForm.value.name ?? '',
      email: this.signupForm.value.email ?? '',
      senha: this.signupForm.value.password ?? '',
      dataNascimento: this.signupForm.value.dataNascimento ?? '',
      cpf: this.signupForm.value.cpf ?? '',
      celular: this.signupForm.value.celular ?? '',
      contatosFamilia: this.signupForm.value.contatosFamilia ?? ''
    };

    this.apiService.createMorador(moradorData).subscribe({
      next: () => {
        this.toastService.success("Cadastro realizado com sucesso!");
      },
      error: (err) => {
        console.error("Erro no cadastro:", err);
        let errorMessage = "Erro ao cadastrar. Verifique os dados e tente novamente.";
        if (err && err.error && err.error.message) {
            errorMessage = err.error.message;
        } else if (err.message) {
            errorMessage = err.message;
        }
        this.toastService.error(errorMessage);
      }
    });
  }

  navigate() {
    this.router.navigate(["/login"]);
  }
}