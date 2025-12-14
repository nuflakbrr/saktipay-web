import { Cart } from "./products";

// export interface TransactionItem {
//   product_id: string;
//   product_name: string;
//   cost_at_sale: number;
//   price_at_sale: number;
//   quantity: number;
// }

export interface Transaction {
  id: string;
  items: Cart[];
  profit: number;
  cashier_name: string | null;
  payment_method: 'cash' | 'gopay' | 'ovo' | 'dana' | 'transfer';
  voucher_code?: string | null;
  subtotal: number;
  total: number;
  discount: number;
  created_at: string | null;
  updated_at: string | null;
}