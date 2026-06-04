import React, { useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import TextInput from "../components/TextInput";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";
import ErrorMsg from "../components/Error";
import { useTranslation } from "../hooks/useTranslation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      if (useAuthStore.getState().isAuthenticated) {
        setError("");
        navigate("/dashboard");
      } else {
        setError(t("login_error"));
      }
    } catch {
      setError(useAuthStore.getState().error || "Login failed");
    }
  };
  const handleFillAdmin = () => {
    setEmail("admin@onsite360.com");
    setPassword("Admin@123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-stretch">
      {/* Left panel — visible from md breakpoint */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative flex-col justify-end items-center overflow-hidden bg-[#1c1c1c] rounded-r-3xl">
        <div className="absolute inset-0 z-10 flex flex-col justify-start p-8 lg:p-14">
          <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-3">
            {t("home_title")}
          </h1>
          <p className="text-neutral-300 text-sm lg:text-base mb-4">
            {t("home_subtitle")}
          </p>
          <p className="text-neutral-400 text-sm lg:text-base leading-relaxed">
            {t("login_desc")}
          </p>
        </div>
        <img
          src="/construction.jpg"
          className="w-full h-full object-cover opacity-40"
          alt="construction"
        />
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-col flex-1 min-h-screen bg-base-200 px-4 sm:px-8 md:px-10 lg:px-16 py-6">
        {/* Back button + logo */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <Button variant="back" />
          <span className="text-2xl font-extrabold tracking-tight select-none">
            <span className="text-[#1c1c1c]">ONE</span>
            <span className="text-[#fdc700]">-365</span>
          </span>
        </div>

        {/* Form card */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm sm:max-w-md">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1c1c1c] mb-1">
              {t("welcome_back") ?? "Welcome back"}
            </h2>
            <p className="text-neutral-500 text-sm mb-6">
              {t("signin_btn")} {t("home_title")}
            </p>

            {error && <ErrorMsg>{error}</ErrorMsg>}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <TextInput
                id="email"
                label={t("email_label")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <PasswordInput
                id="password"
                label={t("password_label")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2"
              >
                {loading ? (
                  <span className="loading loading-spinner text-primary"></span>
                ) : (
                  t("signin_btn")
                )}
              </Button>
            </form>

            {/* Dev quick-fill */}
            <div className="mt-6 pt-5 border-t border-base-300">
              <p className="text-xs text-neutral-400 mb-2 text-center">Demo / Dev access</p>
              <button
                type="button"
                onClick={handleFillAdmin}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#fdc700]/60 bg-[#fdc700]/5 hover:bg-[#fdc700]/15 text-[#a45505] text-sm font-medium transition-colors cursor-pointer"
              >
                <span className="text-base">🔑</span>
                Usar cuenta Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
