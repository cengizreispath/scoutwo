import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">ScoutWo</span>
        </Link>
        <CardTitle className="text-2xl">Hesap Oluştur</CardTitle>
        <CardDescription>
          Hemen ücretsiz kayıt olun
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Giriş yapın
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
