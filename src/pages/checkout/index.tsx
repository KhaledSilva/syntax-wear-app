import { createFileRoute } from "@tanstack/react-router";
import { Logo } from "../../components/Logo";
import lockIcon from "../../assets/images/lock-icon.png";
import checkoutInfoIcon from "../../assets/images/checkout-info-icon.svg";
import classicTeeImage from "../../assets/images/checkout-product-classic-tee.svg";
import vintageHoodieImage from "../../assets/images/checkout-product-vintage-hoodie.svg";
import checkoutDeliveryRadio from "../../assets/images/checkout-delivery-radio.svg";
import { formatCurrency } from "../../utils/format-currency";
import { useContext, useEffect, useState } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import type { Address } from "../../interfaces/address";
import { CartContext } from "../../contexts/CartContext/CartContext";
import { useAuth } from "../../contexts/AuthContext/AuthContext";
import type { ProductCart } from "../../contexts/CartContext/CartProvider";
import { loadStripe } from "@stripe/stripe-js"

const shippingAddressFormSchema = z.object({
  street: z.string().trim().min(1, { message: "A rua é obrigatória." }),
  number: z.coerce.number().min(1, { message: "O número é obrigatório." }),
  complement: z.string().optional(),
  neighborhood: z
    .string()
    .trim()
    .min(1, { message: "O bairro é obrigatório." }),
  city: z.string().trim().min(1, { message: "A cidade é obrigatória." }),
  state: z.string().trim().min(1, { message: "O estado é obrigatório." }),
  cep: z.string().trim().min(8, { message: "CEP inválido" }),
});

type ShippingAddressFormData = z.infer<typeof shippingAddressFormSchema>;

async function getCep(cep: string) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  return await response.json();
}

const FRETE_POR_REGIAO: Record<string, number> = {
  Norte: 39.9,
  Nortedeste: 29.9,
  "Centro-Oeste": 24.9,
  Sudeste: 14.9,
  Sul: 19.9,
};

interface OrderItem {
  productId: number
  quantity: number
  size?: string
}

async function createStripeCheckout(
  items: OrderItem[],
  shippingAddress: ShippingAddressFormData,
  shippingCost: number,
  paymentMethod: string,
  userId: number
) {
  const response = await fetch("http://localhost:3000/stripe/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items,
      paymentMethod,
      shippingAddress,
      shippingCost,
      userId
    })
  })

  return await response.json()
}

export const Route = createFileRoute("/checkout/")({
  component: CheckoutPage,
});

const orderItems = [
  {
    id: 1,
    name: "Classic Tee",
    quantity: 1,
    price: 29.99,
    image: classicTeeImage,
  },
  {
    id: 2,
    name: "Vintage Hoodie",
    quantity: 1,
    price: 59.9,
    image: vintageHoodieImage,
  },
];

