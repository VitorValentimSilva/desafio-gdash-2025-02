import { Module } from '@nestjs/common';
import { PokeService } from './poke.service';
import { PokeController } from './poke.controller';
import { PokeApiRepository } from './repositories/poke.api.repository';

@Module({
  providers: [PokeService, PokeApiRepository],
  controllers: [PokeController],
  exports: [PokeService],
})
export class PokeModule {}
