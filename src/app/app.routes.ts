import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignUpComponent } from './pages/signup/signup.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MeuperfilComponent } from './pages/meu-perfil/meu-perfil.component';
import { ContaComponent } from './pages/conta/conta.component';
import { SaldoMoradorComponent } from './pages/saldo-morador/saldo-morador.component';
import { ExtratoComponent } from './pages/extrato/extrato.component';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignUpComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path:'meuperfil',
    component: MeuperfilComponent
  },
  {
    path: 'conta',
    component: ContaComponent
  },
  {
    path: 'SaldoComponent',
    component: SaldoMoradorComponent
  },
  {
    path: 'meuextrato',
    component: ExtratoComponent
  },
  // ATUALIZADO: Rota para aceitar ID opcional para edição
  {
    path: 'conta', // Para criar nova conta
    loadComponent: () => import('./pages/conta/conta.component').then(m => m.ContaComponent)
  },
  {
    path: '**',
    redirectTo: 'login'  // Qualquer rota inválida -> login
  }
];
