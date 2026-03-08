'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { BrandSelector } from './BrandSelector';
import { createSearchSchema, type CreateSearchInput } from '@/lib/validations';
import { Loader2 } from 'lucide-react';

interface SearchFormProps {
  onSubmit: (data: CreateSearchInput) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CreateSearchInput>;
}

export function SearchForm({ onSubmit, isLoading, defaultValues }: SearchFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateSearchInput>({
    resolver: zodResolver(createSearchSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      query: defaultValues?.query ?? '',
      brandIds: defaultValues?.brandIds ?? [],
    },
  });

  const selectedBrands = watch('brandIds');

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Arama Adı</Label>
            <Input
              id="name"
              placeholder="Örn: Yazlık Elbiseler"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="query">Arama Kelimesi</Label>
            <Input
              id="query"
              placeholder="Örn: keten pantolon"
              {...register('query')}
            />
            {errors.query && (
              <p className="text-sm text-destructive">{errors.query.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Markalar</Label>
            <p className="text-sm text-muted-foreground">
              En az 1, en fazla 10 marka seçebilirsiniz
            </p>
            <BrandSelector
              selectedBrands={selectedBrands}
              onSelectionChange={(brands) => setValue('brandIds', brands)}
            />
            {errors.brandIds && (
              <p className="text-sm text-destructive">{errors.brandIds.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {defaultValues ? 'Güncelle' : 'Oluştur'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
