'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const router = useRouter();
  const { data: user } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      router.push('/login');
      router.refresh();
    },
  });

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-6">
      <Button variant="ghost" size="icon" className="lg:hidden">
        <Menu className="h-6 w-6" />
      </Button>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">{user?.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => logoutMutation.mutate()}
            className="text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış Yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
