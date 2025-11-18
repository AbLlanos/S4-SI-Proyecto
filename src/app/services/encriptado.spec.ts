import { TestBed } from '@angular/core/testing';

import { Encriptado } from './encriptado';

describe('Encriptado', () => {
  let service: Encriptado;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Encriptado);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
