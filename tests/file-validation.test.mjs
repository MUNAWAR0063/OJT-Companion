import assert from "node:assert/strict"
import test from "node:test"
import {
  DOCUMENTS_MODULE,
  PHOTO_GALLERY_MODULE,
  PROFILE_MODULE,
  validateModuleFile,
  userFilePath,
  profileAvatarPath,
  safeFileName,
  PHOTO_MAX_BYTES,
  DOCUMENT_MAX_BYTES,
  PROFILE_AVATAR_MAX_BYTES,
} from "../lib/supabase/file-validation.mjs"

test("creates user-scoped Supabase Storage paths with safe file names", () => {
  assert.equal(safeFileName("My Report (final).pdf"), "My_Report_final_.pdf")
  assert.equal(
    userFilePath({
      userId: "user-123",
      module: DOCUMENTS_MODULE,
      timestamp: 1720000000000,
      fileName: "My Report (final).pdf",
    }),
    "user-123/documents/1720000000000-My_Report_final_.pdf"
  )
})

test("allows only jpg, png, and webp for photo gallery", () => {
  assert.equal(
    validateModuleFile({
      module: PHOTO_GALLERY_MODULE,
      fileName: "image.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 1000,
    }).ok,
    true
  )
  assert.equal(
    validateModuleFile({
      module: PHOTO_GALLERY_MODULE,
      fileName: "image.gif",
      mimeType: "image/gif",
      sizeBytes: 1000,
    }).ok,
    false
  )
})

test("enforces photo gallery size limit", () => {
  assert.equal(
    validateModuleFile({
      module: PHOTO_GALLERY_MODULE,
      fileName: "image.png",
      mimeType: "image/png",
      sizeBytes: PHOTO_MAX_BYTES + 1,
    }).ok,
    false
  )
})

test("allows only pdf and office document files", () => {
  assert.equal(
    validateModuleFile({
      module: DOCUMENTS_MODULE,
      fileName: "report.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1000,
    }).ok,
    true
  )
  assert.equal(
    validateModuleFile({
      module: DOCUMENTS_MODULE,
      fileName: "slides.pptx",
      mimeType: "application/octet-stream",
      sizeBytes: 1000,
    }).ok,
    true
  )
  assert.equal(
    validateModuleFile({
      module: DOCUMENTS_MODULE,
      fileName: "notes.txt",
      mimeType: "text/plain",
      sizeBytes: 1000,
    }).ok,
    false
  )
})

test("enforces documents size limit", () => {
  assert.equal(
    validateModuleFile({
      module: DOCUMENTS_MODULE,
      fileName: "report.pdf",
      mimeType: "application/pdf",
      sizeBytes: DOCUMENT_MAX_BYTES + 1,
    }).ok,
    false
  )
})

test("creates stable user-scoped profile avatar paths", () => {
  assert.equal(
    profileAvatarPath({
      userId: "user-123",
      timestamp: 1720000000000,
      fileName: "My Avatar.png",
    }),
    "user-123/profile/avatar-1720000000000.png"
  )
})

test("allows only jpg, png, and webp profile avatars", () => {
  assert.equal(
    validateModuleFile({
      module: PROFILE_MODULE,
      fileName: "avatar.webp",
      mimeType: "image/webp",
      sizeBytes: 1000,
    }).ok,
    true
  )
  assert.equal(
    validateModuleFile({
      module: PROFILE_MODULE,
      fileName: "avatar.gif",
      mimeType: "image/gif",
      sizeBytes: 1000,
    }).ok,
    false
  )
})

test("enforces profile avatar size limit", () => {
  assert.equal(
    validateModuleFile({
      module: PROFILE_MODULE,
      fileName: "avatar.jpg",
      mimeType: "image/jpeg",
      sizeBytes: PROFILE_AVATAR_MAX_BYTES + 1,
    }).ok,
    false
  )
})
