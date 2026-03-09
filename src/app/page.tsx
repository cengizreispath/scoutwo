import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Heart, Sparkles, ShoppingBag } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">ScoutWo</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Giriş Yap</Button>
            </Link>
            <Link href="/register">
              <Button>Kayıt Ol</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900">
            Ürünleri{' '}
            <span className="text-primary">Karşılaştır</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Farklı sitelerden beğendiğiniz ürünleri tek listede toplayın.
            Fiyatları karşılaştırın, en iyisini seçin.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-6">
              Hemen Başla
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="mb-4 inline-flex rounded-full bg-pink-100 p-3">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Çoklu Site Karşılaştırma</h3>
            <p className="text-gray-600">
              Herhangi bir e-ticaret sitesinden ürün ekleyin. Tek listede karşılaştırın.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="mb-4 inline-flex rounded-full bg-pink-100 p-3">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Favoriler</h3>
            <p className="text-gray-600">
              Beğendiğiniz ürünleri favorilere ekleyin, istediğiniz zaman inceleyin.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="mb-4 inline-flex rounded-full bg-pink-100 p-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Akıllı Listeler</h3>
            <p className="text-gray-600">
              İstediğiniz kadar liste oluşturun. Ürünleri organize edin.
            </p>
          </div>
        </div>

        {/* Brands */}
        <div className="mt-24 text-center">
          <p className="mb-8 text-sm font-medium uppercase tracking-wider text-gray-500">
            Tüm E-Ticaret Siteleri Desteklenir
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {['Trendyol', 'Hepsiburada', 'N11', 'ZARA', 'H&M', 'MANGO', 'LC Waikiki', 've daha fazlası...'].map((brand) => (
              <span key={brand} className="text-xl font-semibold text-gray-400">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p>© 2024 ScoutWo. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
