'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, Settings, ShoppingBag, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';

const navigation = [
  { name: 'Aramalarım', href: '/searches', icon: Search },
  { name: 'Favoriler', href: '/favorites', icon: Heart },
  { name: 'Ayarlar', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: searches } = trpc.searches.list.useQuery();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-white lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">ScoutWo</span>
        </div>

        {/* New Search Button */}
        <div className="p-4">
          <Link href="/searches/new">
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Arama
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Saved Searches */}
        {searches && searches.length > 0 && (
          <div className="border-t p-4">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Kayıtlı Aramalar
            </h3>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {searches.slice(0, 5).map((search) => (
                <Link
                  key={search.id}
                  href={`/searches/${search.id}`}
                  className={cn(
                    'block truncate rounded-md px-3 py-2 text-sm transition-colors',
                    pathname === `/searches/${search.id}`
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {search.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
