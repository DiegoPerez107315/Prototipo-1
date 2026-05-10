"use client";

import { LogIn, Mail, Lock, UserPlus, KeyRound, Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message === "Invalid login credentials" ? "Credenciales incorrectas." : error.message);
      } else {
        router.push("/");
      }
    } else if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrorMsg("Error: " + error.message);
      } else {
        setSuccessMsg("¡Cuenta creada exitosamente! Revisa tu correo o inicia sesión directamente.");
        setMode("signin");
        setPassword("");
      }
    } else if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) {
        setErrorMsg("Error enviando correo: " + error.message);
      } else {
        setSuccessMsg("Revisa tu bandeja de entrada. Te hemos enviado un enlace de recuperación.");
        setEmail("");
      }
    }
    
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Círculos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-blue-900/5 relative z-10 border border-gray-100">
        
        {/* Botón de retroceso para volver a Iniciar Sesión desde Olvidé contraseña */}
        {mode !== "signin" && (
          <button 
            onClick={() => { setMode("signin"); setErrorMsg(""); setSuccessMsg(""); }}
            className="absolute top-6 left-6 text-gray-400 hover:text-gray-700 transition"
            title="Volver"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="flex flex-col items-center mb-8 mt-2">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-2xl shadow-lg shadow-blue-500/30 mb-5">
            {mode === "signin" && <LogIn className="text-white" size={32} />}
            {mode === "signup" && <UserPlus className="text-white" size={32} />}
            {mode === "forgot" && <KeyRound className="text-white" size={32} />}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {mode === "signin" && "Hola de nuevo"}
            {mode === "signup" && "Crear cuenta"}
            {mode === "forgot" && "Recuperar acceso"}
          </h1>
          <p className="text-sm text-gray-500 text-center mt-2 leading-relaxed px-4">
            {mode === "signin" && "Inicia sesión y continúa aprendiendo mediante el Efecto Protégé."}
            {mode === "signup" && "Únete a nuestra comunidad y desbloquea el poder de enseñar."}
            {mode === "forgot" && "Ingresa tu correo y te enviaremos instrucciones para restaurar tu contraseña."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 bg-gray-50/50 transition-all font-medium"
                required
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1 pr-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Contraseña
                </label>
                {mode === "signin" && (
                  <button 
                    type="button" 
                    onClick={() => { setMode("forgot"); setErrorMsg(""); setSuccessMsg(""); }}
                    className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition"
                  >
                    ¿La olvidaste?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 bg-gray-50/50 transition-all font-medium"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 flex items-center">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm font-medium border border-green-100 flex items-center">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full relative flex justify-center items-center gap-2 bg-gray-900 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all mt-3 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading && <Loader2 className="animate-spin h-5 w-5 absolute left-4" />}
            {mode === "signin" && "Iniciar Sesión"}
            {mode === "signup" && "Crear Cuenta"}
            {mode === "forgot" && "Enviar Enlace"}
          </button>
        </form>

        {mode === "signin" && (
          <p className="text-center text-sm text-gray-500 mt-8 font-medium">
            ¿No tienes una cuenta aún?{" "}
            <button 
              onClick={() => { setMode("signup"); setErrorMsg(""); setSuccessMsg(""); }}
              className="text-blue-600 font-bold hover:underline"
            >
              Regístrate ahora
            </button>
          </p>
        )}
      </div>
    </main>
  );
}