import { createFileRoute } from "@tanstack/react-router";
import { formatCurrency } from "../../../../utils/format-currency";

type MonetaryValue = number | string;

interface ShippingAddress {
  cep: string;
  city: string;
  state: string;
  number: string;
  street: string;
  complement: string | null;
  neighborhood: string;
}

interface OrderItem {
  id?: number;
  productId?: number;
  quantity?: number;
  size?: string;
  product?: Record<string, unknown>;
  [key: string]: unknown;
}

interface Order {
  id: number;
  userId: number;
  total: MonetaryValue;
  status: string;
  paymentStatus: string;
  shippingAddress: ShippingAddress;
  shippingCost: MonetaryValue;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMonetaryValue(value: unknown): value is MonetaryValue {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    Number.isFinite(Number(value))
  );
}

function isShippingAddress(value: unknown): value is ShippingAddress {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.cep === "string" &&
    typeof value.city === "string" &&
    typeof value.state === "string" &&
    typeof value.number === "string" &&
    typeof value.street === "string" &&
    (typeof value.complement === "string" || value.complement === null) &&
    typeof value.neighborhood === "string"
  );
}

function isOrderItem(value: unknown): value is OrderItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.id === undefined || Number.isInteger(value.id)) &&
    (value.productId === undefined || Number.isInteger(value.productId)) &&
    (value.quantity === undefined || Number.isFinite(value.quantity)) &&
    (value.size === undefined || typeof value.size === "string") &&
    (value.product === undefined || isRecord(value.product))
  );
}

function isOrder(value: unknown): value is Order {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const order = value as Record<string, unknown>;

  return (
    Number.isInteger(order.id) &&
    Number.isInteger(order.userId) &&
    isMonetaryValue(order.total) &&
    typeof order.status === "string" &&
    typeof order.paymentStatus === "string" &&
    isShippingAddress(order.shippingAddress) &&
    isMonetaryValue(order.shippingCost) &&
    typeof order.paymentMethod === "string" &&
    typeof order.createdAt === "string" &&
    Number.isFinite(Date.parse(order.createdAt)) &&
    typeof order.updatedAt === "string" &&
    Number.isFinite(Date.parse(order.updatedAt)) &&
    Array.isArray(order.items) &&
    order.items.every(isOrderItem)
  );
}

function isOrderArray(value: unknown): value is Order[] {
  return Array.isArray(value) && value.every(isOrder);
}

function getStatusColor(status: string) {
  switch (status) {
    case "PAID":
      return "#00A63E";
    case "PENDING":
      return "#D08700";
    case "CANCELLED":
      return "#E7000B";
    default:
      return "#6A7282";
  }
}

async function getOrders(): Promise<Order[]> {
  const response = await fetch("http://localhost:3000/orders", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Erro ao carregar pedidos (${response.status}).`);
  }

  const data: unknown = await response.json();

  if (!isOrderArray(data)) {
    throw new Error("A resposta da API contém pedidos em formato inválido.");
  }

  return data;
}

export const Route = createFileRoute("/_app/account/orders/")({
  loader: getOrders,
  pendingComponent: OrdersLoading,
  errorComponent: OrdersError,
  component: OrderPage,
});

function OrdersLoading() {
  return (
    <section
      className="w-full space-y-6 p-6 flex justify-center mt-36"
      aria-live="polite"
    >
      <div className="w-full max-w-[896px]">
        <h1 className="text-2xl leading-8 font-bold text-black mb-6">
          Meus pedidos
        </h1>
        <p className="text-sm leading-5 text-[#6A7282]">
          Carregando pedidos...
        </p>
      </div>
    </section>
  );
}

function OrdersError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="w-full space-y-6 p-6 flex justify-center mt-36">
      <div className="w-full max-w-[896px]">
        <h1 className="text-2xl leading-8 font-bold text-black mb-6">
          Meus pedidos
        </h1>
        <p className="text-sm leading-5 text-[#E7000B]" role="alert">
          {error.message || "Não foi possível carregar seus pedidos."}
        </p>
        <button
          type="button"
          className="mt-4 rounded-md border border-black px-4 py-2 text-sm font-bold text-black"
          onClick={reset}
        >
          Tentar novamente
        </button>
      </div>
    </section>
  );
}

function OrderPage() {
  const orders = Route.useLoaderData();

  return (
    <section className="w-full space-y-6 p-6 flex justify-center mt-36">
      <div className="w-full max-w-[896px] ">
        <h1 className="text-2xl leading-8 font-bold text-black mb-6">
          Meus pedidos
        </h1>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-sm leading-5 text-[#6A7282]">
              Você ainda não possui pedidos.
            </p>
          ) : (
            orders.map((order) => (
              <article
                key={order.id}
                className="flex items-center justify-between rounded-md border border-black p-4"
              >
                <div>
                  <p className="text-base leading-6 text-black font-bold">
                    Pedido #{order.id}
                  </p>
                  <p className="text-sm leading-5 text-[#6A7282]">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-base leading-6 font-bold text-black">
                    {formatCurrency(Number(order.total))}
                  </p>
                  <p
                    className="text-sm leading-5"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}