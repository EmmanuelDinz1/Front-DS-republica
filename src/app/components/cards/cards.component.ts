import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent {
    @Input() tipo: 'evento' | 'novo' = 'evento';


  // Para tipo 'evento':
  @Input() titulo: string = '';
  @Input() data: string = '';
  @Input() diaSemana: string = '';
  @Input() horario: string = '';
  @Input() local: string = '';

}
