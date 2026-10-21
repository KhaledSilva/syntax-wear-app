import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { useAuth } from "../../contexts/AuthContext/AuthContext";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export const LoginForm = () => {

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();

  const navigate = useNavigate();

  const signInFormSchema = z.object({
    email: z.email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  });

  type singInFormData = z.infer<typeof signInFormSchema>

  const { register, handleSubmit, formState: { errors } } = useForm<singInFormData>({
    resolver: zodResolver(signInFormSchema),
  })

  const onSubmit = async (data: singInFormData) => {
    setIsSubmitting(true);
    
    try {
      await login(data);
      navigate({ to: "/"});
    } catch (error) {
      console.error("Erro ao fazer login:", error);

      if (error instanceof Error) {
        setError(error.message);
      }
      else {
        setError("Erro desconhecido ao fazer login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-3.5" onSubmit={handleSubmit(onSubmit)}>
      <input
        className="border rounded-[1px] border-gray-200 w-full text-black p-3"
        type="email"
        placeholder="E-mail"
        {...register("email")}
      />

      {errors.email && (
        <span className="text-red-500 text-sm">{errors.email.message}</span>
      )}
      <input
        className="border rounded-[1px] border-gray-200 w-full text-black p-3"
        type="password"
        placeholder="Senha"
        {...register("password")}
      />
      {errors.password && (
        <span className="text-red-500 text-sm">{errors.password.message}</span>
      )}

      <button
        className="bg-[#212A2F] w-full p-3.5 rounded-[1px] cursor-pointer text-white disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enviando..." : "Continuar"}
      </button>
      
      { error && <span className="text-red-500 text-sm text-center">{error}</span> }
    </form>
  );
};
