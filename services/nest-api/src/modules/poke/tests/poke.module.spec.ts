import { Test } from '@nestjs/testing';
import { PokeController } from '../poke.controller';
import { PokeService } from '../poke.service';
import { PokeApiRepository } from '../repositories/poke.api.repository';
import { I18nService } from 'nestjs-i18n';

describe('PokeModule smoke', () => {
  it('should compile controller/service/repository when provided', async () => {
    const mockI18n = {
      t: jest.fn((k: string) => k),
    } as unknown as I18nService;

    const moduleRef = await Test.createTestingModule({
      controllers: [PokeController],
      providers: [
        PokeService,
        PokeApiRepository,
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    const svc = moduleRef.get(PokeService);
    const repo = moduleRef.get(PokeApiRepository);
    const ctrl = moduleRef.get(PokeController);

    expect(svc).toBeDefined();
    expect(repo).toBeDefined();
    expect(ctrl).toBeDefined();
  });
});
