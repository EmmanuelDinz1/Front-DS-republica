import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavegadorComponent } from './navegador.component';

describe('NavegadorComponent', () => {
  let component: NavegadorComponent;
  let fixture: ComponentFixture<NavegadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavegadorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NavegadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit "primary" on primary button click', () => {
    spyOn(component.submit, 'emit');
    component.submitPrimary();
    expect(component.submit.emit).toHaveBeenCalledWith('primary');
  });

  it('should emit "secondary" on secondary button click', () => {
    spyOn(component.submit, 'emit');
    component.submitSecondary();
    expect(component.submit.emit).toHaveBeenCalledWith('secondary');
  });
});
