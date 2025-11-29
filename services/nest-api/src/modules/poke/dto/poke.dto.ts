import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PokemonSpriteDto {
  @ApiPropertyOptional({
    example: 'https://raw.githubusercontent.com/.../sprite.png',
  })
  front_default?: string | null;
  @ApiPropertyOptional({ example: null })
  front_shiny?: string | null;
}

export class PokemonTypeEntryDto {
  @ApiProperty({ example: 1 })
  slot!: number;

  @ApiProperty({ example: 'grass' })
  name!: string;

  @ApiPropertyOptional({ example: 'https://pokeapi.co/api/v2/type/12/' })
  url?: string;
}

export class PokemonStatEntryDto {
  @ApiProperty({ example: 45 })
  base_stat!: number;

  @ApiProperty({ example: 'hp' })
  name!: string;
}

export class PokemonAbilityEntryDto {
  @ApiProperty({ example: 'overgrow' })
  name!: string;

  @ApiProperty({ example: false })
  is_hidden!: boolean;
}
