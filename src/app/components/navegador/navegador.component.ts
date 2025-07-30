// src/app/components/navegador/navegador.component.ts

import { Input, Output, EventEmitter, Component } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navegador',
  standalone: true,
  imports: [NgIf],
  templateUrl: './navegador.component.html',
  styleUrls: ['./navegador.component.scss']
})
export class NavegadorComponent {
  @Input() title: string = '';
  @Input() title2: string = '';
  @Input() primaryBtnText: string = '';
  @Input() secondaryBtnText: string = '';
  // REMOVIDO: @Input() terceiroBtnText: string = ''; // Não há terceiro botão

  @Input() disablePrimaryBtn: boolean = true;

  @Output("submitAction") onSubmitAction = new EventEmitter<void>(); // Evento para o botão primário (Sair)
  @Output("navigateAction") onNavigateAction = new EventEmitter<void>(); // Evento para o botão secundário (Meu Perfil)
  // REMOVIDO: @Output("navigateActionDois") onNavigateActionDois = new EventEmitter<void>(); // Não há terceiro botão

  submit(): void {
    console.log('NavegadorComponent: Botão primário (Sair) clicado!');
    this.onSubmitAction.emit();
  }

  navigate(): void {
    console.log('NavegadorComponent: Botão secundário (Meu Perfil) clicado!');
    this.onNavigateAction.emit();
  }
  // REMOVIDO: navigateDois() method
}