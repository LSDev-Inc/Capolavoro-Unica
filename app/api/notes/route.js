import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthUser } from "@/lib/session";
import { isValidNote } from "@/lib/validators";
import { attachAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const response = NextResponse.json({ notes: user.notes || [] });
  return attachAuthCookie(response, user);
}

export async function POST(req) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const title = payload?.title?.trim();
  const content = payload?.content?.trim();

  if (!isValidNote(title, content)) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }

  const newNote = {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  user.notes.unshift(newNote);
  await user.save();

  const response = NextResponse.json({ note: newNote }, { status: 201 });
  return attachAuthCookie(response, user);
}
