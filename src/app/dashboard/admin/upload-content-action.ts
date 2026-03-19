"use server";

import { promises as fs } from "node:fs";
import path from "node:path";

import { ContentLibrarySourceEntry } from "@/types/database";
import { registerContentLibrarySource, readContentLibraryIndex } from "@/services/content-library/library-index";
import { revalidatePath } from "next/cache";

const CONTENT_LIBRARY_ROOT = path.join(process.cwd(), "content-library");
const UPLOAD_FOLDER = path.join(CONTENT_LIBRARY_ROOT, "uploads");

export async function uploadContentLibrarySource(formData: FormData) {
  const file = formData.get("file");
  const title = formData.get("title");
  const sourceType = formData.get("sourceType");
  const notes = formData.get("notes");
  const usage = formData.getAll("usage").filter(Boolean) as string[];
  const applicability = formData.getAll("applicability").filter(Boolean) as string[];
  const topicsRaw = formData.get("topics");
  const topics = topicsRaw ? String(topicsRaw).split(",").map((item) => item.trim()).filter(Boolean) : [];

  if (!(file instanceof File)) {
    throw new Error("Arquivo inválido.");
  }

  if (!title || !sourceType || !usage.length || !applicability.length) {
    throw new Error("Informe título, tipo, uso e aplicabilidade.");
  }

  await fs.mkdir(UPLOAD_FOLDER, { recursive: true });
  const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const relativePath = path.join("uploads", safeName);
  const absolutePath = path.join(CONTENT_LIBRARY_ROOT, relativePath);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absolutePath, buffer);

  const index = await readContentLibraryIndex();
  const nextId = `local-${index.sources.length + 1}-${Date.now()}`;
  const entry: ContentLibrarySourceEntry = {
    id: nextId,
    title: String(title),
    filePath: relativePath,
    sourceType: String(sourceType) as ContentLibrarySourceEntry["sourceType"],
    usage: usage.map((item) => String(item) as ContentLibrarySourceEntry["usage"][number]),
    applicability: applicability.map((item) => String(item) as ContentLibrarySourceEntry["applicability"][number]),
    topics,
    priority: "medium",
    notes: notes ? String(notes) : undefined
  };

  await registerContentLibrarySource(entry);

  revalidatePath("/ai/sources");
  revalidatePath("/dashboard/admin");
}
