import { Input, Output, EventEmitter, Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navegador',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './navegador.component.html',
  styleUrls: ['./navegador.component.scss']
})
export class NavegadorComponent {
  @Input() title: string = '';
  @Input() title2: string = '';
  @Input() primaryBtnText: string = '';
  @Input() secondaryBtnText: string = '';
  @Input() disablePrimaryBtn: boolean = true;
  @Input() routerLinkPrimary: string | any[] | null = null;
  @Input() routerLinkSecondary: string | any[] | null = null;

@Output("submitAction") onSubmitAction = new EventEmitter<void>(); // <-- NOME CORRETO
@Output("navigateAction") onNavigateAction = new EventEmitter<void>(); // <-- NOME CORRETO

submit(){ this.onSubmitAction.emit(); } // Emite o novo nome
navigate(){ this.onNavigateAction.emit(); } // Emite o novo nome
}
