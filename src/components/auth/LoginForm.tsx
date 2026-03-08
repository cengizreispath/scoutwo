'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc/client';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast({ title: 'Giriş başarılı!' });
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

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate({ ...data, rememberMe });
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
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
        />
        <Label htmlFor="rememberMe" className="text-sm font-normal">
          Beni hatırla (7 gün)
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Giriş Yap
      </Button>
    </form>
  );
}
