"use client";

import { User, Coins, Ear, Mic, LogOut, X, FileText, Image as ImageIcon, Brush, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [credits, setCredits] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isTeachModalOpen, setIsTeachModalOpen] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [resourceType, setResourceType] = useState<"none" | "image" | "pdf">("none");
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [teachError, setTeachError] = useState("");
  const [teachLoading, setTeachLoading] = useState(false);
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
        setCredits(profile.credits ?? 15);
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

  const handleTeach = () => {
    if (credits === null || credits < 10) {
      alert("Necesitas al menos 10 créditos para enseñar y crear una sala.");
      return;
    }
    setTeachError("");
    setTopicInput("");
    setResourceType("none");
    setResourceFile(null);
    setIsTeachModalOpen(true);
  };

  const handleCreateRoom = async (event: React.FormEvent) => {
    event.preventDefault();
    setTeachLoading(true);
    setTeachError("");

    const topic = topicInput.trim();
    if (!topic) {
      setTeachError("Escribe un tema para poder crear la sala.");
      setTeachLoading(false);
      return;
    }

    if (resourceType !== "none" && !resourceFile) {
      setTeachError("Selecciona un archivo PDF o una imagen para continuar.");
      setTeachLoading(false);
      return;
    }

    if (resourceType === "image" && resourceFile && !resourceFile.type.startsWith("image/")) {
      setTeachError("El archivo debe ser una imagen válida.");
      setTeachLoading(false);
      return;
    }

    if (resourceType === "pdf" && resourceFile && resourceFile.type !== "application/pdf") {
      setTeachError("El archivo debe ser un PDF válido.");
      setTeachLoading(false);
      return;
    }

    if (credits === null || credits < 10) {
      setTeachError("Necesitas al menos 10 créditos para enseñar y crear una sala.");
      setTeachLoading(false);
      return;
    }

    // Obtener mis datos
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let resourceUrl: string | null = null;
    let resourceName: string | null = null;

    if (resourceType !== "none" && resourceFile) {
      const safeName = resourceFile.name.replace(/\s+/g, "-").toLowerCase();
      const filePath = `${user.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("room-assets")
        .upload(filePath, resourceFile);

      if (uploadError) {
        setTeachError("No pudimos subir tu archivo. Revisa el bucket 'room-assets' en Supabase.");
        setTeachLoading(false);
        return;
      }

      const { data: publicData } = supabase.storage.from("room-assets").getPublicUrl(filePath);
      resourceUrl = publicData.publicUrl;
      resourceName = resourceFile.name;
    }

    const basePayload = { topic: topic, host_id: user.id, status: "waiting" };
    const payload = resourceUrl
      ? { ...basePayload, resource_url: resourceUrl, resource_type: resourceType, resource_name: resourceName }
      : basePayload;

    // Crear la sala en Supabase
    const { data: room, error } = await supabase
      .from("rooms")
      .insert(payload)
      .select()
      .single();

    if (error) {
      const payloadWithoutResource = { topic: topic, host_id: user.id, status: "waiting" };
      if (resourceUrl && error.message.includes("column")) {
        const { data: fallbackRoom, error: fallbackError } = await supabase
          .from("rooms")
          .insert(payloadWithoutResource)
          .select()
          .single();

        if (fallbackError) {
          setTeachError("Error al crear la sala: " + fallbackError.message);
          setTeachLoading(false);
          return;
        }

        setTeachError("Tu base de datos no tiene columnas para recursos. Agrega resource_url, resource_type y resource_name en rooms.");
        setIsTeachModalOpen(false);
        setTeachLoading(false);
        router.push(`/room/${fallbackRoom.id}`);
        return;
      }

      setTeachError("Error al crear la sala: " + error.message);
      setTeachLoading(false);
      return;
    }

    // Cobrar 10 créditos para enseñar
    const updatedCredits = credits - 10;
    const { error: updateError } = await supabase.from("profiles").update({ credits: updatedCredits }).eq("id", user.id);
    if (updateError) {
      console.error("Error cobrando créditos:", updateError);
      alert("Hubo un problema actualizando tus créditos. Revisa la consola.");
    }

    // Vamos directo a la sala
    setIsTeachModalOpen(false);
    setTeachLoading(false);
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

      {isTeachModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setIsTeachModalOpen(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-700"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Preparar clase</h3>
              <p className="text-sm text-gray-500 mt-1">
                Escribe tu tema y agrega recursos opcionales. La whiteboard siempre estara lista en la sala.
              </p>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tema de la sesion</label>
                <input
                  value={topicInput}
                  onChange={(event) => setTopicInput(event.target.value)}
                  placeholder="Ej: Redes neuronales para principiantes"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  maxLength={120}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Materiales adicionales</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => { setResourceType("none"); setResourceFile(null); }}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${resourceType === "none" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-blue-200"}`}
                  >
                    <Brush size={18} />
                    Solo whiteboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setResourceType("image")}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${resourceType === "image" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-blue-200"}`}
                  >
                    <ImageIcon size={18} />
                    Imagen
                  </button>
                  <button
                    type="button"
                    onClick={() => setResourceType("pdf")}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${resourceType === "pdf" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-blue-200"}`}
                  >
                    <FileText size={18} />
                    PDF
                  </button>
                </div>
              </div>

              {resourceType !== "none" && (
                <div className="rounded-2xl border border-dashed border-gray-200 p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subir archivo {resourceType === "image" ? "(imagen)" : "(PDF)"}
                  </label>
                  <div className="flex flex-col gap-3">
                    <input
                      type="file"
                      accept={resourceType === "image" ? "image/*" : "application/pdf"}
                      onChange={(event) => setResourceFile(event.target.files?.[0] ?? null)}
                      className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                    />
                    {resourceFile && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UploadCloud size={16} />
                        {resourceFile.name}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {teachError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {teachError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setIsTeachModalOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-gray-600 font-semibold hover:border-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={teachLoading}
                  className="flex-1 rounded-xl bg-gray-900 py-3 text-white font-semibold hover:bg-gray-800 transition disabled:opacity-70"
                >
                  {teachLoading ? "Creando sala..." : "Entrar a la sala"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
