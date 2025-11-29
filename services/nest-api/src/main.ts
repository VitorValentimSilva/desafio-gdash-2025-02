import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { UsersService } from './modules/users/users.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { I18nService } from 'nestjs-i18n';

async function createDefaultAdmin(app: INestApplication<any>) {
  const usersService: UsersService = app.get(UsersService);
  const i18n: I18nService = app.get<I18nService>(I18nService);
  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
  const pass = process.env.DEFAULT_ADMIN_PASS || '123456';

  try {
    await usersService.ensureAdmin(email, pass);
    console.log(i18n.t('common.DefaultAdminEnsured', { args: [email] }));
  } catch (e: any) {
    console.error(
      i18n.t('common.DefaultAdminCreationFailed', {
        args: [e instanceof Error ? e.message : String(e)],
      }),
    );
    throw e;
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

  const i18n: I18nService = app.get<I18nService>(I18nService);
  const config = new DocumentBuilder()
    .setTitle(i18n.t('common.SwaggerTitle'))
    .setDescription(i18n.t('common.SwaggerDescription'))
    .setVersion(i18n.t('common.SwaggerVersion'))
    .addTag(i18n.t('common.SwaggerTagPoke'))
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await createDefaultAdmin(app);
  await app.listen(port);
  console.log(i18n.t('common.NestListening', { args: [port] }));
}
bootstrap().catch((error) => {
  console.error('FailedToStart', {
    args: [error instanceof Error ? error.message : String(error)],
  });
  process.exit(1);
});
