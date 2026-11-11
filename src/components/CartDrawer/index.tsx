import { useContext } from "react";
import { CartContext } from "../../contexts/CartContext/CartContext";
import { formatCurrency } from "../../utils/format-currency";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const {
    cart,
    isCartLoading,
    cartError,
    removeFromCart,
    updateCartItemSize,
    incrementInCart,
    decrementInCart,
  } = useContext(CartContext);

  return (
    <>
      <div className={`${isOpen ?"bg-black/70 visible" : "bg-transparent invisible"} text-black fixed inset-0 z-50 transition-all duration-600 ease-in-out`} onClick={onClose}>
        <div
          className={`${isOpen ? "translate-x-0" : "translate-x-full"} absolute top-0 right-0 bottom-0 bg-white pt-6 transition-all duration-600 ease-in-out w-75 md:w-100`}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between px-5">
            <p className="text-2xl font-bold">
              Carrinho ({cart.reduce((total, item) => total + item.quantity, 0)})
            </p>
            <button className="text-xl cursor-pointer" onClick={onClose}>
              X
            </button>
          </header>

          <ul className="p-4 overflow-y-auto scrollbar-hide h-[calc(100%_-_140px)] flex flex-col gap-3">
            {isCartLoading && <li>Atualizando produtos do carrinho...</li>}
            {!isCartLoading && cart.length === 0 && (
              <li>Seu carrinho está vazio.</li>
            )}
            {cart.map((item, index) => (
              <li
                key={`${item.productId}-${item.size ?? "sem-tamanho"}-${index}`}
                className="flex flex-col gap-1 px-6"
              >
                <button
                  className="self-end text-xs cursor-pointer"
                  onClick={() => removeFromCart(item.productId, item.size)}
                >
                  X
                </button>

                <div className="flex gap-4">
                  <img
                    src={item.product?.images[0] || "/placeholder.png"}
                    alt={item.product?.name ?? "Produto indisponível"}
                    className="w-16 h-16"
                  />

                  <div className="flex flex-col items-start">
                    <p className="mb-1 text-sm">
                      {item.product?.name ?? `Produto #${item.productId} indisponível`}
                    </p>
                    <p className="mb-1 text-sm">
                      Quantidade: {item.quantity}
                    </p>

                    {item.product && (
                      <p className="mb-3.5">
                        <span>{formatCurrency(item.product.price)}</span> à vista
                      </p>
                    )}

                    <div className="border flex gap-6 py-1 px-3">
                      <button
                        className="cursor-pointer"
                        onClick={() => decrementInCart(item)}
                      >
                        -
                      </button>
                      <p>{item.quantity}</p>
                      <button
                        className="cursor-pointer"
                        onClick={() => incrementInCart(item)}
                      >
                        +
                      </button>
                    </div>

                    {item.product && (
                      <label className="mt-3 text-sm">
                        Tamanho
                        <select
                          value={item.size ?? ""}
                          onChange={(event) =>
                            updateCartItemSize(item, event.target.value)
                          }
                          className="ml-2 rounded border p-1"
                        >
                          <option value="">Selecione</option>
                          {item.size &&
                            !item.product.sizes.includes(item.size) && (
                              <option value={item.size}>
                                {item.size} (indisponível)
                              </option>
                            )}
                          {item.product.sizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                </div>
              </li>
            ))}
            {cartError && (
              <li role="alert" className="text-sm text-red-600">
                {cartError}
              </li>
            )}
          </ul>

          <footer className="absolute bottom-0 w-full h-[100px] p-4">
            <button className="w-full h-full bg-black text-white rounded-xs cursor-pointer hover:bg-gray-800">
              Fechar pedido
            </button>
          </footer>
        </div>
      </div>
    </>
  );
};
