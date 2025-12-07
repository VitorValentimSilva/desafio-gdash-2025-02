import { Test, TestingModule } from '@nestjs/testing';
import { UploadsController } from '../uploads.controller';
import { UploadsService } from '../uploads.service';
import { BadRequestException } from '@nestjs/common';

type MulterFile = {
  buffer: Buffer;
  originalname: string;
  mimetype?: string;
  size?: number;
};

describe('UploadsController', () => {
  let ctrl: UploadsController;
  const mockService = {
    uploadBuffer: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [{ provide: UploadsService, useValue: mockService }],
    }).compile();

    ctrl = module.get<UploadsController>(UploadsController);
  });

  afterEach(() => jest.resetAllMocks());

  it('upload throws BadRequest if file missing', async () => {
    await expect(
      ctrl.upload(
        undefined as unknown as MulterFile,
        {} as { folder?: string },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('upload delegates to service and returns mapped response', async () => {
    const fakeDoc = {
      _id: '1',
      filename: 'a.png',
      url: 'u',
      public_id: 'p',
      mimeType: 'png',
      size: 123,
    };
    mockService.uploadBuffer.mockResolvedValueOnce(fakeDoc);

    const file: MulterFile = {
      buffer: Buffer.from('x'),
      originalname: 'a.png',
    };
    const body = { folder: 'avatars' };

    const res = await ctrl.upload(file, body);
    expect(mockService.uploadBuffer).toHaveBeenCalledWith(
      file.buffer,
      file.originalname,
      'avatars',
    );
    expect(res).toMatchObject({ id: '1', filename: 'a.png', url: 'u' });
  });

  it('list returns paginated dto mapped', async () => {
    const docs = [
      { _id: '1', filename: 'a.png', url: 'u' },
      { _id: '2', filename: 'b.png', url: 'u2' },
    ];
    mockService.findAll.mockResolvedValueOnce(docs);

    const res = await ctrl.list('1', '10');
    expect(mockService.findAll).toHaveBeenCalledWith(10, 1);
    expect(res.data).toHaveLength(2);
    expect(res.meta).toMatchObject({ page: 1, limit: 10 });
  });

  it('get delegates to service and maps result', async () => {
    const doc = { _id: 'x', filename: 'a', url: 'u' };
    mockService.findById.mockResolvedValueOnce(doc);

    const r = await ctrl.get('x');
    expect(mockService.findById).toHaveBeenCalledWith('x');
    expect(r).toMatchObject({ id: 'x', filename: 'a', url: 'u' });
  });
});
