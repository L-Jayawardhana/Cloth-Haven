import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL as string | undefined;

export const api = axios.create({
  baseURL: baseURL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export type ApiListParams = Record<string, string | number | boolean | undefined>;

export async function getJson<T>(url: string, params?: ApiListParams): Promise<T> {
  const response = await api.get<T>(url, { params });
  return response.data;
}


