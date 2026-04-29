# Documento de Contexto y Requisitos del Producto (PRD)

## 1. Visión General del Proyecto
**Descripción:** Una plataforma web que conecta a dos personas en videollamadas 1 a 1. El objetivo principal es invertir la dinámica tradicional de aprendizaje: el valor principal es tener un espacio y una audiencia para poder *enseñar* un tema y así afianzar el propio conocimiento. 
**Diferenciador:** No existen expertos. La persona que enseña es quien recibe el mayor beneficio cognitivo. La persona que escucha actúa como un evaluador/audiencia que hace preguntas para poner a prueba al que explica.

## 2. Mecánica Principal y Economía de la Plataforma
* **Sistema de Créditos:**
    * **Ganar créditos:** Un usuario se une a una sala para escuchar la explicación de otro usuario. Al terminar el tiempo de la sesión, gana créditos.
    * **Gastar créditos:** El usuario usa esos créditos para tener el derecho de "crear una sala" y enseñar un tema que él mismo quiere afianzar.
* **Interacción:** Videollamadas 1 a 1 en vivo.
* **Validación de Sesión:** Ambas personas deben tener la cámara encendida durante la llamada como prueba de presencia.
* **Cero Fricción:** NO hay sistema de calificación manual (estrellas, reviews, etc.) al final de la llamada para evitar toxicidad o frustraciones. Los créditos se liberan automáticamente al cumplir el tiempo de la videollamada con la cámara activa.

## 3. Flujo de Usuario (User Journey)
1. **Inicio de sesión:** El usuario entra a la plataforma (autenticación básica).
2. **Dashboard:** El usuario ve su saldo de créditos y dos opciones principales:
    * *Opción A:* "Quiero enseñar un tema" (Cuesta créditos).
    * *Opción B:* "Quiero escuchar para ganar créditos".
3. **Matchmaking (Emparejamiento Automático):**
    * Si el usuario elige *enseñar*, ingresa el título de su tema y entra a una sala de espera.
    * Si el usuario elige *escuchar*, el sistema lo empareja automáticamente con una sala disponible.
4. **La Sesión:** Inicia la videollamada 1 a 1. Hay un temporizador en pantalla (ej. 15 minutos).
5. **Cierre:** Al finalizar el tiempo, la llamada se corta, se actualizan los créditos de ambos en la base de datos y vuelven al Dashboard.

## 4. Stack Tecnológico Sugerido (Optimizado para IA)
* **Frontend:** Next.js (React) utilizando App Router.
* **Estilos:** Tailwind CSS y componentes de shadcn/ui (para una interfaz limpia y rápida de generar).
* **Backend & Autenticación:** Supabase o Firebase (Baas).
* **Videollamadas:** Integración de un SDK de terceros diseñado para React (ej. Daily.co o Agora) para manejar el video y el audio sin lidiar con WebRTC crudo.

## 5. Reglas e Instrucciones para el Asistente de IA (Vibecoding Rules)
Como usuario, soy principiante en programación. Al construir este proyecto, debes seguir estas reglas estrictas:
1.  **Simplicidad primero:** Evita arquitecturas sobre-diseñadas. Usa el camino más directo para que el prototipo funcione.
2.  **Paso a paso:** No me des todo el código de la aplicación de golpe. Construyamos iterativamente:
    * Paso 1: Estructura base y UI del Dashboard.
    * Paso 2: Autenticación.
    * Paso 3: Lógica de la base de datos para los créditos.
    * Paso 4: Matchmaking.
    * Paso 5: Integración de la sala de video.
3.  **Explicaciones claras:** Antes de implementar un bloque de código grande, explícame brevemente qué va a hacer y dónde debo ubicar o modificar el archivo.
4.  **Manejo de errores amigable:** Si te pego un error de la consola, asume que no sé cómo arreglarlo y dame el comando exacto o la línea exacta a reemplazar.