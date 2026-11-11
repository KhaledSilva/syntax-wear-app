import { Link } from "@tanstack/react-router";
import type { Product } from "../../interfaces/product";
import { MdAddShoppingCart } from "react-icons/md";
import { formatCurrency } from "../../utils/format-currency";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-md">
      <Link
        to="/products/$productId"
        params={{ productId: String(product.id) }}
      >
        {product.images?.[0] ? (
          <img
            className="w-full h-[400px] object-cover rounded-md"
            src={product.images[0]}
            alt={product.name}
          />
        ) : (
          <div className="w-full h-[400px] bg-[#dedede] rounded-md flex items-center justify-center">
            <span className="text-gray-500 text-4xl font-semibold">
              {product.name.toLowerCase().replaceAll(" ", "-")} 1
            </span>
          </div>
        )}
      </Link>

      <div className="text-black rounded-2xl p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>

        <p>{product.colors[0]}</p>

        <div className="flex justify-between mt-2.5">
          <p className="font-bold">{formatCurrency(product.price)}</p>

          <Link
            to="/products/$productId"
            params={{ productId: String(product.id) }}
            aria-label={`Escolher tamanho de ${product.name}`}
            className="flex items-center gap-1"
          >
            <MdAddShoppingCart className="h-7 w-7" />
            <span className="text-sm">Escolher tamanho</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
