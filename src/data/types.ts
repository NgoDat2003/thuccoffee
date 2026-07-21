export interface Product {
  name: string;
  slug: string;
  price: number;
  priceEstimated?: boolean;
  categories: string[];
  thumb: string;
  /** Full-resolution source asset used by product detail views. */
  image?: string;
  description?: string;
}

export interface BlogPost {
  title: string;
  slug: string;
  cover: string;
  date: string;
  summary: string;
}

export interface Store {
  name: string;
  slug: string;
  address: string;
  phone: string;
  gallery: string[];
  image: string;
  hours: string;
}

export interface Category {
  key: string;
  label: string;
}
