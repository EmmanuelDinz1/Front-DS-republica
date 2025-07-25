// src/app/pages/login/login.component.ts

import { Component } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { LoginRequest, LoginResponse } from '../../types/models';
import { AuthService } from '../../services/auth.service';

export interface LoginForm {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, DefaultLoginLayoutComponent, ReactiveFormsModule, PrimaryInputComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm!: FormGroup<LoginForm>;

  constructor(
    private router: Router,
    private toastService: ToastrService,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.loginForm = new FormGroup<LoginForm>({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  submit() {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      this.toastService.error("Por favor, preencha o email e a senha corretamente.");
      return;
    }

    const credentials: LoginRequest = {
      email: this.loginForm.value.email ?? '',
      senha: this.loginForm.value.password ?? ''
    };

    this.apiService.authenticate(credentials).subscribe({
      next: (response: LoginResponse) => {
        // response agora é do tipo LoginResponse (com token)
        if (response.status === "Autenticado com sucesso" && response.moradorId && response.moradorNome && response.token) {
            // Chama o login do AuthService com o token
            this.authService.login(response.moradorId, response.moradorNome, response.token); // <--- AGORA PASSA O TOKEN
            this.toastService.success(`Login realizado com sucesso! Bem-vindo, ${response.moradorNome}!`);
            this.router.navigate(["/profile"]);
        } else {
            this.toastService.error(response.status || "Credenciais inválidas ou erro desconhecido.");
        }
      },
      error: (err) => {
        console.error("Erro no login:", err);
        let errorMessage = "Erro na autenticação. Verifique suas credenciais.";
        if (err && err.error && err.error.message) { errorMessage = err.error.message; }
        else if (err.error && typeof err.error === 'string') { errorMessage = err.error; }
        else if (err.status === 401) { errorMessage = "Credenciais inválidas."; }
        this.toastService.error(errorMessage);
      }
    });
  }

  navigate() {
    this.router.navigate(["/signup"]);
  }
}