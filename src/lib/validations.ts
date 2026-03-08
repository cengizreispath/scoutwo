import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
});

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(1, 'Şifre gerekli'),
  rememberMe: z.boolean().optional(),
});

export const createSearchSchema = z.object({
  name: z.string().min(1, 'Arama adı gerekli').max(50, 'Arama adı en fazla 50 karakter olabilir'),
  query: z.string().min(2, 'Arama kelimesi en az 2 karakter olmalı'),
  brandIds: z.array(z.string()).min(1, 'En az 1 marka seçmelisiniz').max(10, 'En fazla 10 marka seçebilirsiniz'),
});

export const updateSearchSchema = createSearchSchema.partial();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateSearchInput = z.infer<typeof createSearchSchema>;
export type UpdateSearchInput = z.infer<typeof updateSearchSchema>;
