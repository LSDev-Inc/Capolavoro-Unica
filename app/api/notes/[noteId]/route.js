import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/session";
import { isValidNote } from "@/lib/validators";
import { attachAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function PUT(req, { params }) {
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

  const { noteId } = params;
  const title = payload?.title?.trim();
  const content = payload?.content?.trim();

  if (!isValidNote(title, content)) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }

  const note = user.notes.find((item) => item.id === noteId);
  if (!note) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  note.title = title;
  note.content = content;
  note.updatedAt = new Date();
  await user.save();

  const response = NextResponse.json({ note });
  return attachAuthCookie(response, user);
}

export async function DELETE(req, { params }) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { noteId } = params;
  const initialLength = user.notes.length;
  user.notes = user.notes.filter((item) => item.id !== noteId);

  if (user.notes.length === initialLength) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  await user.save();

  const response = NextResponse.json({ success: true });
  return attachAuthCookie(response, user);
}
