import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WeatherController } from './weather/weather.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController, WeatherController],
  providers: [AppService],
})
export class AppModule {}
