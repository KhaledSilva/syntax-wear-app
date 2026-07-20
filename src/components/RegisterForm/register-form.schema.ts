import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { isValidCPF } from "../../utils/cpf-validator";


export const registerUserFormSchema = z
    .object({
        firstName: z.string().min(1, "Primeiro nome é obrigatório"),
        lastName: z.string().min(1, "Último nome é obrigatório"),

        email: z
            .string()
            .trim()
            .min(1, "E-mail é obrigatório")
            .pipe(z.email("E-mail inválido")),

        password: z
            .string()
            .min(8, "A senha deve ter no mínimo 8 caracteres"),

        confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),

        cpf: z
            .string()
            .min(1, "CPF é obrigatório")
            .refine(isValidCPF, {
                message: "CPF inválido",
            }),

        birthDate: z
            .string()
            .refine(
                (date) => !isNaN(Date.parse(date)),
                "Data de nascimento inválida"
            ),

        phone: z.string().min(1, "Telefone é obrigatório")
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "As senhas não coincidem",
    });

export type RegisterSchema = z.infer<typeof registerUserFormSchema>;

export const useRegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerUserFormSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      cpf: "",
      birthDate: "",
      phone: "",
    },
    criteriaMode: "all",
  });

  return {
    handleSubmit,
    register,
    errors,
    isSubmitting,
    setError,
    reset
  }
}