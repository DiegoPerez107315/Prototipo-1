"use client";

import { LogIn } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    const supabase = createClient();

    // 1. Intentamos iniciar sesión
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // 2. Si es contraseña incorrecta
      if (signInError.message === "Invalid login credentials") {
        // Intentamos crear la cuenta. Si ya existe, es que la contraseña está mal.
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          if (signUpError.message.includes("User already registered")) {
            setErrorMsg("La contraseña es incorrecta.");
          } else {
            setErrorMsg("Error: " + signUpError.message);
          }
          setLoading(false);
          return;
        }
      } else {
        setErrorMsg("Error: " + signInError.message);
        setLoading(false);
        return;
      }
    }

    // 3. Si todo salió bien, vamos al Dashboard
    router.push("/");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <LogIn className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido</h1>
          <p className="text-sm text-gray-500 text-center mt-2">
            Inicia sesión para empezar a enseñar y aprender de otros.
          </p>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              required
            />
          </div>

          {errorMsg && (
            <p className="text-red-500 text-xs text-center font-medium mt-1">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors mt-2 disabled:bg-blue-400"
          >
            {loading ? "Cargando..." : "Entrar / Registrarse"}
          </button>
        </form>
      </div>
    </main>
  );
}
