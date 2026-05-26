"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartLine = {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  category?: string;
};

type CartState = {
  branchId: number | null;
  branchName: string | null;
  branchCity: string | null;
  items: CartLine[];
};

const STORAGE_KEY = "restaurant_cart";

const empty: CartState = {
  branchId: null,
  branchName: null,
  branchCity: null,
  items: [],
};

type CartContextValue = {
  branchId: number | null;
  branchName: string | null;
  branchCity: string | null;
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (
    branch: { id: number; name: string; city?: string | null },
    item: Omit<CartLine, "quantity">,
    qty?: number
  ) => void;
  updateQty: (menuItemId: number, quantity: number) => void;
  removeItem: (menuItemId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>(empty);

  useEffect(() => {
    setCart(loadCart());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback(
    (
      branch: { id: number; name: string; city?: string | null },
      item: Omit<CartLine, "quantity">,
      qty = 1
    ) => {
      setCart((prev) => {
        if (prev.branchId != null && prev.branchId !== branch.id) {
          const confirmed = window.confirm(
            "Your cart has items from another branch. Clear cart and add this item?"
          );
          if (!confirmed) return prev;
          prev = empty;
        }

        const existing = prev.items.find((i) => i.menuItemId === item.menuItemId);
        const items = existing
          ? prev.items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + qty }
                : i
            )
          : [...prev.items, { ...item, quantity: qty }];

        return {
          branchId: branch.id,
          branchName: branch.name,
          branchCity: branch.city ?? null,
          items,
        };
      });
    },
    []
  );

  const updateQty = useCallback((menuItemId: number, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        const items = prev.items.filter((i) => i.menuItemId !== menuItemId);
        if (items.length === 0) return empty;
        return { ...prev, items };
      }
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity } : i
        ),
      };
    });
  }, []);

  const removeItem = useCallback((menuItemId: number) => {
    setCart((prev) => {
      const items = prev.items.filter((i) => i.menuItemId !== menuItemId);
      if (items.length === 0) return empty;
      return { ...prev, items };
    });
  }, []);

  const clearCart = useCallback(() => setCart(empty), []);

  const itemCount = useMemo(
    () => cart.items.reduce((s, i) => s + i.quantity, 0),
    [cart.items]
  );

  const subtotal = useMemo(
    () => cart.items.reduce((s, i) => s + i.price * i.quantity, 0),
    [cart.items]
  );

  const value = useMemo(
    () => ({
      branchId: cart.branchId,
      branchName: cart.branchName,
      branchCity: cart.branchCity,
      items: cart.items,
      itemCount,
      subtotal,
      addItem,
      updateQty,
      removeItem,
      clearCart,
    }),
    [cart, itemCount, subtotal, addItem, updateQty, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
