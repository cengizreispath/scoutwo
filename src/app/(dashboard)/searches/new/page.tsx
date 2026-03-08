'use client';

import { useRouter } from 'next/navigation';
import { SearchForm } from '@/components/search/SearchForm';
import { trpc } from '@/lib/trpc/client';
import { toast } from '@/hooks/use-toast';
import type { CreateSearchInput } from '@/lib/validations';

export default function NewSearchPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const createMutation = trpc.searches.create.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Arama oluşturuldu!' });
      utils.searches.list.invalidate();
      router.push(`/searches/${data.id}`);
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
    createMutation.mutate(data);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Yeni Arama Oluştur</h1>
      <SearchForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </div>
  );
}
