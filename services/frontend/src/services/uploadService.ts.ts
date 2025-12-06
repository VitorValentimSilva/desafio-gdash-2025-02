import api from "@/services/api";
import type {
  CreateUploadDto,
  UploadResponse,
  PaginatedResult,
} from "@/types/upload";
import type { AxiosProgressEvent } from "axios";

export const uploadService = {
  async upload(
    dto: CreateUploadDto,
    progressCallback?: (progress: number) => void
  ): Promise<UploadResponse> {
    const form = new FormData();
    form.append("file", dto.file);
    if (dto.folder) form.append("folder", dto.folder);

    const { data } = await api.post<UploadResponse>("/uploads", form, {
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        const loaded = progressEvent?.loaded;
        const total = progressEvent?.total;

        if (
          typeof loaded !== "number" ||
          typeof total !== "number" ||
          total === 0
        ) {
          return;
        }

        const percent = Math.round((loaded * 100) / total);
        progressCallback?.(percent);
      },
    });

    return data;
  },

  async list(page = 1, limit = 20): Promise<PaginatedResult<UploadResponse>> {
    const { data } = await api.get<PaginatedResult<UploadResponse>>(
      "/uploads",
      {
        params: { page, limit },
      }
    );
    return data;
  },

  async get(id: string): Promise<UploadResponse | null> {
    const { data } = await api.get<UploadResponse | null>(`/uploads/${id}`);
    return data;
  },
};
