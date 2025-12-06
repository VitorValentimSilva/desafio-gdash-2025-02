import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadsService } from '../uploads.service';
import { UploadsRepository } from '../repositories/uploads.repository';
import { ImageDocument } from '../schemas/image.entity';

jest.mock('../utils/cloudinary.provider', () => ({
  uploadBufferToCloudinary: jest.fn(),
}));

import { uploadBufferToCloudinary } from '../utils/cloudinary.provider';
import { I18nService } from 'nestjs-i18n';

describe('UploadsService', () => {
  let service: UploadsService;
  let repo: Partial<Record<keyof UploadsRepository, jest.Mock>>;
  let i18n: Partial<I18nService>;

  const mockSavedImage = {
    _id: 'some-id',
    filename: 'test.png',
    url: 'https://res.cloudinary.com/demo/test.png',
    public_id: 'uploads/test',
    mimeType: 'png',
    size: 1234,
    createdAt: new Date(),
  } as unknown as ImageDocument;

  beforeEach(async () => {
    repo = {
      save: jest.fn().mockResolvedValue(mockSavedImage),
      findById: jest.fn().mockResolvedValue(mockSavedImage),
      findAll: jest.fn().mockResolvedValue([mockSavedImage]),
    };

    i18n = {
      t: jest.fn().mockImplementation((k: string) => k),
    } as Partial<I18nService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: UploadsRepository,
          useValue: repo,
        },
        { provide: I18nService, useValue: i18n },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException if buffer is missing', async () => {
    await expect(
      service.uploadBuffer(null as unknown as Buffer, 'file.png'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should call cloudinary provider and repository.save on successful upload', async () => {
    const cloudinaryResult = {
      original_filename: 'orig',
      secure_url: 'https://res.cloudinary.com/demo/test.png',
      url: 'https://res.cloudinary.com/demo/test.png',
      public_id: 'uploads/test',
      format: 'png',
      bytes: 1234,
    };
    (uploadBufferToCloudinary as jest.Mock).mockResolvedValue(cloudinaryResult);

    const buffer = Buffer.from('hello');
    const filename = 'file.png';
    const folder = 'my-folder';

    const result = await service.uploadBuffer(buffer, filename, folder);

    expect(uploadBufferToCloudinary).toHaveBeenCalledTimes(1);
    expect(uploadBufferToCloudinary).toHaveBeenCalledWith(buffer, folder);

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.save).toHaveBeenCalledWith({
      filename: cloudinaryResult.original_filename || filename,
      url: cloudinaryResult.secure_url || cloudinaryResult.url,
      public_id: cloudinaryResult.public_id,
      mimeType: cloudinaryResult.format,
      size: cloudinaryResult.bytes,
    });

    expect(result).toBe(mockSavedImage);
  });

  it('findById should delegate to repository.findById', async () => {
    const id = 'some-id';
    const found = await service.findById(id);
    expect(repo.findById).toHaveBeenCalledWith(id);
    expect(found).toBe(mockSavedImage);
  });

  it('findAll should delegate to repository.findAll with defaults', async () => {
    const found = await service.findAll();
    expect(repo.findAll).toHaveBeenCalledWith(20, 1);
    expect(found).toEqual([mockSavedImage]);
  });

  it('findAll should delegate to repository.findAll with provided params', async () => {
    const found = await service.findAll(10, 2);
    expect(repo.findAll).toHaveBeenCalledWith(10, 2);
    expect(found).toEqual([mockSavedImage]);
  });
});
