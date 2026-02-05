import { TestBed } from '@angular/core/testing';

import { EmpresasCxcService } from './empresas-cxc.service';

describe('EmpresasCxcService', () => {
  let service: EmpresasCxcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpresasCxcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
