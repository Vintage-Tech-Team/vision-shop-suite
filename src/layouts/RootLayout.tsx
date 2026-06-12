import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTheme } from "@/lib/store";
import { useAuth } from "@/lib/auth-store";

export function RootLayout() {
  const theme = useTheme((s) => s.theme);
  const fetchMe = useAuth((s) => s.fetchMe);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ToastContainer position="bottom-right" theme="colored" autoClose={3000} />
    </>
  );
}
