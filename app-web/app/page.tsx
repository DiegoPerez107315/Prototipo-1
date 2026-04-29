import { User, Coins, Ear, Mic } from "lucide-react";

export default function Dashboard() {
  // Valor simulado de créditos (mock para el Paso 1)
  const credits = 15;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6 pt-12">
      {/* Header con Perfil y Créditos */}
      <header className="w-full max-w-md flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="font-semibold text-gray-800">Hola, Estudiante</h1>
            <p className="text-xs text-gray-500">Listo para aprender</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1.5 rounded-full border border-yellow-200">
          <Coins className="text-yellow-600" size={18} />
          <span className="font-bold text-yellow-700">{credits}</span>
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
        <button className="flex items-center p-5 bg-white border-2 border-blue-500 rounded-2xl shadow-sm hover:bg-blue-50 hover:scale-[1.02] transition-all text-left group">
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
        <button className="flex items-center p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-green-500 hover:bg-green-50 hover:scale-[1.02] transition-all text-left group mt-2">
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
