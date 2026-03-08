'use client';

import { use, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RefreshCw, Clock, Edit, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { formatRelativeTime } from '@/lib/utils';
import { ProductGrid } from '@/components/products/ProductGrid';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function SearchDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: search, isLoading: searchLoading } = trpc.searches.getById.useQuery({ id });
  
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = trpc.products.getBySearch.useQuery(
    { searchId: id, page: 1, limit: 50 },
    { enabled: !!search }
  );

  const { data: scrapeStatus } = trpc.scraping.status.useQuery(
    { searchId: id },
    { enabled: !!search, refetchInterval: isRefreshing ? 2000 : false }
  );

  const triggerScrapeMutation = trpc.searches.triggerScrape.useMutation({
    onSuccess: () => {
      setIsRefreshing(true);
      toast({ title: 'Ürünler güncelleniyor...' });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Poll for scrape completion
  useEffect(() => {
    if (scrapeStatus?.status === 'completed' && isRefreshing) {
      setIsRefreshing(false);
      refetchProducts();
      toast({ title: 'Ürünler güncellendi!' });
    }
  }, [scrapeStatus?.status, isRefreshing, refetchProducts]);

  if (searchLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!search) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Arama bulunamadı</h2>
        <Link href="/searches">
          <Button className="mt-4">Aramalara Dön</Button>
        </Link>
      </div>
    );
  }

  const isScrapingActive = scrapeStatus?.status === 'queued' || scrapeStatus?.status === 'processing' || isRefreshing;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{search.name}</h1>
            <p className="text-muted-foreground">Arama: &quot;{search.query}&quot;</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/searches/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          </Link>
          <Button
            onClick={() => triggerScrapeMutation.mutate({ searchId: id })}
            disabled={isScrapingActive}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isScrapingActive ? 'animate-spin' : ''}`} />
            Ürünleri Listele
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Seçili Markalar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {search.searchBrands.map((sb) => (
                <span
                  key={sb.id}
                  className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                >
                  {sb.brand.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Ürün
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {productsData?.pagination.total ?? 0}
            </p>
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
              {productsData?.lastScrapedAt
                ? formatRelativeTime(new Date(productsData.lastScrapedAt))
                : 'Henüz güncellenmedi'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : productsData?.products && productsData.products.length > 0 ? (
        <ProductGrid products={productsData.products} />
      ) : (
        <Card className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Henüz ürün yok</h2>
          <p className="mb-6 text-muted-foreground text-center">
            &quot;Ürünleri Listele&quot; butonuna tıklayarak <br />
            seçili markalardan ürünleri çekin
          </p>
          <Button
            onClick={() => triggerScrapeMutation.mutate({ searchId: id })}
            disabled={isScrapingActive}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isScrapingActive ? 'animate-spin' : ''}`} />
            Ürünleri Listele
          </Button>
        </Card>
      )}
    </div>
  );
}
