import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      
      addItem: (product, size = null) => set((s) => {
        // Unique ID: product.id + size (taaki size 7 aur 8 alag count ho)
        const cartItemId = size ? `${product.id}-${size}` : product.id;
        const existing = s.items.find((i) => i.cartItemId === cartItemId);
        
        if (existing) {
          return {
            items: s.items.map((i) =>
              i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { items: [...s.items, { ...product, size, cartItemId, quantity: 1 }] };
      }),

      removeItem: (cartItemId) =>
        set((s) => ({ items: s.items.filter((i) => i.cartItemId !== cartItemId) })),
      
      updateQty: (cartItemId, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity: Math.max(1, qty) } : i
          ),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'ss-traders-cart' }
  )
);
