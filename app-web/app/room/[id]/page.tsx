"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [isMounted, setIsMounted] = useState(false);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Usamos el id de la sala de Supabase para evitar cruces
  const roomName = `EfectoProtege-${unwrappedParams.id}`;

  useEffect(() => {
    if (!isMounted) return;

    // Cargar el script de Jitsi External API dinámicamente desde un servidor que permite incrustación libre
    const script = document.createElement("script");
    script.src = "https://jitsi.riot.im/external_api.js";
    script.async = true;
    script.onload = () => {
      if (window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
        // Inicializar el SDK crudo apuntando al servidor de Riot/Element (sin límite)
        jitsiApiRef.current = new window.JitsiMeetExternalAPI("jitsi.riot.im", {
          roomName,
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableModeratorIndicator: true,
            prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            SHOW_CHROME_EXTENSION_BANNER: false,
          },
          userInfo: {
            displayName: "Estudiante Protégé"
          },
          width: "100%",
          height: "100%",
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isMounted, roomName]);

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

      {/* Contenedor DOM para inyectar Jitsi crudo */}
      <div 
        ref={jitsiContainerRef} 
        className="flex-1 w-full mt-16 rounded-3xl overflow-hidden shadow-2xl relative border border-transparent bg-zinc-900" 
      />
    </main>
  );
}