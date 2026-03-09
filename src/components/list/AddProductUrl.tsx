'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Loader2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const addUrlFormSchema = z.object({
  productUrl: z.string().url('Geçerli bir URL girin'),
});

type AddUrlFormData = z.infer<typeof addUrlFormSchema>;

interface AddProductUrlProps {
  listId: string;
}

export function AddProductUrl({ listId }: AddProductUrlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddUrlFormData>({
    resolver: zodResolver(addUrlFormSchema),
  });

  const addMutation = trpc.searches.addProductUrl.useMutation({
    onSuccess: () => {
      toast({ title: 'Ürün ekleniyor...', description: 'Ürün bilgileri çekiliyor' });
      utils.searches.getListItems.invalidate({ listId });
      reset();
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: AddUrlFormData) => {
    addMutation.mutate({
      listId,
      productUrl: data.productUrl,
    });
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="lg" className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Ürün Ekle
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Ürün URL&apos;i Ekle
        </CardTitle>
        <CardDescription>
          Herhangi bir e-ticaret sitesinden ürün linkini yapıştırın
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productUrl">Ürün Linki</Label>
            <Input
              id="productUrl"
              placeholder="https://example.com/urun-sayfasi"
              {...register('productUrl')}
            />
            {errors.productUrl && (
              <p className="text-sm text-destructive">{errors.productUrl.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Örn: Zara, H&M, Trendyol, N11, herhangi bir siteden ürün sayfası
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ekle
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                reset();
              }}
            >
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
