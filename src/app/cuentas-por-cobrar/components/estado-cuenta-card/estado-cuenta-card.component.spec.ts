import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoCuentaCardComponent } from './estado-cuenta-card.component';

describe('EstadoCuentaCardComponent', () => {
  let component: EstadoCuentaCardComponent;
  let fixture: ComponentFixture<EstadoCuentaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoCuentaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoCuentaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
