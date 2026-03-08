export const BRANDS = [
  { id: 'zara', name: 'Zara', slug: 'zara', websiteUrl: 'https://www.zara.com/tr' },
  { id: 'hm', name: 'H&M', slug: 'hm', websiteUrl: 'https://www2.hm.com/tr_tr' },
  { id: 'mango', name: 'Mango', slug: 'mango', websiteUrl: 'https://shop.mango.com/tr' },
  { id: 'massimo-dutti', name: 'Massimo Dutti', slug: 'massimo-dutti', websiteUrl: 'https://www.massimodutti.com/tr' },
  { id: 'koton', name: 'Koton', slug: 'koton', websiteUrl: 'https://www.koton.com' },
  { id: 'lc-waikiki', name: 'LC Waikiki', slug: 'lc-waikiki', websiteUrl: 'https://www.lcwaikiki.com' },
  { id: 'beymen', name: 'Beymen', slug: 'beymen', websiteUrl: 'https://www.beymen.com' },
  { id: 'network', name: 'Network', slug: 'network', websiteUrl: 'https://www.network.com.tr' },
] as const;

export const BRAND_MAP = Object.fromEntries(BRANDS.map(b => [b.id, b]));
