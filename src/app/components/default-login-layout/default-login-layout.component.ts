import { Component, EventEmitter, Input, Output,SimpleChanges  } from '@angular/core';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-default-login-layout',
  standalone: true,
  imports: [NgIf],
  templateUrl: './default-login-layout.component.html',
  styleUrl: './default-login-layout.component.scss'
})
export class DefaultLoginLayoutComponent {
  mostrarMensagemBoasVindas = true;
  @Input() title: string = "";
  @Input() primaryBtnText: string = "";
  @Input() secondaryBtnText: string = "";
  @Input() disablePrimaryBtn: boolean = true;
  @Output("submit") onSubmit = new EventEmitter();
  @Input() showWelcomeMessage = false;

  @Output("navigate") onNavigate = new EventEmitter();
  
  submit(){
this.onSubmit.emit();
  }
  navigate(){
    this.onNavigate.emit();
  }
}
