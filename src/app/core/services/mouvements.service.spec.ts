import { TestBed } from '@angular/core/testing';

import { MouvementsService } from './mouvements.service';

describe('MouvementsService', () => {
  let service: MouvementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MouvementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