function CheckoutPage() {
  const {
    reset,
    register,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ShippingAddressFormData>({
    resolver: zodResolver(
      shippingAddressFormSchema,
    ) as unknown as Resolver<ShippingAddressFormData>,
    defaultValues: {
      street: "" as any,
      number: "" as any,
      complement: "" as any,
      neighborhood: "" as any,
      city: "" as any,
      state: "" as any,
      cep: "" as any,
    },
    mode: "onBlur",
  });

  const [address, setAddress] = useState<Address | null>(null);

  const { cart } = useContext(CartContext)
  const { user } = useAuth()

  const cepValue = watch("cep");

  useEffect(() => {
    if (cepValue.length !== 8) return;

    async function fetchData() {
      const data = await getCep(cepValue);

      const shippingCost = FRETE_POR_REGIAO[data.regiao];

      setAddress({
        ...data,
        shippingCost,
      });

      setValue("street", data.logradouro);
      setValue("neighborhood", data.bairro);
      setValue("city", data.localidade);
      setValue("state", data.uf);
    }

    fetchData();
  }, [cepValue]);

  const redirectToCheckout = async () => {
    if (!address) return

    const shippingData = getValues();

    const paymentMethod = "credit_card";

    const items = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        size: item.sizes[0],
      }));

    const { sessionId } = await createStripeCheckout(
      items,
      shippingData,
      address?.shippingCost!,
      paymentMethod,
      user?.id!
    )

    if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) return

    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

    stripe?.redirectToCheckout({ sessionId })
  }

  const subtotal = orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen">
      <header className="bg-white mb-10">
        <div className="container flex items-center justify-between py-6">
          <Logo />

          <div className="flex items-center gap-2 text-black">
            <img src={lockIcon} alt="" />
            <p>100% seguro</p>
          </div>
        </div>
      </header>

      <div className="container pb-10">
        <div className="flex flex-col items-start gap-10 md:flex-row md:justify-between">
          <section className="w-full min-w-0 max-w-[684px] flex-1 space-y-10">
            <div className="space-y-4 rounded-md bg-white p-4">
              <h2 className="text-[20px] leading-7 font-medium text-black">
                Identificação
              </h2>

              <div className="space-y-1 text-sm leading-5 text-[#C5C5C5]">
                <p>robertodias@gmail.com</p>
                <p>Roberto Dias</p>
              </div>

              <div className="relative rounded-md border border-[#E5E7EB]">
                <div className="flex items-start gap-2 rounded-md bg-[#F5F5F7] p-2">
                  <img src={checkoutInfoIcon} alt="" />

                  <div>
                    <p className="text-xs leading-4 text-black">
                      Antes de continuar, verifique se o telefone para contato
                      está correto.
                    </p>

                    <p className="text-base leading-6 font-medium text-black">
                      13 82382378
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="absolute right-3 bottom-2 text-sm leading-5 text-[#79B5B3] underline cursor-pointer"
                >
                  editar telefone
                </button>
              </div>
            </div>

            <section className="space-y-6 text-black">
              <div>
                <h2 className="text-2xl font-semibold">Informe seu endereço</h2>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="cep"
                    className="w-full max-w-[310px] rounded-md border border-[#E5E7EB] bg-white p-4 text-black placeholder:text-[#9CA3AF]"
                    {...register("cep")}
                  />

                  <button
                    type="button"
                    className="rounded-md bg-black px-6 py-4 text-white cursor-pointer"
                  >
                    Buscar
                  </button>
                </div>
                {errors.cep && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cep.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-semibold">Endereço</label>
                <input
                  type="text"
                  placeholder="street"
                  className="w-full rounded-md border border-[#E5E7EB] bg-white p-4 text-black placeholder:text-[#9CA3AF]"
                  {...register("street")}
                />
                {errors.street && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.street.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-semibold">Número</label>
                  <input
                    type="text"
                    placeholder="number"
                    className="w-full rounded-md border border-[#E5E7EB] bg-white p-4 text-black placeholder:text-[#9CA3AF]"
                    {...register("number")}
                  />
                  {errors.number && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.number.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-semibold">Complemento</label>
                  <input
                    type="text"
                    placeholder="complement"
                    className="w-full rounded-md border border-[#E5E7EB] bg-white p-4 text-black placeholder:text-[#9CA3AF]"
                    {...register("complement")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold">Bairro</label>
                <input
                  type="text"
                  placeholder="neighborhood"
                  className="w-full rounded-md border border-[#E5E7EB] bg-white p-4 text-black placeholder:text-[#9CA3AF]"
                  {...register("neighborhood")}
                />
                {errors.neighborhood && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.neighborhood.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-semibold">Cidade</label>
                  <input
                    type="text"
                    placeholder="city"
                    className="w-full rounded-md border border-[#E5E7EB] bg-white p-4 text-black placeholder:text-[#9CA3AF]"
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-semibold">Estado</label>
                  <input
                    type="text"
                    placeholder="state"
                    className="w-full rounded-md border border-[#E5E7EB] bg-white p-4 text-black placeholder:text-[#9CA3AF]"
                    {...register("state")}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.state.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {address && (
              <section className="space-y-6 text-black">
                <h2 className="text-2xl font-semibold">
                  Escolha a forma de entrega
                </h2>

                <div className="flex items-center justify-between border border-[#E5E7EB] rounded-md p-4">
                  <label className="flex cursor-pointer items-center gap-4">
                    <img
                      src={checkoutDeliveryRadio}
                      alt=""
                      className="mt-1 h-5 w-4"
                    />

                    <div>
                      <p className="font-semibold">Entrega rápida</p>
                      <p className="text-sm text-gray-500">
                        Receba em até 5 dias úteis
                      </p>
                    </div>
                  </label>

                  <p className="font-semibold">
                    {formatCurrency(address.shippingCost)}
                  </p>
                </div>
              </section>
            )}
          </section>
          
          <aside className="w-full max-w-[320px] shrink-0 md:sticky md:top-[116px] md:h-[calc(100dvh-116px)] md:overflow-y-auto md:scrollbar-hide">
            <div className="flex min-h-full flex-col">
              <div className="rounded-md bg-white p-4">
                <h2 className="mb-4 text-[20px] leading-7 font-medium text-black">
                  Resumo do pedido
                </h2>

                <ul className="max-h-[220px] divide-y divide-[#E5E7EB] overflow-y-auto">
                  {orderItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-16 shrink-0 bg-[#DDDDDD] object-cover"
                      />

                      <div className="space-y-1 text-black">
                        <p>{item.name}</p>
                        <p>Quantidade: {item.quantity}</p>
                        <p>{formatCurrency(item.price)} à vista</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1 py-4 text-black">
                <div className="flex items-center justify-between text-sm leading-5">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Frete</span>
                  <span>
                    {address
                      ? formatCurrency(address.shippingCost)
                      : "A calcular"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal)} à vista</span>
                </div>
              </div>

              <button
                type="button"
                className="mt-auto w-full cursor-pointer rounded-md bg-black py-3 text-white"
                onClick={redirectToCheckout}
                disabled={!address}
              >
                Fechar pedido
              </button>
            </div>
          </aside>
        </div>
      </div>

      <footer className="bg-white p-4">
        <p className="text-[#4A5565] text-center">
          Preços e condições exclusivos para o site www.iplace.com.br e para o
          televendas, podendo sofrer alterações sem prévia notificação. Global
          Distribuição de Bens de Consumo LTDA / www.iplace.com.br / BR 116, km
          223,5 Nº 7350 / Dois Irmãos - RS / CEP 93950-000 / CNPJ:
          89.237.911/0001-40
        </p>
      </footer>
    </div>
  );
}
