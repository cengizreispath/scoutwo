import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">ScoutWo</span>
        </Link>
        <CardTitle className="text-2xl">Giriş Yap</CardTitle>
        <CardDescription>
          Hesabınıza giriş yapın
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Kayıt olun
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
