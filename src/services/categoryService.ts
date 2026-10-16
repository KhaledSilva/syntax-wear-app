import { notFound } from "@tanstack/react-router";
import type { Category } from "../interfaces/category";

const API_BASE_URL = "http://localhost:3000";

interface CategoryResponse {
  data: Category[];
}

export async function getCategoryByName(name: string): Promise<Category> {
  const params = new URLSearchParams({
    page: "1",
    limit: "1",
    search: name,
  });

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Você precisa fazer login antes de buscar categorias.");
  }

  const response = await fetch(
    `${API_BASE_URL}/categories?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status === 401) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(
      `Erro ao buscar categoria (${response.status}): ${errorMessage}`,
    );
  }

  const result: CategoryResponse = await response.json();

  if (!result.data || result.data.length === 0) {
    throw notFound();
  }

  return result.data[0];
}