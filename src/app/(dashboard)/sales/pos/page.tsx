'use client'
import { FC, useEffect, useState } from 'react'
import { CreditCard, Minus, Plus, Search, ShoppingCart, Ticket, X } from 'lucide-react';
import { collection, doc, setDoc, Timestamp, writeBatch } from 'firebase/firestore'
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { Category } from '@/interfaces/categories';
import { Cart, Product } from '@/interfaces/products';
import { Promotion } from '@/interfaces/promotions';
import { Transaction } from '@/interfaces/transactions';
import { fetchCategories } from '@/services/categories';
import { fetchProducts } from '@/services/products';
import { fetchPromotions } from '@/services/promotions';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import VoucherModal from './_components/voucher';
import PaymentModal from './_components/payment';

const PointOfSalesPage: FC = () => {
  const { user } = useAuth()

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])

  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState<boolean>(false)
  const [selectedVoucher, setSelectedVoucher] = useState<Promotion | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [search, setSearchTerm] = useState<string>('')
  const [cart, setCart] = useState<Cart[]>([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false)

  const handleVoucherModal = () => {
    setIsVoucherModalOpen(!isVoucherModalOpen)
  }

  const handlePaymentModal = () => {
    setIsPaymentModalOpen(!isPaymentModalOpen)
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (product: Product) => {
    if (Number(product.stock) <= 0) return;
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        if (exists.quantity >= Number(product.stock)) return prev; // check stock limit
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        const product = products.find(p => p.id === id);
        if (newQty < 1) return item;
        if (product && newQty > Number(product.stock)) return item; // limit to max stock
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)

  const discountAmount = selectedVoucher
    ? selectedVoucher.type === 'percent'
      ? Math.round(subtotal * (Number(selectedVoucher.value) / 100))
      : Number(selectedVoucher.value)
    : 0

  const total = Math.max(0, subtotal - discountAmount)

  const initiateCheckout = () => {
    if (cart.length === 0) return;
    handlePaymentModal();
  }

  const saveTransaction = async (transaction: Transaction) => {
    const ref = doc(collection(db, 'transactions'), transaction.id)

    await setDoc(ref, {
      ...transaction,
      created_at: Timestamp.fromDate(new Date()),
      updated_at: Timestamp.fromDate(new Date()),
    })
  }

  const updateProductStock = async (cart: Cart[]) => {
    const batch = writeBatch(db)

    cart.forEach(item => {
      const productRef = doc(db, 'products', item.id)
      batch.update(productRef, {
        stock: Number(item.stock) - item.quantity
      })
    })

    await batch.commit()
  }

  const handleFinalPayment = async (method: 'cash' | 'gopay' | 'ovo' | 'dana' | 'transfer') => {
    try {
      const totalCost = cart.reduce((sum, item) => sum + (Number(item.cost) * item.quantity), 0)

      const transaction: Transaction = {
        id: 'txn_' + Date.now(),
        items: cart,
        profit: total - totalCost,
        cashier_name: user?.name ?? 'Cashier',
        payment_method: method,
        voucher_code: selectedVoucher?.code || null,
        subtotal,
        total,
        discount: discountAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // 🔥 SAVE TRANSACTION
      await saveTransaction(transaction)

      // 🔥 UPDATE STOCK
      await updateProductStock(cart)

      await fetchProducts().then(products => {
        if (products) {
          setProducts(products)
        }
      });

      console.log('TRANSACTION SAVED', transaction)

      // RESET STATE
      setCart([])
      setSelectedVoucher(null)
      setIsPaymentModalOpen(false)

      toast.success('Transaksi berhasil dibuat')
    } catch (error) {
      console.error('PAYMENT FAILED', error)
      toast.error('Gagal membuat transaksi')
    }
  }


  useEffect(() => {
    fetchCategories().then(categories => {
      if (categories) {
        setCategories(categories)
      }
    });

    fetchProducts().then(products => {
      if (products) {
        setProducts(products)
      }
    });

    fetchPromotions().then(promotions => {
      if (promotions) {
        setPromotions(promotions)
      }
    });
  }, []);

  return (
    <>
      <div className="flex flex-col xl:flex-row h-full gap-6">
        {/* Product Grid (Left) */}
        <div className="flex flex-col w-full h-full overflow-hidden">
          {/* Header/Filter */}
          <div className="mb-4 space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button variant={selectedCategory === 'all' ? 'default' : 'secondary'} onClick={() => setSelectedCategory('all')}>All Items</Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'secondary'}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-10"
                value={search}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4 items-start">
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center text-gray-400 dark:text-gray-500 py-10">Oops! Tidak ada produk</div>
            )}

            {filteredProducts.map(product => (
              <Card key={product.id} className='h-auto' onClick={() => addToCart(product)}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>Stock: {product.stock}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <p className="font-bold text-gray-900 dark:text-white">Rp {product.price.toLocaleString()}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Sidebar (Right) */}
        <div className="w-full xl:w-150 rounded-xl shadow-lg flex flex-col h-full border transition-colors">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <ShoppingCart className="w-5 h-5 text-gray-400" />
              Keranjang
            </h2>
            <Badge className="text-xs px-2 py-1 rounded">{totalItems} item</Badge>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-2">
                  <Search className="w-8 h-8 opacity-50" />
                </div>
                <p>Keranjang Kosong:(</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-center group text-neutral-900 dark:text-white">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Rp {item.price.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 rounded bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-6 text-center text-sm font-bold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 rounded bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-1 text-red-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary & Checkout */}
          <div className="p-4 border-t space-y-3">
            <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                <span>Kupon Voucher</span>
              </div>
              <button
                onClick={handleVoucherModal}
                className={`text-xs px-2 py-1 rounded border ${selectedVoucher ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-white dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600 border-neutral-200 dark:border-neutral-600 cursor-pointer'}`}
              >
                {selectedVoucher ? selectedVoucher.code : 'Pilih Kupon...'}
              </button>
            </div>

            {Number(discountAmount) > 0 && (
              <div className="flex justify-between text-sm text-red-500 font-medium">
                <span>Diskon</span>
                <span>-Rp {Number(discountAmount).toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-3">
              <span>Total</span>
              <span>Rp {total.toLocaleString()}</span>
            </div>

            <button
              onClick={initiateCheckout}
              disabled={cart.length === 0}
              className={cn(cart.length === 0 && "cursor-not-allowed", "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors")}
            >
              <CreditCard className="w-5 h-5" />
              Bayar
            </button>
          </div>
        </div>

        {/* Receipt Modal */}
        {/* {lastSale && (
        <Receipt 
          sale={lastSale} 
          store={storeProfile} 
          onClose={() => setLastSale(null)} 
        />
      )} */}
      </div>

      <VoucherModal
        open={isVoucherModalOpen}
        handleOpenModal={handleVoucherModal}
        voucherList={promotions}
        setSelectedVoucher={setSelectedVoucher}
      />

      <PaymentModal
        open={isPaymentModalOpen}
        onClose={handlePaymentModal}
        total={total}
        discount={discountAmount}
        onPay={handleFinalPayment}
      />
    </>
  )
}

export default PointOfSalesPage