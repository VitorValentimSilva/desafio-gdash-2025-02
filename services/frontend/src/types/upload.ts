export interface UploadResponse {
  id: string;
  filename: string;
  url: string;
  public_id?: string;
  mimeType?: string;
  size?: number;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: Meta;
}

export interface CreateUploadDto {
  file: File;
  folder?: string;
}
