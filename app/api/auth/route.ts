import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    const SECRET = process.env.JWT_SECRET || "";

    // Valida a assinatura e a expiração automaticamente
    const decoded = jwt.verify(token, SECRET);

    return NextResponse.json({ valid: true, data: decoded });
  } catch (error) {
    // Se o token for falso, alterado ou estiver expirado, ele cai aqui
    return NextResponse.json({ valid: false, message: "Link expirado ou inválido" }, { status: 401 });
  }
}