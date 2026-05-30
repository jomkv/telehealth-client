"use client";

import { usePathname } from "next/navigation";
import { AppNav } from "../nav/app-nav";
import { Footer } from "../nav/footer";
import SocketContextProvider from "../providers/socket-provider";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const hideNavbar =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/onboarding";

  // No wrapper
  if (hideNavbar) {
    return children;
  }

  return (
    <SocketContextProvider>
      <AppNav />
      <main className="flex-1 px-6 pb-16 pt-10 sm:px-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <Footer />
    </SocketContextProvider>
  );
}
