import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/products/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container">
        <h1 className="text-back">OLÁ</h1>

        <p className="text-black">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Enim fugiat quaerat quia soluta eum adipisci natus iusto dolores illum labore. Fuga quos quam omnis veritatis soluta maiores placeat repellat enim.</p>
        <p className="text-black">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Enim fugiat quaerat quia soluta eum adipisci natus iusto dolores illum labore. Fuga quos quam omnis veritatis soluta maiores placeat repellat enim.</p>
        <p className="text-black">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Enim fugiat quaerat quia soluta eum adipisci natus iusto dolores illum labore. Fuga quos quam omnis veritatis soluta maiores placeat repellat enim.</p>
        <p className="text-black">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Enim fugiat quaerat quia soluta eum adipisci natus iusto dolores illum labore. Fuga quos quam omnis veritatis soluta maiores placeat repellat enim.</p>
        <p className="text-black">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Enim fugiat quaerat quia soluta eum adipisci natus iusto dolores illum labore. Fuga quos quam omnis veritatis soluta maiores placeat repellat enim.</p>
    </div>
  )
}
