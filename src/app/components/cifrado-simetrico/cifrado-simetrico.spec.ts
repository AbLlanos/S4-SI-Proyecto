import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CifradoSimetrico } from './cifrado-simetrico';

describe('CifradoSimetrico', () => {
  let component: CifradoSimetrico;
  let fixture: ComponentFixture<CifradoSimetrico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CifradoSimetrico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CifradoSimetrico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
