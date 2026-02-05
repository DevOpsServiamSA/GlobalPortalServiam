import { TestBed } from '@angular/core/testing';

import { CuentasPorCobrarService } from './cuentas-por-cobrar.service';

describe('CuentasPorCobrarService', () => {
  let service: CuentasPorCobrarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CuentasPorCobrarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
