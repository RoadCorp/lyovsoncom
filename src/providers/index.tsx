import { ThemeProvider } from "next-themes";
import type React from "react";

export const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Switch themes instantly: animating colours left text unreadable for a
  // few frames while backgrounds had already changed.
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange={true}>
      {children}
    </ThemeProvider>
  );
};
