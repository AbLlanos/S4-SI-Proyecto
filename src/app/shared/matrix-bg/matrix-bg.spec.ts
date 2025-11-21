import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixBg } from './matrix-bg';

describe('MatrixBg', () => {
  let component: MatrixBg;
  let fixture: ComponentFixture<MatrixBg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatrixBg]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatrixBg);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
