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

  @ApiPropertyOptional({
    description: 'Tipos do Pokémon (quando disponível)',
    example: ['grass', 'poison'],
    type: [String],
  })
  types?: string[];

  @ApiPropertyOptional({
    description:
      'URL da imagem principal do item da lista (official-artwork/fallback)',
    example:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
  })
  image?: string;
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

  @ApiPropertyOptional({
    description:
      'URL da imagem principal (official-artwork/front_default fallback)',
    example:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
  })
  image?: string;

  @ApiPropertyOptional({
    description: 'Descrição / flavor text em inglês (quando disponível)',
    example:
      'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Tipos que causam dano dobrado (weaknesses)',
    example: ['fire', 'flying'],
    type: [String],
  })
  weaknesses?: string[];

  @ApiPropertyOptional({
    description:
      'Base stats do Pokémon como mapa nome -> valor (hp, attack, defense, etc.)',
    example: {
      hp: 45,
      attack: 49,
      defense: 49,
      special_attack: 65,
      special_defense: 65,
      speed: 45,
    },
  })
  baseStats?: Record<string, number>;

  @ApiProperty({ type: [PokemonTypeEntryDto] })
  types!: PokemonTypeEntryDto[];

  @ApiProperty({ type: [PokemonStatEntryDto] })
  stats!: PokemonStatEntryDto[];

  @ApiPropertyOptional({ type: [PokemonAbilityEntryDto] })
  abilities?: PokemonAbilityEntryDto[];
}
