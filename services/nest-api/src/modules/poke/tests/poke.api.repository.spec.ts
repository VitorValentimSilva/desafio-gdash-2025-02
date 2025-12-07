import axios from 'axios';
import { PokeApiRepository } from '../repositories/poke.api.repository';
import { I18nService } from 'nestjs-i18n';
import { HttpException, HttpStatus } from '@nestjs/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PokeApiRepository', () => {
  let repo: PokeApiRepository;
  const mockI18n = { t: jest.fn((k: string) => k) } as unknown as I18nService;

  beforeEach(() => {
    mockedAxios.get.mockReset();
    repo = new PokeApiRepository(mockI18n);
  });

  it('list should call remote endpoint and return data', async () => {
    const fake = {
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [{ name: 'a', url: '/pokemon/1' }],
      },
    };
    const getSpy = jest
      .spyOn(mockedAxios, 'get')
      .mockResolvedValueOnce(fake as any);
    const res = await repo.list(10, 0);
    expect(getSpy).toHaveBeenCalled();
    expect(res.results).toHaveLength(1);
    getSpy.mockRestore();
  });

  it('getMetaCount should return count', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { count: 42, next: null, previous: null, results: [] },
    } as any);
    const c = await repo.getMetaCount();
    expect(c).toBe(42);
  });

  it('fetch should throw HttpException on remote failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('network fail'));
    await expect(repo.list(1, 0)).rejects.toBeInstanceOf(HttpException);
    try {
      await repo.list(1, 0);
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      if (err instanceof HttpException) {
        expect(err.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
        expect(err.message).toBeDefined();
      }
    }
  });
});
