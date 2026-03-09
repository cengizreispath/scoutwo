'use client';

import Link from 'next/link';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { formatRelativeTime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export default function SearchesPage() {
  const utils = trpc.useUtils();
  const { data: searches, isLoading } = trpc.searches.list.useQuery();

  const deleteMutation = trpc.searches.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Arama silindi' });
      utils.searches.list.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Listelerim</h1>
        <Link href="/searches/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Liste
          </Button>
        </Link>
      </div>

      {searches?.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <Search className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Henüz liste yok</h2>
          <p className="mb-6 text-muted-foreground">
            İlk listenizi oluşturarak başlayın
          </p>
          <Link href="/searches/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Liste Oluştur
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {searches?.map((search) => (
            <Card key={search.id} className="group relative">
              <Link href={`/searches/${search.id}`}>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{search.name}</CardTitle>
                  <CardDescription>
                    {search.query || 'Ürün karşılaştırma listesi'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {search.searchBrands.slice(0, 3).map((sb) => (
                      <span
                        key={sb.id}
                        className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                      >
                        {sb.brand.name}
                      </span>
                    ))}
                    {search.searchBrands.length > 3 && (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        +{search.searchBrands.length - 3}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatRelativeTime(new Date(search.updatedAt))}
                  </p>
                </CardContent>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm('Bu aramayı silmek istediğinizden emin misiniz?')) {
                    deleteMutation.mutate({ id: search.id });
                  }
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
