import type { Product } from "../interfaces/product";

const API_BASE_URL = "http://localhost:3000";
const DEFAULT_LIMIT = 3;

interface GetProductParams {
  page: number;
  limit?: number;
}

interface ProductResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export async function getProducts({
  page,
  limit = DEFAULT_LIMIT,
}: GetProductParams): Promise<ProductResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const url = `${API_BASE_URL}/products?${params.toString()}`;

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Você precisa fazer login antes de buscar produtos.");
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMessage = await response.text();

    throw new Error(
      `Erro ao buscar produtos (${response.status}): ${errorMessage}`,
    );
  }

  return response.json();
}
