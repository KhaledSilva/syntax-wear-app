import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { formatCurrency } from "../../../utils/format-currency";
import { CartContext } from "../../../contexts/CartContext/CartContext";
import { useContext } from "react";
import { CEPForm } from "../../../components/CEPForm";
import { getProductDetailById } from "../../../services/productService";

export const Route = createFileRoute("/_app/products/$productId")({
  loader: async ({ params }) => {
    const product = await getProductDetailById(params.productId);
    return { product };
  },

  component: RouteComponent,
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Produto não encontrado - Produtos - SyntaxWear" }],
      };
    }

    return {
      meta: [{ title: `${loaderData?.product?.name} - Produto - SyntaxWear` }],
    };
  },
  notFoundComponent: () => (
    <section className="container mb-10 pt-44 md:pt-54 pb-10 mb:px-10 text-center text-black min-h-[80vh] flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Produto não encontrado</h1>
      <p className="mb-6">
        O produto que você está procurando não existe ou foi removido
      </p>
      <Link
        to="/products"
        className="text-accent hover:text-accent-hover underline"
      >
        Voltar para produtos
      </Link>
    </section>
  ),
});

function RouteComponent() {
  const { addToCart } = useContext(CartContext);

  const { product } = useLoaderData({ from: Route.id });

  const originalPrice = product?.price ?? 0;

  const discountPrice = originalPrice * 0.9;

  const inInstallmentsPrice = originalPrice / 6;

  return (
    <section className="container mb-10 pt-44 md:pt-54 pb-10 mb:px-10">
      <nav className="text-black text-sm mb-15 ml-5">
        <Link to="/">Home</Link> / <Link to="/products">Produtos</Link> /{" "}
        <span className="font-semibold">{product?.name}</span>
      </nav>

      <div className="flex justify-center gap-10">
        {product?.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-[500px] h-[500px] object-contain bg-white rounded-2xl"
          />
        ) : (
          <div className="w-[500px] h-[500px] bg-[#dedede] rounded-2xl flex items-center justify-center">
            <span className="text-gray-500 text-2xl font-medium text-center px-6">
              {product?.name}
            </span>
          </div>
        )}

        <div className="text-black">
          <h1 className="text-4xl font-bold mb-1">{product?.name}</h1>

          <p className="mb-2">Cor: {product?.color}</p>

          <p className="line-through text-sm text-[#878787]">
            {formatCurrency(originalPrice)}
          </p>

          <p className="text-3xl font-bold mb-2">
            {formatCurrency(discountPrice)} no PIX
          </p>

          <p className="text-sm text-[#878787]">
            Você economiza: <span className="font-semibold">10%</span>
          </p>

          <p className="mb-2">
            ou <span className="text-[#38373a] font-semibold">6x</span> de{" "}
            <span className="text-[#38373a] font-semibold">
              {formatCurrency(inInstallmentsPrice)}
            </span>
          </p>

          <p className="max-w-[500px] my-5">{product?.description}</p>

          <div className="mb-6">
            <p className="text-sm">Calcular o prazo de entrega</p>

            <CEPForm />
          </div>

          <button
            className="bg-black text-white rounded-md p-5 w-full cursor-pointer hover:bg-gray-800"
            onClick={() => addToCart(product)}
          >
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </section>
  );
}
