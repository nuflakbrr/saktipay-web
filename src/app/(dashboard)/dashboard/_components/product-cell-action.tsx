'use client';

import { FC } from 'react';
import { Copy, ExternalLink, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/interfaces/products';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

type Props = {
  data: Product;
};

const ProductCellAction: FC<Props> = ({ data }) => {
  const { user } = useAuth();

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Category ID berhasil disalin");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => handleCopy(data.id)}>
            <Copy className="mr-2 h-4 w-4" />
            Salin ID
          </DropdownMenuItem>

          {user?.role === 'admin' && (
            <DropdownMenuItem>
              <Link href="/master/products" className='flex items-center'>
                <ExternalLink className="mr-2 h-4 w-4" />
                Lihat Produk
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ProductCellAction;
