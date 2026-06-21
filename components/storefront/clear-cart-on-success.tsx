"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { clearCart } from "@/modules/cart/cartSlice";

export function ClearCartOnSuccess() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return null;
}
