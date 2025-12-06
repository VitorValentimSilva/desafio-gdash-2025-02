import { useCallback } from "react";
import type {
  CreateUploadDto,
  PaginatedResult,
  UploadResponse,
} from "@/types/upload";
import { uploadService } from "@/services/uploadService.ts";

export function useUploadsApi() {
  const upload = useCallback(
    (
      dto: CreateUploadDto,
      progressCallback?: (p: number) => void
    ): Promise<UploadResponse> => {
      return uploadService.upload(dto, progressCallback);
    },
    []
  );

  const list = useCallback(
    (page = 1, limit = 20): Promise<PaginatedResult<UploadResponse>> => {
      return uploadService.list(page, limit);
    },
    []
  );

  const get = useCallback((id: string): Promise<UploadResponse | null> => {
    return uploadService.get(id);
  }, []);

  return {
    upload,
    list,
    get,
  } as const;
}
