import { createContext } from "react";
import type { ProductCart } from "./CartProvider";
import type { Product } from "../../interfaces/product";

interface CartContextType {
  cart: ProductCart[];
  isCartLoading: boolean;
  cartError: string | null;
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (productId: number, size?: string) => void;
  updateCartItemSize: (item: ProductCart, size: string) => void;
  incrementInCart: (product: ProductCart) => void;
  decrementInCart: (product: ProductCart) => void;
}

export const CartContext = createContext({} as CartContextType);
