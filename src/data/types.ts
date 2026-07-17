export interface Product {
  name: string;
  slug: string;
  price: number | null;
  priceEstimated?: boolean;
  categories: string[];
  thumb: string;
  /** Full-res asset — only 1 of 42 products has one downloaded (see Phase 2). */
  image?: string;
  description?: string;
}

/** `body` is not in source; pages render `summary` in its place. */
export interface BlogPost {
  title: string;
  slug: string;
  cover: string;
  summary: string;
}

export interface Store {
  name: string;
  slug: string;
  address: string;
  phone: string;
  image: string;
  hours: string;
}

export interface Category {
  key: string;
  label: string;
}
