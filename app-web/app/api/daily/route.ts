import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { roomName } = await request.json();
    
    if (!process.env.DAILY_API_KEY) {
      return NextResponse.json({ error: "Falta la llave de Daily en el servidor" }, { status: 500 });
    }

    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          exp: Math.round(Date.now() / 1000) + 3600, // La sala caduca en 1 hora por seguridad
          max_participants: 2,
        },
      }),
    });

    const room = await response.json();
    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json({ error: "Error creando sala en daily" }, { status: 500 });
  }
}
