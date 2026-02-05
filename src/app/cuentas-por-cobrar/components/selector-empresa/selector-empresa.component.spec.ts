import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorEmpresaComponent } from './selector-empresa.component';

describe('SelectorEmpresaComponent', () => {
  let component: SelectorEmpresaComponent;
  let fixture: ComponentFixture<SelectorEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorEmpresaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectorEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
