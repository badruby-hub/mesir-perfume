'use client';

// Shop state shared by every page: cart and favorites (persisted in
// localStorage so they survive navigation and reloads), the header
// search query, which side panel is open, and the toast message.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useI18n } from './I18nProvider';
import type { CartItem } from '@/lib/types';

type Panel = 'cart' | 'favorites' | 'order' | null;
type Id = number | string;

interface ShopValue {
  cart: CartItem[];
  favorites: Id[];
  cartTotal: number;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  toggleFavorite: (id: Id) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  openPanel: Panel;
  setOpenPanel: (panel: Panel) => void;

  toast: { message: string; visible: boolean };
  showToast: (message: string) => void;
}

const ShopContext = createContext<ShopValue | null>(null);

const CART_KEY = 'mesir_cart';
const FAVORITES_KEY = 'mesir_favorites';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Id[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const [toast, setToast] = useState({ message: '', visible: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // localStorage only exists in the browser, so the saved cart is read
  // after mount (the server render always starts empty).
  useEffect(() => {
    setCart(loadStorage<CartItem[]>(CART_KEY, []));
    setFavorites(loadStorage<Id[]>(FAVORITES_KEY, []));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveStorage(CART_KEY, cart);
  }, [cart, loaded]);

  useEffect(() => {
    if (loaded) saveStorage(FAVORITES_KEY, favorites);
  }, [favorites, loaded]);

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2200);
  }, []);

  const addToCart = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      setCart((prev) => {
        const existing = prev.find((c) => c.id === item.id);
        if (existing) {
          return prev.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + quantity } : c));
        }
        return [...prev, { ...item, quantity }];
      });
      showToast(t('toast_added_to_cart', 'Added to cart'));
    },
    [showToast, t]
  );

  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateCartQuantity = useCallback((index: number, quantity: number) => {
    setCart((prev) =>
      quantity < 1 ? prev.filter((_, i) => i !== index) : prev.map((c, i) => (i === index ? { ...c, quantity } : c))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback(
    (id: Id) => {
      const isAdding = !favorites.includes(id);
      setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
      if (isAdding) showToast(t('toast_added_to_favorites', 'Added to favorites'));
    },
    [favorites, showToast, t]
  );

  const value = useMemo<ShopValue>(
    () => ({
      cart,
      favorites,
      cartTotal: cart.reduce((s, p) => s + p.price * p.quantity, 0),
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      toggleFavorite,
      searchQuery,
      setSearchQuery,
      openPanel,
      setOpenPanel,
      toast,
      showToast,
    }),
    [cart, favorites, addToCart, updateCartQuantity, removeFromCart, clearCart, toggleFavorite, searchQuery, openPanel, toast, showToast]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>');
  return ctx;
}
