import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultContaLayoutComponent } from './default-conta-layout.component';

describe('DefaultContaLayoutComponent', () => {
  let component: DefaultContaLayoutComponent;
  let fixture: ComponentFixture<DefaultContaLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultContaLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DefaultContaLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
