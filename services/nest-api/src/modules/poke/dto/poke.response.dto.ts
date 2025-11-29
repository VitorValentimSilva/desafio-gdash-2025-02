import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PokemonAbilityEntryDto,
  PokemonSpriteDto,
  PokemonStatEntryDto,
  PokemonTypeEntryDto,
} from './poke.dto';

export class PokemonListItemDto {
  @ApiProperty({ example: 'bulbasaur' })
  name!: string;

  @ApiProperty({ example: 'https://pokeapi.co/api/v2/pokemon/1/' })
  url!: string;

  @ApiPropertyOptional({ example: 1 })
  id?: number;
}

export class PagedResultDto {
  @ApiProperty({ example: 1118 })
  count!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 0 })
  offset!: number;

  @ApiProperty({ type: [PokemonListItemDto] })
  results!: PokemonListItemDto[];

  @ApiPropertyOptional({ example: '?limit=20&offset=20&order=pokedex' })
  next?: string | null;

  @ApiPropertyOptional({ example: null })
  previous?: string | null;
}

export class PokemonDetailResultDto {
  @ApiPropertyOptional({ example: 1 })
  id?: number;

  @ApiProperty({ example: 'bulbasaur' })
  name!: string;

  @ApiPropertyOptional({ example: 7 })
  height?: number;

  @ApiPropertyOptional({ example: 69 })
  weight?: number;

  @ApiPropertyOptional({ type: PokemonSpriteDto })
  sprites?: PokemonSpriteDto;

  @ApiProperty({ type: [PokemonTypeEntryDto] })
  types!: PokemonTypeEntryDto[];

  @ApiProperty({ type: [PokemonStatEntryDto] })
  stats!: PokemonStatEntryDto[];

  @ApiPropertyOptional({ type: [PokemonAbilityEntryDto] })
  abilities?: PokemonAbilityEntryDto[];
}
