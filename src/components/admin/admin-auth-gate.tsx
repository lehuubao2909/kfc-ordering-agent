"use client";

/**
 * Gate Basic-auth cho /admin & /staff — ĐƠN GIẢN HOÁ (12/7): form đăng nhập với credentials demo
 * ĐIỀN SẴN (kfc/demo2026) — giám khảo chỉ bấm 1 nút. Không auto-login (bản cũ gây lỗi khó đoán
 * khi env lệch). API server-side vẫn giữ Basic auth như cũ.
 */
import { createContext, FormEvent, ReactNode, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "kfc_admin_basic_auth";
const DEMO_AUTH = process.env.NEXT_PUBLIC_DEMO_ADMIN_AUTH ?? "kfc:demo2026"; // "user:pass"

type AdminFetch = (path: string, init?: RequestInit) => Promise<Response>;
const AdminAuthContext = createContext<AdminFetch | null>(null);

export function useAdminFetch(): AdminFetch {
  const fetcher = useContext(AdminAuthContext);
  if (!fetcher) throw new Error("useAdminFetch phải nằm trong <AdminAuthGate>");
  return fetcher;
}

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Chỉ khôi phục phiên đã đăng nhập trong session này — còn lại hiện form (đã điền sẵn)
    setToken(sessionStorage.getItem(STORAGE_KEY));
    setReady(true);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecking(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const candidate = btoa(`${data.get("username")}:${data.get("password")}`);
    // Verify ngay bằng 1 call thật — sai thì báo, không lưu mù
    const res = await fetch("/api/admin/orders", { headers: { Authorization: `Basic ${candidate}` } });
    setChecking(false);
    if (res.status === 401) {
      setError("Sai tài khoản hoặc mật khẩu.");
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, candidate);
    setToken(candidate);
  }

  if (!ready) return null;

  if (!token) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <form onSubmit={handleSubmit} className="premium-card w-full max-w-sm rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Khu vực vận hành</p>
          <h1 className="mt-2 text-xl font-black">Đăng nhập quản trị</h1>
          <p className="mt-2 text-sm text-zinc-500">Tài khoản demo đã điền sẵn — bấm nút bên dưới để vào.</p>
          <label className="mt-5 block text-sm font-bold" htmlFor="username">Tài khoản
            <input id="username" name="username" required autoComplete="username" defaultValue={DEMO_AUTH.split(":")[0]} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus-visible:border-red-600 focus-visible:ring-2 focus-visible:ring-red-200" />
          </label>
          <label className="mt-4 block text-sm font-bold" htmlFor="password">Mật khẩu
            <input id="password" name="password" type="password" required autoComplete="current-password" defaultValue={DEMO_AUTH.split(":")[1] ?? ""} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus-visible:border-red-600 focus-visible:ring-2 focus-visible:ring-red-200" />
          </label>
          {error ? <p className="mt-3 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
          <button disabled={checking} className="mt-5 w-full rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white hover:bg-red-600 disabled:opacity-60">{checking ? "Đang kiểm tra…" : "Vào trang quản trị"}</button>
        </form>
      </div>
    );
  }

  const adminFetch: AdminFetch = (path, init = {}) => {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Basic ${token}`);
    return fetch(path, { ...init, headers }).then((res) => {
      if (res.status === 401) {
        sessionStorage.removeItem(STORAGE_KEY);
        setToken(null);
      }
      return res;
    });
  };

  return <AdminAuthContext.Provider value={adminFetch}>{children}</AdminAuthContext.Provider>;
}
