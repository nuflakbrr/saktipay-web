export interface Promotion {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: string;
  status: 'active' | 'inactive';
  description: string;
  created_at: string | null;
  updated_at: string | null;
}
