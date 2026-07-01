function plainTextFromMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[^\n]*\n?/g, ""))
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>]/g, "")
    .replace(/^[-+]\s+/gm, "- ")
    .replace(/[^\x20-\x7E\n]/g, "?")
}

function wrapText(text: string, width = 88) {
  const lines: string[] = []
  text.split("\n").forEach((paragraph) => {
    if (!paragraph.trim()) {
      lines.push("")
      return
    }
    let remaining = paragraph
    while (remaining.length > width) {
      let splitAt = remaining.lastIndexOf(" ", width)
      if (splitAt < 1) splitAt = width
      lines.push(remaining.slice(0, splitAt))
      remaining = remaining.slice(splitAt).trimStart()
    }
    lines.push(remaining)
  })
  return lines
}

const escapePdfText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")

export function createPdfBlob(markdown: string) {
  const lines = wrapText(plainTextFromMarkdown(markdown))
  const linesPerPage = 48
  const pages = Array.from(
    { length: Math.max(1, Math.ceil(lines.length / linesPerPage)) },
    (_, index) => lines.slice(index * linesPerPage, (index + 1) * linesPerPage)
  )
  const fontId = 3 + pages.length * 2
  const objects: string[] = []
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>"
  const pageIds = pages.map((_, index) => 3 + index * 2)
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`

  pages.forEach((pageLines, index) => {
    const pageId = 3 + index * 2
    const streamId = pageId + 1
    const commands = [
      "BT",
      "/F1 10 Tf",
      "50 750 Td",
      "14 TL",
      ...pageLines.flatMap((line) => [`(${escapePdfText(line)}) Tj`, "T*"]),
      `(${index + 1} / ${pages.length}) Tj`,
      "ET",
    ].join("\n")
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ` +
      `/Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${streamId} 0 R >>`
    objects[streamId] = `<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`
  })
  objects[fontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"

  let pdf = "%PDF-1.4\n"
  const offsets: number[] = [0]
  for (let id = 1; id <= fontId; id += 1) {
    offsets[id] = pdf.length
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`
  }
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${fontId + 1}\n`
  pdf += "0000000000 65535 f \n"
  for (let id = 1; id <= fontId; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${fontId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new Blob([pdf], { type: "application/pdf" })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function safeFilename(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
