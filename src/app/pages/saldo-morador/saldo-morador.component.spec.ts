import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaldoMoradorComponent } from './saldo-morador.component';

describe('ContaMoradorComponent', () => {
  let component: SaldoMoradorComponent;
  let fixture: ComponentFixture<SaldoMoradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaldoMoradorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaldoMoradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
