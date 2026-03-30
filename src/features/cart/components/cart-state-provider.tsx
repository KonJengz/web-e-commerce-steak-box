"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import type { Cart } from "@/features/cart/types/cart.type";

interface CartStateContextValue {
  cart: Cart | null;
  isLoggedIn: boolean;
  setCart: Dispatch<SetStateAction<Cart | null>>;
}

const CartStateContext = createContext<CartStateContextValue | null>(null);

interface CartStateProviderProps {
  children: ReactNode;
  initialCart: Cart | null;
  isLoggedIn: boolean;
}

export function CartStateProvider({
  children,
  initialCart,
  isLoggedIn,
}: CartStateProviderProps) {
  const [cart, setCart] = useState<Cart | null>(initialCart);
  const [loggedInState, setLoggedInState] = useState<boolean>(isLoggedIn);

  useEffect(() => {
    setCart(initialCart);
  }, [initialCart]);

  useEffect(() => {
    setLoggedInState(isLoggedIn);
  }, [isLoggedIn]);

  const value = useMemo<CartStateContextValue>(() => {
    return {
      cart,
      isLoggedIn: loggedInState,
      setCart,
    };
  }, [cart, loggedInState]);

  return (
    <CartStateContext.Provider value={value}>
      {children}
    </CartStateContext.Provider>
  );
}

export const useCartState = (): CartStateContextValue => {
  const context = useContext(CartStateContext);

  if (!context) {
    throw new Error("useCartState must be used within CartStateProvider.");
  }

  return context;
};
