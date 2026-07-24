import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

import type {
  ApiResponse,
  PaginationMeta,
} from '@server/src/common/api-response';
import { ApiError } from './api-error';

interface SuccessEnvelope<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginatedResult<T> {
  data: T;
  meta: PaginationMeta;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (!isRecord(value) || typeof value.success !== 'boolean') {
    return false;
  }

  if (value.success) {
    return 'data' in value;
  }

  return isRecord(value.error)
    && typeof value.error.code === 'string'
    && typeof value.error.message === 'string';
}

function apiErrorFromAxios(error: AxiosError): ApiError {
  const payload = error.response?.data;
  if (isApiResponse(payload) && !payload.success) {
    return new ApiError(
      payload.error.code,
      payload.error.message,
      payload.error.details,
    );
  }

  return new ApiError(
    error.response ? 'HTTP_ERROR' : 'NETWORK_ERROR',
    error.message,
    {
      status: error.response?.status,
      url: error.config?.url,
    },
  );
}

apiClient.interceptors.response.use(
  (response) => {
    if (response.status === 204) {
      return undefined as unknown as AxiosResponse;
    }

    const payload: unknown = response.data;
    if (!isApiResponse(payload)) {
      throw new ApiError(
        'INVALID_RESPONSE',
        'Phản hồi API không đúng định dạng.',
      );
    }

    if (!payload.success) {
      throw new ApiError(
        payload.error.code,
        payload.error.message,
        payload.error.details,
      );
    }

    return payload as unknown as AxiosResponse;
  },
  (error: unknown) => {
    if (error instanceof ApiError) {
      return Promise.reject(error);
    }

    return Promise.reject(
      axios.isAxiosError(error)
        ? apiErrorFromAxios(error)
        : new ApiError('UNKNOWN_ERROR', 'Không thể gọi API.', error),
    );
  },
);

async function getEnvelope<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<SuccessEnvelope<T>> {
  return apiClient.get<unknown, SuccessEnvelope<T>>(url, config);
}

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  return (await getEnvelope<T>(url, config)).data;
}

export async function apiGetPaginated<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<PaginatedResult<T>> {
  const envelope = await getEnvelope<T>(url, config);
  if (!envelope.meta) {
    throw new ApiError(
      'INVALID_RESPONSE',
      'Phản hồi phân trang không có metadata.',
    );
  }

  return { data: envelope.data, meta: envelope.meta };
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const envelope = await apiClient.post<unknown, SuccessEnvelope<T>>(url, data, config);
  return envelope.data;
}

export async function apiPostNoContent(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<void> {
  await apiClient.post<unknown, void>(url, data, config);
}

export async function apiPostFormData<T>(
  url: string,
  data: FormData,
  config?: AxiosRequestConfig,
): Promise<T> {
  const envelope = await apiClient.post<unknown, SuccessEnvelope<T>>(url, data, config);
  return envelope.data;
}
export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const envelope = await apiClient.put<unknown, SuccessEnvelope<T>>(url, data, config);
  return envelope.data;
}

export async function apiPatch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const envelope = await apiClient.patch<unknown, SuccessEnvelope<T>>(url, data, config);
  return envelope.data;
}

export async function apiDelete(
  url: string,
  config?: AxiosRequestConfig,
): Promise<void> {
  await apiClient.delete<unknown, void>(url, config);
}
