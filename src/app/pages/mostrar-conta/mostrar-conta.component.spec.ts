import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MostrarContaComponent } from './mostrar-conta.component';

describe('MostrarContaComponent', () => {
  let component: MostrarContaComponent;
  let fixture: ComponentFixture<MostrarContaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostrarContaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MostrarContaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
