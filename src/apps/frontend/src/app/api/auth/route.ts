import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { buyerName } = (await request.json()) as { buyerName?: string };
  if (!buyerName || buyerName.trim().length === 0) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("buyerName", buyerName.trim(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
    sameSite: "lax",
  });
  return res;
}
