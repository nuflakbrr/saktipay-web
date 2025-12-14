export interface Product {
  id: string;
  category_id: string;
  supplier_id: string;
  name: string;
  cost: string;
  price: string;
  stock: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Cart extends Product {
  quantity: number;
}
