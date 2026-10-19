import { createContext } from "react";
import type { ProductCart } from "./CartProvider";
import type { CartProduct } from "../../interfaces/product";

interface CartContextType {
  cart: ProductCart[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: number) => void;
  incrementInCart: (product: ProductCart) => void;
  decrementInCart: (product: ProductCart) => void;
}

export const CartContext = createContext({} as CartContextType);
