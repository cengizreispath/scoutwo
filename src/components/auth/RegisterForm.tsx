'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc/client';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast({ title: 'Kayıt başarılı!' });
      router.push('/searches');
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          type="email"
          placeholder="ornek@email.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Şifre</Label>
        <Input
          id="password"
          type="password"
          placeholder="En az 8 karakter"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Kayıt Ol
      </Button>
    </form>
  );
}
