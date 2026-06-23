import { z } from "zod";
import zxcvbn from "zxcvbn";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(6, "Minimum 6 caractères"),
  role: z.enum(["SUPER_ADMIN", "COLLABORATOR"], {
    required_error: "Veuillez sélectionner un rôle",
    message: "Rôle invalide",
  }),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Le nom est requis")
      .min(2, "Minimum 2 caractères"),
    email: z
      .string()
      .min(1, "L'email est requis")
      .email("Format d'email invalide"),
    password: z
      .string()
      .min(1, "Le mot de passe est requis")
      .min(6, "Minimum 6 caractères"),
    confirmPassword: z
      .string()
      .min(1, "La confirmation est requise"),
    role: z.enum(["SUPER_ADMIN", "COLLABORATOR"], {
      required_error: "Veuillez sélectionner un rôle",
      message: "Rôle invalide",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
  .refine((data) => zxcvbn(data.password).score >= 2, {
    message:
      "Mot de passe trop faible. Ajoutez majuscules, chiffres ou symboles.",
    path: ["password"],
  });

export const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
};
