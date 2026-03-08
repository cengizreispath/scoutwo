'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const BRANDS = [
  { id: 'zara', name: 'Zara', logo: '👗' },
  { id: 'hm', name: 'H&M', logo: '👚' },
  { id: 'mango', name: 'Mango', logo: '👜' },
  { id: 'massimo-dutti', name: 'Massimo Dutti', logo: '🧥' },
  { id: 'koton', name: 'Koton', logo: '👕' },
  { id: 'lcw', name: 'LC Waikiki', logo: '👔' },
  { id: 'beymen', name: 'Beymen', logo: '💎' },
  { id: 'network', name: 'Network', logo: '✨' },
];

interface BrandSelectorProps {
  selectedBrands: string[];
  onBrandsChange?: (brands: string[]) => void;
  onSelectionChange?: (brands: string[]) => void;
}

export function BrandSelector({ selectedBrands, onBrandsChange, onSelectionChange }: BrandSelectorProps) {
  const handleChange = (brands: string[]) => {
    onBrandsChange?.(brands);
    onSelectionChange?.(brands);
  };

  const toggleBrand = (brandId: string) => {
    if (selectedBrands.includes(brandId)) {
      handleChange(selectedBrands.filter((id) => id !== brandId));
    } else {
      handleChange([...selectedBrands, brandId]);
    }
  };

  const selectAll = () => {
    handleChange(BRANDS.map((b) => b.id));
  };

  const clearAll = () => {
    handleChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Markalar</Label>
        <div className="space-x-2">
          <Button variant="ghost" size="sm" onClick={selectAll}>
            Tümünü Seç
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Temizle
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {BRANDS.map((brand) => (
          <div
            key={brand.id}
            onClick={() => toggleBrand(brand.id)}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedBrands.includes(brand.id)
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="text-2xl">{brand.logo}</span>
            <span className="font-medium text-sm">{brand.name}</span>
            {selectedBrands.includes(brand.id) && (
              <Check className="h-4 w-4 text-primary ml-auto" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
