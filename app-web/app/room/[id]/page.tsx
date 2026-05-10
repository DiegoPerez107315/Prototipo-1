"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { JitsiMeeting } from "@jitsi/react-sdk";

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Usamos el id de la sala de Supabase para evitar cruces
  const roomName = `EfectoProtege-${unwrappedParams.id}`;

  if (!isMounted) {
    return (
      <main className="h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </main>
    );
  }

  return (
    <main className="h-screen bg-zinc-950 flex flex-col relative p-4">
      {/* Botón superior de salida */}
      <button 
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 z-10 flex items-center bg-black/80 px-4 py-2 rounded-full text-zinc-300 hover:text-white transition shadow-lg border border-zinc-800"
      >
        <ArrowLeft className="mr-2" size={20} /> Salir y cobrar créditos
      </button>

      {/* Frame de Videollamada embebido con la librería oficial */}
      <div className="flex-1 w-full mt-16 rounded-3xl overflow-hidden shadow-2xl relative border border-transparent bg-zinc-900">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableModeratorIndicator: true,
            prejoinPageEnabled: false // Nos saltamos la pantalla de sala de espera de Jitsi
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
          }}
          userInfo={{
            displayName: "Estudiante Protégé"
          }}
          getIFrameRef={(iframeRef) => {
            // Esto asegura que ocupe todo el espacio de nuestra caja
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
          }}
        />
      </div>
    </main>
  );
}