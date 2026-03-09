'use client';

import { useRouter, useParams } from 'next/navigation';
import { ListForm } from '@/components/search/SearchForm';
import { trpc } from '@/lib/trpc/client';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { CreateListInput } from '@/lib/validations';

export default function EditListPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: list, isLoading } = trpc.searches.getById.useQuery({ id });

  const updateMutation = trpc.searches.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Liste güncellendi!' });
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

  const handleSubmit = (data: CreateListInput) => {
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

  if (!list) {
    return <div>Liste bulunamadı</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Listeyi Düzenle</h1>
      <ListForm
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        defaultValues={{
          name: list.name,
          description: '',
        }}
      />
    </div>
  );
}
