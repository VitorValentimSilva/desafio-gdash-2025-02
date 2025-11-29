import axios, { AxiosError } from 'axios';
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import type {
  PokeApiListResponse,
  PokeApiTypeResponse,
} from '../schemas/poke.types';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class PokeApiRepository {
  private readonly logger = new Logger(PokeApiRepository.name);
  private readonly REMOTE_BASE = 'https://pokeapi.co/api/v2';
  private readonly DEFAULT_TIMEOUT_MS = 10_000;
  constructor(private readonly I18n: I18nService) {}

  private async fetch<T = unknown>(url: string): Promise<T> {
    try {
      const r = await axios.get<T>(url, { timeout: this.DEFAULT_TIMEOUT_MS });
      return r.data;
    } catch (err: unknown) {
      const message = this.getAxiosErrorMessage(err);
      this.logger.warn(
        this.I18n.t('common.HttpFailure', { args: [url, message] }),
      );
      throw new HttpException(
        {
          message: this.I18n.t('common.ExternalServiceError'),
          details: message,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private getAxiosErrorMessage(err: unknown): string {
    if (!err) return 'Unknown error';
    if (err instanceof AxiosError) {
      const code = err.code ?? 'UNKNOWN';
      const status = err.response?.status ?? 'no-status';
      const data =
        typeof err.response?.data === 'string'
          ? err.response?.data
          : JSON.stringify(err.response?.data ?? {});
      return this.I18n.t('common.AxiosError', { args: { code, status, data } });
    }
    if (err instanceof Error) return err.message;
    try {
      return JSON.stringify(err);
    } catch {
      return this.I18n.t('common.UnknownError');
    }
  }

  async list(limit = 20, offset = 0): Promise<PokeApiListResponse> {
    return this.fetch<PokeApiListResponse>(
      `${this.REMOTE_BASE}/pokemon?limit=${limit}&offset=${offset}`,
    );
  }

  async getMetaCount(): Promise<number> {
    const meta = await this.fetch<PokeApiListResponse>(
      `${this.REMOTE_BASE}/pokemon?limit=1`,
    );
    return meta.count ?? 0;
  }

  async listAll(limit: number): Promise<PokeApiListResponse> {
    return this.fetch<PokeApiListResponse>(
      `${this.REMOTE_BASE}/pokemon?limit=${limit}`,
    );
  }

  async getPokemonDetail(nameOrId: string): Promise<unknown> {
    return this.fetch<unknown>(
      `${this.REMOTE_BASE}/pokemon/${encodeURIComponent(nameOrId)}`,
    );
  }

  async type(typeName: string): Promise<PokeApiTypeResponse> {
    return this.fetch<PokeApiTypeResponse>(
      `${this.REMOTE_BASE}/type/${encodeURIComponent(typeName)}`,
    );
  }
}
