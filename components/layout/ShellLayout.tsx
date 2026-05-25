"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import { AvatarProvider } from "@/contexts/AvatarContext";

interface ShellLayoutProps {
  children: React.ReactNode;
  user: { email?: string; full_name?: string } | null;
  avatarUrl?: string | null;
}

export default function ShellLayout({ children, user, avatarUrl }: ShellLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1024);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWindowWidth(w);
      // Tablet: collapse by default
      if (w >= 768 && w < 1024) {
        setSidebarCollapsed(true);
      } else if (w >= 1024) {
        setSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  function toggleSidebar() {
    if (isMobile) {
      setMobileSidebarOpen((v) => !v);
    } else {
      setSidebarCollapsed((v) => !v);
    }
  }

  return (
    <AvatarProvider initialUrl={avatarUrl}>
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface-1)" }}>
      {/* Desktop/Tablet Sidebar */}
      {!isMobile && (
        <Sidebar
          collapsed={sidebarCollapsed || isTablet}
          user={user}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 z-50">
            <Sidebar collapsed={false} user={user} />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuToggle={toggleSidebar} user={user} />

        <main
          className="flex-1 overflow-hidden"
          style={{ paddingBottom: isMobile ? "60px" : "0" }}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
        <BottomNav onMenuToggle={() => setMobileSidebarOpen((v) => !v)} />
      )}
    </div>
    </AvatarProvider>
  );
}
