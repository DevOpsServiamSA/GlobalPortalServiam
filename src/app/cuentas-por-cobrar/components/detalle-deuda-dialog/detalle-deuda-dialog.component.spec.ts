import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleDeudaDialogComponent } from './detalle-deuda-dialog.component';

describe('DetalleDeudaDialogComponent', () => {
  let component: DetalleDeudaDialogComponent;
  let fixture: ComponentFixture<DetalleDeudaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleDeudaDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleDeudaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
