// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignUpComponent } from './pages/signup/signup.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MeuperfilComponent } from './pages/meu-perfil/meu-perfil.component';
import { ContaComponent } from './pages/conta/conta.component';
import { SaldoMoradorComponent } from './pages/saldo-morador/saldo-morador.component';
import { MostrarContaComponent } from './pages/mostrar-conta/mostrar-conta.component'; // <--- NOVA IMPORTAÇÃO

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignUpComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path:'meuperfil',
    loadComponent: () => import('./pages/meu-perfil/meu-perfil.component').then(m => m.MeuperfilComponent)
  },
  {
    path: 'conta',
    loadComponent: () => import('./pages/conta/conta.component').then(m => m.ContaComponent)
  },
  {
    path: 'conta/:id', // Rota para edição
    loadComponent: () => import('./pages/conta/conta.component').then(m => m.ContaComponent)
  },
  {
    path: 'saldos',
    loadComponent: () => import('./pages/saldo-morador/saldo-morador.component').then(m => m.SaldoMoradorComponent)
  },
  {
    path: 'mostrar-conta/:id', // <--- NOVA ROTA PARA MOSTRAR DETALHES DA CONTA
    loadComponent: () => import('./pages/mostrar-conta/mostrar-conta.component').then(m => m.MostrarContaComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];