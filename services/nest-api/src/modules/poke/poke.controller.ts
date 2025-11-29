import {
  Controller,
  Get,
  Query,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { PokeService } from './poke.service';
import {
  ListQueryDto,
  SearchQueryDto,
  TypesQueryDto,
} from './dto/poke.query.dto';
import { parseTypesQuery } from './utils/poke.utils';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  PagedResultDto,
  PokemonDetailResultDto,
  PokemonListItemDto,
} from './dto/poke.response.dto';
import { I18nService } from 'nestjs-i18n';

@ApiTags('Poke')
@ApiExtraModels(PagedResultDto, PokemonListItemDto, PokemonDetailResultDto)
@Controller('poke')
export class PokeController {
  constructor(
    private readonly svc: PokeService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List pokemons (paginated)' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiQuery({ name: 'order', required: false, enum: ['pokedex', 'az', 'za'] })
  @ApiOkResponse({ schema: { $ref: getSchemaPath(PagedResultDto) } })
  async list(@Query() query: ListQueryDto) {
    const { limit = 20, offset = 0, order = 'pokedex' } = query;
    return this.svc.list(limit, offset, order);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search pokemons by name' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ schema: { $ref: getSchemaPath(PagedResultDto) } })
  async search(@Query() query: SearchQueryDto) {
    const { q = '', limit = 20, offset = 0, order = 'pokedex' } = query;
    return this.svc.searchByName(q ?? '', limit, offset, order);
  }

  @Get('types')
  @ApiOperation({ summary: 'Filter pokemons by types (comma separated)' })
  @ApiQuery({ name: 'types', required: true, description: 'ex: grass,poison' })
  @ApiOkResponse({ schema: { $ref: getSchemaPath(PagedResultDto) } })
  async byTypes(@Query() query: TypesQueryDto) {
    const { limit = 20, offset = 0, order = 'pokedex', types } = query;
    const parsed = parseTypesQuery(types);
    if (parsed.length === 0) {
      throw new BadRequestException(
        this.i18n.t('poke.QueryParamTypeIsRequired'),
      );
    }
    return this.svc.filterByTypes(parsed, limit, offset, order);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pokemon detail by id or name' })
  @ApiParam({ name: 'id', description: 'id or name of pokemon' })
  @ApiOkResponse({ schema: { $ref: getSchemaPath(PokemonDetailResultDto) } })
  async get(@Param('id') id: string) {
    return this.svc.detail(id);
  }
}
