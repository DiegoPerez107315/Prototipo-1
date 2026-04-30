"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);

  // Truco Vibecoding Supremo: 
  // Jitsi Meet es un software Open Source (Código Abierto) que no requiere API Keys
  // No hay tarjetas de crédito, ni límites de tiempo ni registros. 
  // Solo con mandar el ID de la sala que generó Supabase, crea un cuarto de video para ambos.
  const jitsiRoomUrl = `https://meet.jit.si/EfectoProtege-${unwrappedParams.id}`;

  return (
    <main className="h-screen bg-zinc-950 text-white flex flex-col relative p-4">
      {/* Botón superior de salida */}
      <button 
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 z-10 flex items-center bg-black/80 px-4 py-2 rounded-full text-zinc-300 hover:text-white transition shadow-lg border border-zinc-800"
      >
        <ArrowLeft className="mr-2" size={20} /> Salir y cobrar créditos
      </button>

      {/* Frame de Videollamada de Altísimo rendimiento (Jitsi Meet) */}
      <div className="flex-1 w-full mt-16 bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl relative border border-zinc-800">
        <iframe
          src={jitsiRoomUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="w-full h-full border-none"
        />
      </div>
    </main>
  );
}