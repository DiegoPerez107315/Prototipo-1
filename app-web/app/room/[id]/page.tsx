"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, FileText, Image as ImageIcon, Eraser, Pencil } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [isMounted, setIsMounted] = useState(false);
  const [roomData, setRoomData] = useState<{ topic?: string; resource_url?: string; resource_type?: string; resource_name?: string } | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [penColor, setPenColor] = useState("#111827");
  const [penSize, setPenSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const whiteboardContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadRoomData = async () => {
      setIsLoadingRoom(true);
      const { data, error } = await supabase
        .from("rooms")
        .select("topic, resource_url, resource_type, resource_name")
        .eq("id", unwrappedParams.id)
        .maybeSingle();

      if (error) {
        console.warn("No se pudo cargar metadata de la sala:", error.message);
      }

      setRoomData(data ?? null);
      setIsLoadingRoom(false);
    };

    loadRoomData();
  }, [supabase, unwrappedParams.id]);

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

  useEffect(() => {
    if (!isMounted) return;

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = whiteboardContainerRef.current;
      if (!canvas || !container) return;

      const { width, height } = container.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      const ctx = canvas.getContext("2d");

      canvas.width = Math.floor(width * scale);
      canvas.height = Math.floor(height * scale);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(scale, scale);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
      }
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    if (whiteboardContainerRef.current) {
      observer.observe(whiteboardContainerRef.current);
    }

    return () => observer.disconnect();
  }, [isMounted]);

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.setPointerCapture(event.pointerId);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.beginPath();
    ctx.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  if (!isMounted) {
    return (
      <main className="h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col relative p-4">
      {/* Botón superior de salida */}
      <button 
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 z-10 flex items-center bg-black/80 px-4 py-2 rounded-full text-zinc-300 hover:text-white transition shadow-lg border border-zinc-800"
      >
        <ArrowLeft className="mr-2" size={20} /> Salir y cobrar créditos
      </button>

      <div className="mt-16 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        {/* Contenedor DOM para inyectar Jitsi crudo */}
        <div 
          ref={jitsiContainerRef} 
          className="min-h-[50vh] lg:min-h-[70vh] w-full rounded-3xl overflow-hidden shadow-2xl relative border border-transparent bg-zinc-900" 
        />

        {/* Panel de recursos + whiteboard */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800 p-4 text-zinc-100 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-300">Material de clase</h3>
                <p className="text-base font-bold text-white">
                  {roomData?.topic ?? (isLoadingRoom ? "Cargando tema..." : "Tema no definido")}
                </p>
              </div>
              {roomData?.resource_type === "image" && <ImageIcon className="text-blue-400" size={18} />}
              {roomData?.resource_type === "pdf" && <FileText className="text-emerald-400" size={18} />}
            </div>

            {roomData?.resource_url ? (
              <div className="mt-4 space-y-3">
                {roomData.resource_type === "image" && (
                  <img
                    src={roomData.resource_url}
                    alt={roomData.resource_name ?? "Imagen"}
                    className="w-full rounded-2xl border border-zinc-800 object-cover max-h-64"
                  />
                )}
                {roomData.resource_type === "pdf" && (
                  <iframe
                    src={roomData.resource_url}
                    className="w-full h-64 rounded-2xl border border-zinc-800 bg-white"
                    title="PDF de la clase"
                  />
                )}
                <a
                  href={roomData.resource_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-300 hover:text-blue-200"
                >
                  Abrir en otra pestaña
                </a>
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-400">
                No se adjunto material. Usa la whiteboard para explicar.
              </p>
            )}
          </div>

          <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800 p-4 text-zinc-100 shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-300">Whiteboard integrada</h3>
                <p className="text-xs text-zinc-500">Siempre disponible para explicar sin compartir pantalla.</p>
              </div>
              <button
                onClick={clearBoard}
                className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white"
                type="button"
              >
                <Eraser size={14} /> Limpiar
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Pencil size={16} className="text-zinc-400" />
              <button
                type="button"
                onClick={() => setPenColor("#f97316")}
                className={`h-6 w-6 rounded-full bg-orange-500 border ${penColor === "#f97316" ? "border-white" : "border-transparent"}`}
              />
              <button
                type="button"
                onClick={() => setPenColor("#2563eb")}
                className={`h-6 w-6 rounded-full bg-blue-600 border ${penColor === "#2563eb" ? "border-white" : "border-transparent"}`}
              />
              <button
                type="button"
                onClick={() => setPenColor("#22c55e")}
                className={`h-6 w-6 rounded-full bg-green-500 border ${penColor === "#22c55e" ? "border-white" : "border-transparent"}`}
              />
              <button
                type="button"
                onClick={() => setPenColor("#111827")}
                className={`h-6 w-6 rounded-full bg-slate-900 border ${penColor === "#111827" ? "border-white" : "border-transparent"}`}
              />
              <select
                value={penSize}
                onChange={(event) => setPenSize(Number(event.target.value))}
                className="ml-auto rounded-lg bg-zinc-800 text-xs text-zinc-200 px-2 py-1 border border-zinc-700"
              >
                <option value={2}>Fino</option>
                <option value={4}>Medio</option>
                <option value={6}>Grueso</option>
              </select>
            </div>

            <div ref={whiteboardContainerRef} className="flex-1 min-h-[260px] rounded-2xl bg-white">
              <canvas
                ref={canvasRef}
                className="rounded-2xl"
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
              />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}