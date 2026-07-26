import {
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  type LucideIcon,
} from "lucide-react"

/**
 * AEGIS — file helpers (shared by the File Management components)
 *
 * Pure, framework-agnostic utilities: classify a file by its name/MIME type,
 * map that class to a Lucide glyph, and format a byte count for display. Kept in
 * one place so every file surface (Attachment Chip, File Card, File List, Upload
 * Progress, File Uploader) picks the SAME icon and size string for the same file.
 */

export type FileKind =
  | "image"
  | "video"
  | "audio"
  | "archive"
  | "code"
  | "spreadsheet"
  | "document"
  | "generic"

const EXT_KIND: Record<string, FileKind> = {
  // images
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image",
  svg: "image", avif: "image", bmp: "image", heic: "image", ico: "image",
  // video
  mp4: "video", mov: "video", webm: "video", mkv: "video", avi: "video", m4v: "video",
  // audio
  mp3: "audio", wav: "audio", flac: "audio", ogg: "audio", m4a: "audio", aac: "audio",
  // archives
  zip: "archive", rar: "archive", "7z": "archive", tar: "archive", gz: "archive", bz2: "archive",
  // code / data
  js: "code", ts: "code", tsx: "code", jsx: "code", json: "code", html: "code",
  css: "code", py: "code", rb: "code", go: "code", rs: "code", java: "code",
  sh: "code", yml: "code", yaml: "code", xml: "code",
  // spreadsheets
  csv: "spreadsheet", xls: "spreadsheet", xlsx: "spreadsheet", tsv: "spreadsheet",
  // documents
  pdf: "document", doc: "document", docx: "document", txt: "document",
  md: "document", rtf: "document", ppt: "document", pptx: "document",
}

/** Best-effort classification from a filename and/or MIME type. */
export function fileKind(nameOrType?: string, mimeType?: string): FileKind {
  const mime = (mimeType ?? "").toLowerCase()
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  if (mime.startsWith("audio/")) return "audio"

  const name = (nameOrType ?? "").toLowerCase()
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1) : ""
  return EXT_KIND[ext] ?? "generic"
}

const KIND_ICON: Record<FileKind, LucideIcon> = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  archive: FileArchive,
  code: FileCode,
  spreadsheet: FileSpreadsheet,
  document: FileText,
  generic: FileIcon,
}

/** The AEGIS glyph for a file kind. */
export function fileIcon(kind: FileKind): LucideIcon {
  return KIND_ICON[kind]
}

/**
 * Human-readable size. `formatBytes(1536)` → `"1.5 KB"`. Uses binary (1024)
 * units, trims trailing zeros, and returns `"—"` for a nullish/negative input.
 */
export function formatBytes(bytes?: number | null, decimals = 1): string {
  if (bytes == null || Number.isNaN(bytes) || bytes < 0) return "—"
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB", "PB"]
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, i)
  const rounded = i === 0 ? value : Number(value.toFixed(decimals))
  return `${rounded} ${units[i]}`
}
