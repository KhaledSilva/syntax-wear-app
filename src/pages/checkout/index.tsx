import { createFileRoute } from "@tanstack/react-router";
import { Logo } from "../../components/Logo";
import lockIcon from "../../assets/images/lock-icon.png";
import checkoutInfoIcon from "../../assets/images/checkout-info-icon.svg";
import checkoutDeliveryRadio from "../../assets/images/checkout-delivery-radio.svg";
import { formatCurrency } from "../../utils/format-currency";
import { useContext, useEffect, useState } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import type { Address } from "../../interfaces/address";
import { CartContext } from "../../contexts/CartContext/CartContext";
import { useAuth } from "../../contexts/AuthContext/AuthContext";
import { loadStripe } from "@stripe/stripe-js";

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

type CheckoutAddress = Omit<Address, "shippingCost"> & {
  shippingCost: number | null;
};

const isValidShippingCost = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

async function getCep(cep: string) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  return await response.json();
}

const FRETE_POR_REGIAO: Record<string, number> = {
  Norte: 39.9,
  Nordeste: 29.9,
  "Centro-Oeste": 24.9,
  Sudeste: 14.9,
  Sul: 19.9,
};

interface OrderItem {
  productId: number;
  quantity: number;
  size: string;
}

function sanitizeCheckoutErrorMessage(
  message: string,
  personalData: string[],
): string {
  let sanitizedMessage = message;

  for (const value of personalData.sort((a, b) => b.length - a.length)) {
    if (value.length >= 4) {
      sanitizedMessage = sanitizedMessage.replaceAll(value, "[dado pessoal removido]");
    }
  }

  return sanitizedMessage
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [credencial removida]")
    .replace(
      /\b(authorization|cookie|set-cookie|access[_-]?token|refresh[_-]?token|api[_-]?key|secret|password)\b\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi,
      "$1: [credencial removida]",
    )
    .replace(/\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]+\b/gi, "[chave Stripe removida]")
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Z]{2,}\b/gi, "[email removido]")
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, "[documento removido]")
    .replace(/\b\d{5}-?\d{3}\b/g, "[CEP removido]")
    .replace(/(?<!\d)(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?9?\d{4}[-\s]?\d{4}(?!\d)/g, "[telefone removido]")
    .replace(/\b\d{13,19}\b/g, "[número removido]")
    .trim();
}

async function createStripeCheckout(
  items: OrderItem[],
  shippingAddress: ShippingAddressFormData,
  shippingCost: number,
  paymentMethod: string,
  idempotencyKey: string,
): Promise<string> {
  if (!isValidShippingCost(shippingCost)) {
    throw new Error("Não foi possível calcular o frete. Verifique o CEP e tente novamente.");
  }

  const apiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");

  if (!apiUrl) {
    throw new Error("A variável VITE_API_URL não está configurada.");
  }

  const response = await fetch(`${apiUrl}/stripe/checkout/session`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      items,
      paymentMethod,
      shippingAddress,
      shippingCost,
    }),
  });

  const responseText = await response.text();
  let responseBody: unknown;

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }
  }

  if (!response.ok) {
    const body = responseBody;
    const backendMessage =
      typeof body === "object" && body !== null
        ? "message" in body && typeof body.message === "string"
          ? body.message
          : "error" in body && typeof body.error === "string"
            ? body.error
            : responseText
        : typeof body === "string"
          ? body
          : responseText;
    const message = sanitizeCheckoutErrorMessage(
      backendMessage || response.statusText,
      Object.values(shippingAddress).map(String),
    );

    throw new Error(
      `Falha ao criar checkout (HTTP ${response.status}): ${message}`,
    );
  }

  if (typeof responseBody === "string") {
    throw new Error("A API retornou uma resposta inválida.");
  }

  const checkoutResponseSchema = z.object({
    sessionId: z.string().trim().min(1),
  });
  const parsedResponse = checkoutResponseSchema.safeParse(responseBody);

  if (!parsedResponse.success) {
    throw new Error("A API retornou uma resposta de checkout inválida.");
  }

  return parsedResponse.data.sessionId;
}

