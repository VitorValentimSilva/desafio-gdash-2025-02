import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UploadsController } from '../uploads.controller';
import { UploadsService } from '../uploads.service';
import { UploadsRepository } from '../repositories/uploads.repository';
import { Image } from '../schemas/image.entity';
import { I18nService } from 'nestjs-i18n';

describe('UploadsModule (smoke)', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('compiles with mocked model token and i18n provider', async () => {
    const mockModel = jest.fn();
    const mockI18n = { t: jest.fn((k: string) => k) } as unknown as I18nService;

    const moduleRef = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        UploadsService,
        UploadsRepository,
        { provide: getModelToken(Image.name), useValue: mockModel },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    const svc = moduleRef.get(UploadsService);
    const repo = moduleRef.get(UploadsRepository);
    const ctrl = moduleRef.get(UploadsController);

    expect(svc).toBeDefined();
    expect(repo).toBeDefined();
    expect(ctrl).toBeDefined();
  });
});
