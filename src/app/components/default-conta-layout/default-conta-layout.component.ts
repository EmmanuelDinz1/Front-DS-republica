// default-conta-layout.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-default-conta-layout',
  standalone: true,
  templateUrl: './default-conta-layout.component.html',
  styleUrl: './default-conta-layout.component.scss'
})
export class DefaultContaLayoutComponent {
  @Input() title!: string;
  @Input() primaryBtnText = 'Salvar';
  @Input() disablePrimaryBtn: boolean = false; // <-- ADICIONADO
  @Output() primaryAction = new EventEmitter<void>();
}
