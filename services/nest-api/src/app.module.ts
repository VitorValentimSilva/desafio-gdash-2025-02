import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { WeatherModule } from './modules/weather/weather.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PokeModule } from './modules/poke/poke.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://mongo:27017/weather',
      {
        autoCreate: true,
      },
    ),
    I18nModule.forRoot({
      fallbackLanguage: 'pt-BR',
      loaderOptions: {
        path: path.join(__dirname, '/locales/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['Accept-Language'] },
        AcceptLanguageResolver,
      ],
    }),
    WeatherModule,
    UsersModule,
    AuthModule,
    PokeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
