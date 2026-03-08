'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { SearchForm } from '@/components/search/SearchForm';
import { trpc } from '@/lib/trpc/client';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { CreateSearchInput } from '@/lib/validations';

export default function EditSearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: search, isLoading } = trpc.searches.getById.useQuery({ id });

  const updateMutation = trpc.searches.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Arama güncellendi!' });
      utils.searches.list.invalidate();
      utils.searches.getById.invalidate({ id });
      router.push(`/searches/${id}`);
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: CreateSearchInput) => {
    updateMutation.mutate({ id, data });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!search) {
    return <div>Arama bulunamadı</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Aramayı Düzenle</h1>
      <SearchForm
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        defaultValues={{
          name: search.name,
          query: search.query,
          brandIds: search.searchBrands.map((sb) => sb.brand.id),
        }}
      />
    </div>
  );
}
