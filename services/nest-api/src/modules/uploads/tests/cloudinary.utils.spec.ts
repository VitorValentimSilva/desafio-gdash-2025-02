import * as cloudLib from 'cloudinary';
import { Readable } from 'stream';

import {
  createCloudinary,
  uploadBufferToCloudinary,
} from '../utils/cloudinary.provider';

type CloudinaryV2Mock = {
  config: jest.Mock;
  uploader?: {
    upload_stream: jest.Mock;
  };
};

describe('cloudinary utils', () => {
  const OLD_ENV = process.env;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeAll(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.CLOUDINARY_CLOUD_NAME = 'cn';
    process.env.CLOUDINARY_API_KEY = 'k';
    process.env.CLOUDINARY_API_SECRET = 's';

    const cloudAsAny = cloudLib as unknown as { v2?: CloudinaryV2Mock };

    if (!cloudAsAny.v2) {
      cloudAsAny.v2 = {
        config: jest.fn(),
        uploader: { upload_stream: jest.fn() },
      };
    } else {
      cloudAsAny.v2.config = cloudAsAny.v2.config || jest.fn();
      cloudAsAny.v2.uploader = cloudAsAny.v2.uploader || {
        upload_stream: jest.fn(),
      };
    }
  });

  afterEach(() => {
    jest.resetAllMocks();
    process.env = OLD_ENV;
  });

  it('createCloudinary configures cloudinary without throwing', () => {
    expect(() => createCloudinary()).not.toThrow();
  });

  it('uploadBufferToCloudinary resolves on success', async () => {
    let callbackRef:
      | ((error: Error | null, result?: unknown) => void)
      | undefined;
    const fakeResult = {
      public_id: 'pid',
      secure_url: 'https://x',
      width: 10,
    };

    const uploader = {
      upload_stream: jest
        .fn()
        .mockImplementation((_opts: unknown, cb: unknown) => {
          callbackRef = cb as (error: Error | null, result?: unknown) => void;
          return {};
        }),
    };

    const cloudAsTyped = cloudLib as unknown as { v2: CloudinaryV2Mock };
    cloudAsTyped.v2.uploader = uploader;

    const fromSpy = jest
      .spyOn(Readable, 'from')
      .mockImplementationOnce((): Readable => {
        return {
          pipe: <T>(dest: T): T => {
            setImmediate(() => callbackRef?.(null, fakeResult));
            return dest;
          },
        } as unknown as Readable;
      });

    const buffer = Buffer.from('abc');
    const res = await uploadBufferToCloudinary(buffer, 'uploads', {});
    expect(res).toEqual(fakeResult);
    expect(uploader.upload_stream).toHaveBeenCalled();
    fromSpy.mockRestore();
  });

  it('uploadBufferToCloudinary rejects on upload error', async () => {
    let callbackRef:
      | ((error: Error | null, result?: unknown) => void)
      | undefined;

    const uploader = {
      upload_stream: jest
        .fn()
        .mockImplementation((_opts: unknown, cb: unknown) => {
          callbackRef = cb as (error: Error | null, result?: unknown) => void;
          return {};
        }),
    };

    const cloudAsTyped = cloudLib as unknown as { v2: CloudinaryV2Mock };
    cloudAsTyped.v2.uploader = uploader;

    const fromSpy = jest
      .spyOn(Readable, 'from')
      .mockImplementationOnce((): Readable => {
        return {
          pipe: <T>(dest: T): T => {
            setImmediate(() =>
              callbackRef?.(new Error('remote fail'), undefined),
            );
            return dest;
          },
        } as unknown as Readable;
      });

    await expect(uploadBufferToCloudinary(Buffer.from('x'))).rejects.toThrow(
      'remote fail',
    );
    expect(uploader.upload_stream).toHaveBeenCalled();
    fromSpy.mockRestore();
  });

  it('uploadBufferToCloudinary rejects on empty buffer', async () => {
    await expect(
      uploadBufferToCloudinary(Buffer.from(''), 'uploads'),
    ).rejects.toThrow('empty buffer');
  });
});
