'use client';

import { useRouter } from 'next/navigation';
import { ListForm } from '@/components/search/SearchForm';
import { trpc } from '@/lib/trpc/client';
import { toast } from '@/hooks/use-toast';
import type { CreateListInput } from '@/lib/validations';

export default function NewListPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const createMutation = trpc.searches.create.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Liste oluşturuldu!' });
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

  const handleSubmit = (data: CreateListInput) => {
    createMutation.mutate(data);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Yeni Liste Oluştur</h1>
      <ListForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </div>
  );
}
