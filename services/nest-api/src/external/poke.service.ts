import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PokeService {
  async list(limit = 20, offset = 0): Promise<unknown> {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    const r = await axios.get(url);
    return r.data;
  }

  async detail(nameOrId: string): Promise<unknown> {
    const r = await axios.get(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
    return r.data;
  }
}