export const Route = createFileRoute("/checkout/")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const {
    register,
    watch,
    setValue,
    getValues,
    formState: { errors },
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

  const [address, setAddress] = useState<CheckoutAddress | null>(null);

  const {
    cart,
    isCartLoading,
    cartError,
    updateCartItemSize,
  } = useContext(CartContext);
  const { user } = useAuth();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const cepValue = watch("cep");
  const hasIncompleteCartItem = cart.some(
    (item) =>
      !item.product ||
      !item.size ||
      !item.product.sizes.includes(item.size),
  );
  const subtotal =
    cart.every((item) => item.product !== null)
      ? cart.reduce(
          (total, item) =>
            total + (item.product?.price ?? 0) * item.quantity,
          0,
        )
      : null;
  const total =
    subtotal !== null && isValidShippingCost(address?.shippingCost)
      ? subtotal + address.shippingCost
      : null;

  useEffect(() => {
    setAddress(null);
    setCheckoutError(null);

    if (cepValue.length !== 8) return;

    async function fetchData() {
      try {
        const data = await getCep(cepValue);

        if (data.erro) {
          throw new Error("CEP não encontrado.");
        }

        const shippingCost = FRETE_POR_REGIAO[data.regiao];
        const validShippingCost = isValidShippingCost(shippingCost)
          ? shippingCost
          : null;

        setAddress({
          ...data,
          shippingCost: validShippingCost,
        });

        if (validShippingCost === null) {
          setCheckoutError("Não foi possível calcular o frete para esta região.");
        }

        setValue("street", data.logradouro);
        setValue("neighborhood", data.bairro);
        setValue("city", data.localidade);
        setValue("state", data.uf);
      } catch {
        setAddress(null);
        setCheckoutError("Não foi possível calcular o frete. Verifique o CEP e tente novamente.");
      }
    }

    fetchData();
  }, [cepValue, setValue]);

  const redirectToCheckout = async () => {
    if (!address || isCreatingCheckout) return;

    setCheckoutError(null);
    const shippingCost = address.shippingCost;

    if (!isValidShippingCost(shippingCost)) {
      setCheckoutError("Não foi possível calcular o frete para esta região.");
      return;
    }

    if (isCartLoading || cart.length === 0) {
      setCheckoutError(
        isCartLoading
          ? "Aguarde a atualização dos produtos do carrinho."
          : "Adicione produtos ao carrinho antes de finalizar o pedido.",
      );
      return;
    }

    const items: OrderItem[] = [];
    for (const item of cart) {
      const size = item.size?.trim();
      if (!item.product) {
        setCheckoutError(
          `O produto #${item.productId} não pôde ser atualizado. Remova-o do carrinho e tente novamente.`,
        );
        return;
      }

      if (!size || !item.product.sizes.includes(size)) {
        setCheckoutError(
          `Selecione um tamanho disponível para "${item.product.name}" no carrinho.`,
        );
        return;
      }

      items.push({
        productId: item.productId,
        quantity: item.quantity,
        size,
      });
    }

    setIsCreatingCheckout(true);

    try {
      const shippingData = getValues();
      const paymentMethod = "credit_card";
      const sessionId = await createStripeCheckout(
        items,
        shippingData,
        shippingCost,
        paymentMethod,
        crypto.randomUUID(),
      );

      if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
        throw new Error("A variável VITE_STRIPE_PUBLIC_KEY não está configurada.");
      }

      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

      if (!stripe) {
        throw new Error("Não foi possível inicializar o Stripe.");
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o checkout.",
      );
    } finally {
      setIsCreatingCheckout(false);
    }
  };

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
                {user?.email && <p>{user.email}</p>}
                {(user?.firstName || user?.lastName) && (
                  <p>{[user.firstName, user.lastName].filter(Boolean).join(" ")}</p>
                )}
                {!user && <p>Não foi possível carregar os dados do usuário.</p>}
                {user && !user.phone && <p>Telefone não informado.</p>}
              </div>

              {user?.phone && (
                <div className="relative rounded-md border border-[#E5E7EB]">
                  <div className="flex items-start gap-2 rounded-md bg-[#F5F5F7] p-2">
                    <img src={checkoutInfoIcon} alt="" />

                    <div>
                      <p className="text-xs leading-4 text-black">
                        Antes de continuar, verifique se o telefone para contato
                        está correto.
                      </p>

                      <p className="text-base leading-6 font-medium text-black">
                        {user.phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
                    {isValidShippingCost(address.shippingCost)
                      ? formatCurrency(address.shippingCost)
                      : "Frete indisponível"}
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
                  {cart.map((item, index) => (
                    <li
                      key={`${item.productId}-${item.size ?? "sem-tamanho"}-${index}`}
                      className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      {item.product?.images[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="size-16 shrink-0 bg-[#DDDDDD] object-cover"
                        />
                      )}

                      <div className="space-y-1 text-black">
                        <p>
                          {item.product?.name ??
                            `Produto #${item.productId} indisponível`}
                        </p>
                        <p>Quantidade: {item.quantity}</p>
                        <p>
                          Unitário:{" "}
                          {item.product
                            ? formatCurrency(item.product.price)
                            : "Preço indisponível"}
                        </p>
                        {item.product ? (
                          <label className="block text-sm">
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
                        ) : (
                          <p>Tamanho: {item.size || "Seleção pendente"}</p>
                        )}
                      </div>
                    </li>
                  ))}
                  {!isCartLoading && cart.length === 0 && (
                    <li className="py-4 text-sm text-gray-600">
                      Seu carrinho está vazio.
                    </li>
                  )}
                  {isCartLoading && (
                    <li className="py-4 text-sm text-gray-600">
                      Atualizando produtos do carrinho...
                    </li>
                  )}
                </ul>
                {cartError && (
                  <p role="alert" className="mt-3 text-sm text-red-500">
                    {cartError}
                  </p>
                )}
                {!isCartLoading && cart.length > 0 && hasIncompleteCartItem && (
                  <p role="alert" className="mt-3 text-sm text-red-500">
                    Atualize os produtos indisponíveis e selecione um tamanho
                    válido para cada item antes de finalizar.
                  </p>
                )}
              </div>

              <div className="space-y-1 py-4 text-black">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>
                    {subtotal === null
                      ? "Aguardando preços dos produtos"
                      : formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Frete</span>
                  <span>
                    {address
                      ? isValidShippingCost(address.shippingCost)
                        ? formatCurrency(address.shippingCost)
                        : "Indisponível"
                      : "A calcular"}
                  </span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    {total === null
                      ? "Indisponível"
                      : formatCurrency(total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="mt-auto w-full cursor-pointer rounded-md bg-black py-3 text-white"
                onClick={redirectToCheckout}
                disabled={
                  !address ||
                  !isValidShippingCost(address.shippingCost) ||
                  isCreatingCheckout ||
                  isCartLoading ||
                  cart.length === 0 ||
                  hasIncompleteCartItem
                }
              >
                {isCreatingCheckout ? "Processando..." : "Fechar pedido"}
              </button>
              {checkoutError && (
                <p role="alert" className="mt-2 text-sm text-red-500">
                  {checkoutError}
                </p>
              )}
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
