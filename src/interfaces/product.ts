export interface CartProduct {
    id: number
    name: string
    price: number
    images: string[]
}

export interface Product extends CartProduct {
    colors: string[]
    categoryId: number
    slug: string
    stock: number
    active: boolean
    color: string
    description: string
}
