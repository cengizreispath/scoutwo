'use client';

import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  name: string;
  price: string | number;
  imageUrl: string | null;
  brandId?: string;
  brandName?: string;
  productUrl: string;
  isFavorite?: boolean;
}

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onFavoriteToggle?: (productId: string) => void;
}

export function ProductGrid({ products, isLoading, onFavoriteToggle }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="aspect-square w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Henüz ürün bulunamadı. Arama yaparak ürünleri listeleyin.
      </div>
    );
  }

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('tr-TR');
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="group overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-square bg-muted">
              {product.imageUrl && (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => onFavoriteToggle?.(product.id)}
              >
                <Heart
                  className={`h-5 w-5 ${product.isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                />
              </Button>
            </div>
            <div className="p-4">
              {product.brandName && (
                <p className="text-xs text-muted-foreground mb-1">{product.brandName}</p>
              )}
              <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>
              <p className="font-bold">{formatPrice(product.price)} TL</p>
              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                Mağazaya Git →
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
