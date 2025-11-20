import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompararArchivosSimetrico } from './comparar-archivos-simetrico';

describe('CompararArchivosSimetrico', () => {
  let component: CompararArchivosSimetrico;
  let fixture: ComponentFixture<CompararArchivosSimetrico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompararArchivosSimetrico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompararArchivosSimetrico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
