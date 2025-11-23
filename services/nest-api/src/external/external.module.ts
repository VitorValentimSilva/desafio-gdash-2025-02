import { Module } from '@nestjs/common';
import { PokeService } from './poke.service';
import { PokeController } from './poke.controller';

@Module({
  providers: [PokeService],
  controllers: [PokeController],
})
export class ExternalModule {}
