"use client";

import { User, Coins, Ear, Mic, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [credits, setCredits] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUserData() {
      // 1. Verificar si el usuario está logueado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }
      
      setUserEmail(user.email || "");

      // 2. Traer los créditos directamente de la tabla `profiles`
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .maybeSingle();
        
      if (error) {
        console.warn("Advertencia cargando perfil:", error.message);
      }
        
      if (profile) {
        setCredits(profile.credits);
      } else {
        // En caso de que el trigger falle o el usuario se haya registrado ANTES de crear el trigger
        setCredits(15);
      }
    }
    
    loadUserData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleTeach = async () => {
    if (credits === null || credits < 10) {
      alert("Necesitas al menos 10 créditos para enseñar y crear una sala.");
      return;
    }

    const topic = window.prompt("¿Qué tema quieres enseñar hoy?");
    if (!topic) return;

    // Obtener mis datos
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Crear la sala en Supabase
    const { data: room, error } = await supabase
      .from("rooms")
      .insert({ topic: topic, host_id: user.id, status: "waiting" })
      .select()
      .single();

    if (error) {
      alert("Error al crear la sala: " + error.message);
      return;
    }

    // Cobrar 10 créditos para enseñar
    const { error: updateError } = await supabase.from("profiles").update({ credits: credits - 10 }).eq("id", user.id);
    if (updateError) {
      console.error("Error cobrando créditos:", updateError);
      alert("Hubo un problema actualizando tus créditos. Revisa la consola.");
    }

    // Vamos directo a la sala
    router.push(`/room/${room.id}`);
  };

  const handleListen = async () => {
    // 1. Obtener mis datos
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 2. Buscar cualquier sala en estado "waiting" (La MÁS RECIENTE primero)
    const { data: roomList, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("status", "waiting")
      .neq("host_id", user.id) // ¡No queremos conectarnos con nosotros mismos!
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !roomList || roomList.length === 0) {
      alert("No hay salas disponibles para escuchar en este momento. Intenta en un rato.");
      return;
    }

    const availableRoom = roomList[0];

    // 3. Ocupar la sala
    const { error: updateError } = await supabase
      .from("rooms")
      .update({ listener_id: user.id, status: "active" })
      .eq("id", availableRoom.id);

    if (updateError) {
      alert("Error al intentar unirse a la sala: " + updateError.message);
      return;
    }

    // Dar 5 créditos de recompensa por escuchar validando desde el estado
    if (credits !== null) {
      await supabase.from("profiles").update({ credits: credits + 5 }).eq("id", user.id);
    }

    router.push(`/room/${availableRoom.id}`);
  };

  // Pantalla de carga mientras trae los datos de Supabase
  if (credits === null) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-medium animate-pulse">Cargando tu perfil...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6 pt-12">
      {/* Header con Perfil y Créditos */}
      <header className="w-full max-w-md flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-10 relative">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="text-blue-600" size={24} />
          </div>
          <div className="max-w-[150px] overflow-hidden">
            <h1 className="font-semibold text-gray-800 truncate" title={userEmail}>
              {userEmail.split("@")[0]}
            </h1>
            <p className="text-xs text-gray-500">Listo para aprender</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1.5 rounded-full border border-yellow-200">
            <Coins className="text-yellow-600" size={18} />
            <span className="font-bold text-yellow-700">{credits}</span>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Cerrar sesión">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Texto de introducción */}
      <div className="text-center mb-10 max-w-md px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">¿Qué quieres hacer hoy?</h2>
        <p className="text-gray-600 text-sm">
          Recuerda: Explicar es la mejor forma de aprender. Acumula créditos escuchando a otros para poder crear tus propias salas.
        </p>
      </div>

      {/* Opciones (Botones principales) */}
      <div className="w-full max-w-md flex flex-col gap-4">
        
        {/* Opción A: Enseñar */}
        <button 
          onClick={handleTeach}
          className="flex items-center p-5 bg-white border-2 border-blue-500 rounded-2xl shadow-sm hover:bg-blue-50 hover:scale-[1.02] transition-all text-left group"
        >
          <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition-colors">
            <Mic className="text-blue-600" size={28} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">Enseñar un tema</h3>
            <p className="text-sm text-gray-500">Afianza tu conocimiento. Crea una sala.</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md mt-1 border border-red-100">
              -10 Créditos
            </span>
          </div>
        </button>

        {/* Opción B: Escuchar */}
        <button 
          onClick={handleListen}
          className="flex items-center p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-green-500 hover:bg-green-50 hover:scale-[1.02] transition-all text-left group mt-2"
        >
          <div className="bg-green-100 p-3 rounded-full mr-4 group-hover:bg-green-200 transition-colors">
            <Ear className="text-green-600" size={28} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">Escuchar y evaluar</h3>
            <p className="text-sm text-gray-500">Ayuda a otra persona y gana créditos.</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-md mt-1 border border-green-100">
              +5 Créditos
            </span>
          </div>
        </button>
        
      </div>
    </main>
  );
}
