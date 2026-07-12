"use client";

import { createContext, useContext } from "react";

type NotificationCountState = {
  count: number;
  enabled: boolean;
};

const NotificationCountContext = createContext<NotificationCountState>({
  count: 0,
  enabled: false,
});

export function NotificationCountProvider({
  count,
  enabled = true,
  children,
}: {
  count: number;
  enabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <NotificationCountContext.Provider value={{ count, enabled }}>
      {children}
    </NotificationCountContext.Provider>
  );
}

export function useNotificationCount() {
  return useContext(NotificationCountContext);
}
