import { useEffect, useState } from "react";
import type { Product } from "../../interfaces/product";
import { getProductDetailById } from "../../services/productService";
import { CartContext } from "./CartContext";

interface CartProviderProps {
  children: React.ReactNode;
}

export interface ProductCart {
  productId: number;
  quantity: number;
  size?: string;
  product: Product | null;
}

interface StoredCartItem {
  productId: number;
  quantity: number;
  size?: string;
}

const localStorageKey = "@SyntaxWear:cart";

function readStoredCart(): StoredCartItem[] {
  const savedCart = localStorage.getItem(localStorageKey);

  if (savedCart === null) return [];

  const parsedCart: unknown = JSON.parse(savedCart);

  if (!Array.isArray(parsedCart)) {
    throw new Error("Os dados salvos no carrinho são inválidos.");
  }

  return parsedCart.map((item: unknown) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("Os dados salvos no carrinho são inválidos.");
    }

    const savedItem = item as Record<string, unknown>;
    const productId = savedItem.productId ?? savedItem.id;

    if (
      typeof productId !== "number" ||
      !Number.isInteger(productId) ||
      productId <= 0 ||
      typeof savedItem.quantity !== "number" ||
      !Number.isInteger(savedItem.quantity) ||
      savedItem.quantity <= 0 ||
      (savedItem.size !== undefined && typeof savedItem.size !== "string")
    ) {
      throw new Error("Os dados salvos no carrinho são inválidos.");
    }

    return {
      productId,
      quantity: savedItem.quantity,
      ...(typeof savedItem.size === "string" ? { size: savedItem.size } : {}),
    };
  });
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<ProductCart[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);
  const [hasRecoveredCart, setHasRecoveredCart] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restoreCart() {
      try {
        const storedItems = readStoredCart();
        const restoredItems = await Promise.all(
          storedItems.map(async (item) => {
            try {
              const product = await getProductDetailById(
                String(item.productId),
              );
              return { ...item, product };
            } catch {
              return { ...item, product: null };
            }
          }),
        );

        if (cancelled) return;

        setCart(restoredItems);
        setHasRecoveredCart(true);
        if (restoredItems.some((item) => item.product === null)) {
          setCartError(
            "Não foi possível atualizar um ou mais produtos do carrinho. Remova-os ou tente novamente.",
          );
        }
      } catch {
        if (!cancelled) {
          setCartError(
            "Não foi possível recuperar o carrinho salvo. Recarregue a página para tentar novamente.",
          );
        }
      } finally {
        if (!cancelled) setIsCartLoading(false);
      }
    }

    restoreCart();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isCartLoading || !hasRecoveredCart) return;

    try {
      const storedItems: StoredCartItem[] = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        ...(item.size ? { size: item.size } : {}),
      }));
      localStorage.setItem(localStorageKey, JSON.stringify(storedItems));
    } catch {
      setCartError("Não foi possível salvar as alterações do carrinho.");
    }
  }, [cart, hasRecoveredCart, isCartLoading]);

  function addToCart(product: Product, size: string): void {
    if (isCartLoading) {
      setCartError("Aguarde a atualização dos itens do carrinho.");
      return;
    }

    if (!product.sizes.includes(size)) {
      setCartError("Selecione um tamanho válido para adicionar o produto.");
      return;
    }

    setCartError(null);
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.productId === product.id && item.size === size,
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item === existingItem
            ? { ...item, quantity: item.quantity + 1, product }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          productId: product.id,
          quantity: 1,
          size,
          product,
        },
      ];
    });
  }

  function removeFromCart(productId: number, size?: string): void {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.productId !== productId || item.size !== size,
      ),
    );
    setCartError(null);
  }

  function updateCartItemSize(itemToUpdate: ProductCart, size: string): void {
    if (!itemToUpdate.product?.sizes.includes(size)) return;

    setCart((currentCart) => {
      const matchingItem = currentCart.find(
        (item) =>
          item !== itemToUpdate &&
          item.productId === itemToUpdate.productId &&
          item.size === size,
      );

      if (matchingItem) {
        return currentCart
          .filter((item) => item !== itemToUpdate)
          .map((item) =>
            item === matchingItem
              ? { ...item, quantity: item.quantity + itemToUpdate.quantity }
              : item,
          );
      }

      return currentCart.map((item) =>
        item === itemToUpdate ? { ...item, size } : item,
      );
    });
    setCartError(null);
  }

  function incrementInCart(itemToUpdate: ProductCart): void {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item === itemToUpdate ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  function decrementInCart(itemToUpdate: ProductCart): void {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item === itemToUpdate && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartLoading,
        cartError,
        addToCart,
        removeFromCart,
        updateCartItemSize,
        incrementInCart,
        decrementInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
