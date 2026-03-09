'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Clock, Edit, ArrowLeft, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { formatRelativeTime } from '@/lib/utils';
import { ProductGrid } from '@/components/products/ProductGrid';
import { AddProductUrl } from '@/components/list/AddProductUrl';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function ListDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: list, isLoading: listLoading } = trpc.searches.getById.useQuery({ id });
  
  const { data: listItems, isLoading: itemsLoading } = trpc.searches.getListItems.useQuery(
    { listId: id },
    { enabled: !!list, refetchInterval: 3000 } // Poll for scraping updates
  );

  const removeMutation = trpc.searches.removeProductUrl.useMutation({
    onSuccess: () => {
      toast({ title: 'Ürün listeden kaldırıldı' });
      utils.searches.getListItems.invalidate({ listId: id });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (listLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Liste bulunamadı</h2>
        <Link href="/searches">
          <Button className="mt-4">Listelere Dön</Button>
        </Link>
      </div>
    );
  }

  // Extract products from list items
  const products = listItems
    ?.filter(item => item.status === 'scraped' && item.product)
    ?.map(item => item.product!) || [];
  
  const pendingCount = listItems?.filter(item => item.status === 'pending').length || 0;
  const failedItems = listItems?.filter(item => item.status === 'failed') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{list.name}</h1>
            <p className="text-muted-foreground">
              {list.query || 'Ürün karşılaştırma listesi'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/searches/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          </Link>
        </div>
      </div>

      {/* Add Product URL */}
      <AddProductUrl listId={id} />

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Ürün
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{products.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              İşleniyor
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {pendingCount > 0 ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <p className="text-2xl font-bold">{pendingCount}</p>
              </>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">0</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Son Güncelleme
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p>
              {list.updatedAt
                ? formatRelativeTime(new Date(list.updatedAt))
                : 'Yeni oluşturuldu'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Failed Items Warning */}
      {failedItems.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Eklenemedi ({failedItems.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {failedItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
                <div className="flex-1">
                  <p className="font-mono text-xs truncate">{item.productUrl}</p>
                  <p className="text-destructive text-xs">{item.errorMessage}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeMutation.mutate({ listItemId: item.id })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      {itemsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <Card className="flex flex-col items-center justify-center py-16">
          <Edit className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Henüz ürün yok</h2>
          <p className="mb-6 text-muted-foreground text-center">
            Yukarıdaki &quot;Ürün Ekle&quot; butonuna tıklayarak <br />
            beğendiğiniz ürünlerin linklerini ekleyin
          </p>
        </Card>
      )}
    </div>
  );
}
