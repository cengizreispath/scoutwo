'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { createListSchema, type CreateListInput } from '@/lib/validations';
import { Loader2 } from 'lucide-react';

interface ListFormProps {
  onSubmit: (data: CreateListInput) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CreateListInput>;
}

export function ListForm({ onSubmit, isLoading, defaultValues }: ListFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateListInput>({
    resolver: zodResolver(createListSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
    },
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Liste Adı</Label>
            <Input
              id="name"
              placeholder="Örn: Yaz Alışverişi"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
            <Input
              id="description"
              placeholder="Bu liste hakkında kısa bir açıklama"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            💡 Liste oluşturduktan sonra ürün linklerini ekleyebilirsiniz
          </p>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {defaultValues ? 'Güncelle' : 'Oluştur'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Keep SearchForm as alias for backward compatibility during migration
export const SearchForm = ListForm;
