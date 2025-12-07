import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UploadImageDto } from '../dto/upload-image.dto';

describe('UploadImageDto', () => {
  it('valid when folder is string or omitted', async () => {
    const dto1 = plainToInstance(UploadImageDto, {});
    const errors1 = await validate(dto1);
    expect(errors1.length).toBe(0);

    const dto2 = plainToInstance(UploadImageDto, { folder: 'avatars' });
    const errors2 = await validate(dto2);
    expect(errors2.length).toBe(0);
  });

  it('invalid when folder is non-string', async () => {
    const dto = plainToInstance(UploadImageDto, { folder: 123 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map((e) => e.property)).toContain('folder');
  });
});
