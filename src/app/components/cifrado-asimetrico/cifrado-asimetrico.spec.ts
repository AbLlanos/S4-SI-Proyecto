import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CifradoAsimetrico } from './cifrado-asimetrico';

describe('CifradoAsimetrico', () => {
  let component: CifradoAsimetrico;
  let fixture: ComponentFixture<CifradoAsimetrico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CifradoAsimetrico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CifradoAsimetrico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
