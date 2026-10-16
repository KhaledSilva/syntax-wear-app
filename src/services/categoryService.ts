import { notFound } from "@tanstack/react-router";
import type { Category } from "../interfaces/category";

const API_BASE_URL = "http://localhost:3000";

export async function getCategoryByName(
  name: string
): Promise<Category> {
  const params = new URLSearchParams({
    page: "1",
    limit: "100",
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
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar categoria (${response.status})`
    );
  }

  const result = await response.json();

  const categories: Category[] = Array.isArray(result)
    ? result
    : result.data ?? [];

  const category = categories.find(
    (item) =>
      item.slug.toLowerCase() === name.toLowerCase()
  );

  if (!category) {
    throw notFound();
  }

  return category;
}