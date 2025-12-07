import { Test, TestingModule } from '@nestjs/testing';
import { PokeController } from '../poke.controller';
import { PokeService } from '../poke.service';
import { I18nService } from 'nestjs-i18n';
import { BadRequestException } from '@nestjs/common';

describe('PokeController', () => {
  let ctrl: PokeController;
  const mockSvc = {
    list: jest.fn(),
    searchByName: jest.fn(),
    filterByTypes: jest.fn(),
    detail: jest.fn(),
  };
  const mockI18n = {
    t: jest.fn((k: string) => k),
  } as unknown as I18nService;

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      controllers: [PokeController],
      providers: [
        { provide: PokeService, useValue: mockSvc },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    ctrl = mod.get<PokeController>(PokeController);
  });

  afterEach(() => jest.resetAllMocks());

  it('list delegates to service', async () => {
    mockSvc.list.mockResolvedValue({
      results: [],
      count: 0,
      limit: 20,
      offset: 0,
    });
    const res = await ctrl.list({
      limit: 10,
      offset: 0,
      order: 'pokedex',
    });
    expect(mockSvc.list).toHaveBeenCalledWith(10, 0, 'pokedex');
    expect(res.count).toBeDefined();
  });

  it('byTypes throws BadRequest when parsed types empty', async () => {
    await expect(ctrl.byTypes({ types: '' })).rejects.toBeInstanceOf(
      BadRequestException,
    );

    const tSpy = jest.spyOn(mockI18n as any, 't');
    await expect(ctrl.byTypes({ types: '' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(tSpy).toHaveBeenCalled();
    tSpy.mockRestore();
  });

  it('get delegates to service.detail', async () => {
    mockSvc.detail.mockResolvedValue({ name: 'bulbasaur' });
    const r = await ctrl.get('1');
    expect(mockSvc.detail).toHaveBeenCalledWith('1');
    expect(r).toEqual({ name: 'bulbasaur' });
  });
});
