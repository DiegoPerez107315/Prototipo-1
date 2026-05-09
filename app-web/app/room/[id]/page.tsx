"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, CheckCircle } from "lucide-react";

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);

  // Usamos el servidor alemán libre de Jitsi.
  const jitsiRoomUrl = `https://meet.ffmuc.net/EfectoProtege-${unwrappedParams.id}`;

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 relative">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">Sala Generada</h2>
        <p className="text-zinc-400 mb-8">
          Para evitar problemas de permisos de cámara en el celular, la llamada de video se abrirá de forma segura en una nueva pestaña.
        </p>
        
        <a 
          href={jitsiRoomUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl mb-8 transition-all shadow-lg"
        >
          <ExternalLink className="mr-2" size={24} />
          Abrir Videollamada
        </a>

        <hr className="border-zinc-800 mb-8" />

        <p className="text-sm text-zinc-500 mb-4">¿Terminaste de explicar o escuchar?</p>
        <button 
          onClick={() => router.push("/")}
          className="flex items-center justify-center w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
        >
          <CheckCircle className="mr-2 text-green-400" size={20} />
          Finalizar y actualizar créditos 
        </button>
      </div>
    </main>
  );
}