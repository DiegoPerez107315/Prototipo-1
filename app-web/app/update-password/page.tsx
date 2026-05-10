"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Lock, Loader2, KeyRound, Eye, EyeOff } from "lucide-react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Actualiza la contraseña del usuario que acaba de iniciar sesión mediante el enlace del correo
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setErrorMsg("Error al actualizar: " + error.message);
    } else {
      setSuccessMsg("¡Contraseña actualizada con éxito!");
      // Lo llevamos al dashboard después de un momento
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-[10%] right-[10%] w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-blue-900/5 relative z-10 border border-gray-100">
        <div className="flex flex-col items-center mb-8 mt-2">
          <div className="bg-gradient-to-br from-green-500 to-green-700 p-4 rounded-2xl shadow-lg shadow-green-500/30 mb-5">
            <KeyRound className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight text-center">
            Restablecer Contraseña
          </h1>
          <p className="text-sm text-gray-500 text-center mt-2 leading-relaxed px-4">
            Ingresa tu nueva contraseña a continuación.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 text-gray-900 bg-gray-50/50 transition-all font-medium"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700 transition"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm font-medium border border-green-100">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || successMsg.length > 0}
            className="w-full relative flex justify-center items-center gap-2 bg-gray-900 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all mt-3 disabled:opacity-70"
          >
            {loading && <Loader2 className="animate-spin h-5 w-5 absolute left-4" />}
            Actualizar Contraseña
          </button>
        </form>
      </div>
    </main>
  );
}