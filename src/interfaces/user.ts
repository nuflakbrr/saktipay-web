export interface AppUser {
  uid: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: 'admin' | 'cashier';
}