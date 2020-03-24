import { TestBed } from '@angular/core/testing';

import { MmmService } from './mmm.service';

describe('MmmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MmmService = TestBed.get(MmmService);
    expect(service).toBeTruthy();
  });
});
