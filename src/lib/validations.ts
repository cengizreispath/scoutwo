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

// Updated for comparison lists (removed query and brandIds requirements)
export const createListSchema = z.object({
  name: z.string().min(1, 'Liste adı gerekli').max(50, 'Liste adı en fazla 50 karakter olabilir'),
  description: z.string().max(200, 'Açıklama en fazla 200 karakter olabilir').optional(),
});

export const updateListSchema = createListSchema.partial();

// New validation for adding product URLs
export const addProductUrlSchema = z.object({
  listId: z.string().uuid('Geçerli bir liste ID gerekli'),
  productUrl: z.string().url('Geçerli bir URL girin'),
});

export const removeProductUrlSchema = z.object({
  listItemId: z.string().uuid('Geçerli bir ürün ID gerekli'),
});

// Legacy schemas (keeping for backward compatibility during migration)
export const createSearchSchema = z.object({
  name: z.string().min(1, 'Arama adı gerekli').max(50, 'Arama adı en fazla 50 karakter olabilir'),
  query: z.string().min(2, 'Arama kelimesi en az 2 karakter olmalı').optional().default(''),
  brandIds: z.array(z.string()).min(0).max(10, 'En fazla 10 marka seçebilirsiniz').optional().default([]),
});

export const updateSearchSchema = createSearchSchema.partial();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type AddProductUrlInput = z.infer<typeof addProductUrlSchema>;
export type RemoveProductUrlInput = z.infer<typeof removeProductUrlSchema>;
export type CreateSearchInput = z.infer<typeof createSearchSchema>;
export type UpdateSearchInput = z.infer<typeof updateSearchSchema>;
