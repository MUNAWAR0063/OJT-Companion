export const USER_FILES_BUCKET = "user-files"
export const PHOTO_GALLERY_MODULE = "photo-gallery"
export const DOCUMENTS_MODULE = "documents"

export const PHOTO_MAX_BYTES = 5 * 1024 * 1024
export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024

export const PHOTO_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
export const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
])

export const DOCUMENT_EXTENSIONS = new Set(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"])

export function safeFileName(fileName) {
  const normalized = String(fileName || "file")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
  return normalized || "file"
}

export function fileExtension(fileName) {
  const parts = String(fileName).toLowerCase().split(".")
  return parts.length > 1 ? parts.pop() : ""
}

export function validateModuleFile({ module, fileName, mimeType, sizeBytes }) {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return { ok: false, message: "File is empty or invalid." }
  }

  if (module === PHOTO_GALLERY_MODULE) {
    if (sizeBytes > PHOTO_MAX_BYTES) return { ok: false, message: "Photo must be 5 MB or smaller." }
    if (!PHOTO_MIME_TYPES.has(mimeType)) return { ok: false, message: "Photo Gallery only accepts JPG, PNG, or WebP images." }
    return { ok: true }
  }

  if (module === DOCUMENTS_MODULE) {
    if (sizeBytes > DOCUMENT_MAX_BYTES) return { ok: false, message: "Document must be 10 MB or smaller." }
    if (!DOCUMENT_MIME_TYPES.has(mimeType) && !DOCUMENT_EXTENSIONS.has(fileExtension(fileName))) {
      return { ok: false, message: "Documents only accepts PDF, Word, Excel, or PowerPoint files." }
    }
    return { ok: true }
  }

  return { ok: false, message: "Unsupported upload module." }
}

export function userFilePath({ userId, module, timestamp, fileName }) {
  return `${userId}/${module}/${timestamp}-${safeFileName(fileName)}`
}
