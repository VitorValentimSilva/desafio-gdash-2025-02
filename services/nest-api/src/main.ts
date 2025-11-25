import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { UsersService } from './users/users.service';

async function createDefaultAdmin(app: INestApplication<any>) {
  const usersService: UsersService = app.get(UsersService);
  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
  const pass = process.env.DEFAULT_ADMIN_PASS || '123456';

  try {
    await usersService.ensureAdmin(email, pass);
    console.log('Default admin ensured:', email);
  } catch (e) {
    console.warn(
      'Default admin creation failed:',
      e instanceof Error ? e.message : e,
    );
  }
}

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  app.use(helmet());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await createDefaultAdmin(app);
  await app.listen(port);
  console.log(`NestJS listening on http://0.0.0.0:${port}/api`);
}
bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
