import { ThemeProvider } from "next-themes";
import type React from "react";
import { ServiceWorkerCleanup } from "@/components/ServiceWorkerCleanup";

export const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <ThemeProvider attribute="class">
      <ServiceWorkerCleanup />
      {children}
    </ThemeProvider>
  );
};
