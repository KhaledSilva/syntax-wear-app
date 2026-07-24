import { useEffect, useState } from "react"
import type { Product } from "../Interfaces/product"
import { CartContext } from "./CartContext"

interface CartProviderProps {
    children: React.ReactNode
}

export interface ProductCart extends Product {
    quantity: number
}

const localStorageKey = "@SyntaxWear:cart"

export const CartProvider = ({ children }: CartProviderProps) => {
    const [cart, setCart] = useState<ProductCart[]>(() => {
        const cartFromLocalStore = localStorage.getItem(localStorageKey)
        return cartFromLocalStore !== null ? JSON.parse(cartFromLocalStore) : []
    })

    useEffect(() => {
        localStorage.setItem(localStorageKey, JSON.stringify(cart))
    }, [cart])

    function addToCart(product: Product): void {
        const productExistsInCart = cart.find((itemIncart) => itemIncart.id === product.id)

        let newCart

        if (productExistsInCart) {
            newCart = cart.map((itemIncart) =>
                itemIncart.id === product.id
                    ? { ...itemIncart, quantity: itemIncart.quantity + 1 }
                    : itemIncart
            )
        } else {
            newCart = [...cart, { ...product, quantity: 1 }]
        }
        setCart(newCart)
    }

    function removeFromCart(productId: number): void {

        setCart(cart.filter(itemInCart => itemInCart.id !== productId))
    }

    function incrementInCart(product: ProductCart): void {
        updateProductQuantity(product, product.quantity + 1)
    }

    function decrementInCart(product: ProductCart): void {
        updateProductQuantity(product, product.quantity - 1)
    }

    function updateProductQuantity(product: ProductCart, newQuantity: number): void {
        if (newQuantity <= 0) return

        const productExistsInCart = cart.find(
            (itemIncart) => itemIncart.id === product.id
        )

        if (!productExistsInCart) return

        const newCart = cart.map((itemInCart) =>
            itemInCart.id === product.id
                ? { ...itemInCart, quantity: newQuantity }
                : itemInCart
        )

        setCart(newCart)
    }

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            incrementInCart,
            decrementInCart
        }}>{children}
        </CartContext.Provider>
    )
}
