import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { WeatherModule } from './weather/weather.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ExternalModule } from './external/external.module';
dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://mongo:27017/weather',
      {
        autoCreate: true,
      },
    ),
    WeatherModule,
    UsersModule,
    AuthModule,
    ExternalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
