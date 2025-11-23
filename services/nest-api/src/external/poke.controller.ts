import { Controller, Get, Query, Param } from '@nestjs/common';
import { PokeService } from './poke.service';

@Controller('external/poke')
export class PokeController {
  constructor(private svc: PokeService) {}

  @Get()
  async list(@Query('limit') limit = '20', @Query('offset') offset = '0') {
    return this.svc.list(Number(limit), Number(offset));
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.detail(id);
  }
}
