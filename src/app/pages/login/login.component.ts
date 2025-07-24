// src/app/pages/login/login.component.ts

import { Component } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common'; // Adicionado, se necessário
import { ApiService } from '../../services/api.service'; // Importar ApiService
import { LoginRequest, LoginResponse } from '../../types/models'; // Importar LoginRequest

export interface LoginForm {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, // Garante que CommonModule esteja importado
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    PrimaryInputComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm!: FormGroup<LoginForm>;

  constructor(
    private router: Router,
    private toastService: ToastrService,
    private apiService: ApiService // Injetar ApiService
  ) {
    this.loginForm = new FormGroup<LoginForm>({
      email: new FormControl('', [Validators.required, Validators.email]), // Removido valor fixo
      password: new FormControl('', [Validators.required, Validators.minLength(6)]) // Removido valor fixo
    });
  }

  submit() {
    this.loginForm.markAllAsTouched(); // Para exibir mensagens de erro

    if (this.loginForm.invalid) {
      this.toastService.error("Por favor, preencha o email e a senha corretamente.");
      return;
    }

    const credentials: LoginRequest = {
      email: this.loginForm.value.email ?? '',
      senha: this.loginForm.value.password ?? '' // Mapear para 'senha' se o backend esperar isso
    };

    this.apiService.authenticate(credentials).subscribe({
      next: (response) => {
        // Assumindo que o backend retorna "Autenticado com sucesso"
        if (response === "Autenticado com sucesso") {
            this.toastService.success("Login realizado com sucesso!");
            // IMPORTANTE: Em um sistema real, você salvaria um token JWT aqui
            // e então navegaria. Como é Basic Auth, estamos apenas navegando.
            this.router.navigate(["/profile"]); // Navega para o dashboard/profile
        } else {
            this.toastService.error("Credenciais inválidas ou erro desconhecido.");
        }
      },
      error: (err) => {
        console.error("Erro no login:", err);
        let errorMessage = "Erro na autenticação. Verifique suas credenciais.";
        if (err && err.error) {
            // Se o erro for uma string do backend (ex: "Credenciais inválidas")
            if (typeof err.error === 'string') {
                errorMessage = err.error;
            } else if (err.error.message) { // Se for um objeto de erro do backend
                errorMessage = err.error.message;
            }
        }
        this.toastService.error(errorMessage);
      }
    });
  }

  navigate() {
    this.router.navigate(["/signup"]);
  }
}