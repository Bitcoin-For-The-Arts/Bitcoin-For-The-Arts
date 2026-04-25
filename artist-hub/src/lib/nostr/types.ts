export type Nip15StallContent = {
  id: string;
  name: string;
  description?: string;
  currency?: string; // "sat" recommended
  shipping?: Array<{
    id: string;
    name: string;
    cost: number;
    regions?: string[];
  }>;
};

export type Nip15ProductContent = {
  id: string;
  stall_id: string;
  name: string;
  description?: string;
  images?: string[];
  price: number;
  currency?: string; // "sat" recommended
  quantity?: number;
  tags?: string[];
  category?: string;
  availability?: 'in_stock' | 'made_to_order' | 'limited' | 'unavailable';
  auction?: {
    enabled: boolean;
    start_at?: number; // unix seconds
    end_at?: number; // unix seconds
    reserve_price?: number; // sats
  };
};

export type Nip99Classified = {
  title: string;
  summary?: string;
  markdown: string;
  images?: string[];
  tags?: string[];
  price?: {
    amount: string; // sats as string
    currency?: string; // "sat"
    period?: string;
  };
  status?: 'active' | 'sold';
  geohash?: string;
  category?: string;
};

export type Listing = {
  kind: 'nip15_product' | 'nip99_classified';
  eventId: string;
  address?: string; // for parameterized replaceable events (NIP-15)
  pubkey: string;
  createdAt: number;
  title: string;
  summary?: string;
  description?: string;
  images: string[];
  tags: string[];
  category?: string;
  priceSats?: number;
  currency?: string;
  status?: 'active' | 'sold';
};

