"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import type { KnowledgeArticle } from "@/lib/knowledge-store"

interface MarkdownPreviewProps {
  content: string
  articles: KnowledgeArticle[]
  onSelectArticle: (id: string) => void
}

function inlineMarkdown(
  text: string,
  articles: KnowledgeArticle[],
  onSelectArticle: (id: string) => void
): ReactNode[] {
  const tokens = text.split(/(\[\[.+?\]\]|\[.+?\]\(.+?\)|\*\*.+?\*\*|`.+?`|\*.+?\*)/g)
  return tokens.map((token, index) => {
    if (token.startsWith("[[") && token.endsWith("]]")) {
      const title = token.slice(2, -2)
      const article = articles.find((item) => item.title.toLowerCase() === title.toLowerCase())
      return article ? (
        <Button
          key={index}
          variant="link"
          className="h-auto p-0 align-baseline"
          onClick={() => onSelectArticle(article.id)}
        >
          {title}
        </Button>
      ) : (
        <span key={index} className="text-destructive underline decoration-dotted">{title}</span>
      )
    }
    const link = token.match(/^\[(.+?)\]\((.+?)\)$/)
    if (link) {
      const href = /^(https?:\/\/|\/|#)/.test(link[2]) ? link[2] : "#"
      return <a key={index} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="text-primary underline">{link[1]}</a>
    }
    if (token.startsWith("**") && token.endsWith("**")) return <strong key={index}>{token.slice(2, -2)}</strong>
    if (token.startsWith("`") && token.endsWith("`")) return <code key={index} className="rounded bg-muted px-1 py-0.5 text-sm">{token.slice(1, -1)}</code>
    if (token.startsWith("*") && token.endsWith("*")) return <em key={index}>{token.slice(1, -1)}</em>
    return token
  })
}

export function MarkdownPreview({ content, articles, onSelectArticle }: MarkdownPreviewProps) {
  const lines = content.split("\n")
  const blocks: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (line.startsWith("```")) {
      const language = line.slice(3)
      const code: string[] = []
      index += 1
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index])
        index += 1
      }
      blocks.push(
        <pre key={`code-${index}`} className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
          <code data-language={language}>{code.join("\n")}</code>
        </pre>
      )
    } else if (/^[-*] /.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^[-*] /.test(lines[index])) {
        items.push(lines[index].slice(2))
        index += 1
      }
      blocks.push(
        <ul key={`ul-${index}`} className="list-disc space-y-1 pl-6">
          {items.map((item, itemIndex) => <li key={itemIndex}>{inlineMarkdown(item, articles, onSelectArticle)}</li>)}
        </ul>
      )
      continue
    } else if (/^\d+\. /.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\d+\. /.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\. /, ""))
        index += 1
      }
      blocks.push(
        <ol key={`ol-${index}`} className="list-decimal space-y-1 pl-6">
          {items.map((item, itemIndex) => <li key={itemIndex}>{inlineMarkdown(item, articles, onSelectArticle)}</li>)}
        </ol>
      )
      continue
    } else if (line.startsWith("### ")) {
      blocks.push(<h3 key={index} className="pt-2 text-lg font-semibold">{inlineMarkdown(line.slice(4), articles, onSelectArticle)}</h3>)
    } else if (line.startsWith("## ")) {
      blocks.push(<h2 key={index} className="pt-3 text-xl font-semibold">{inlineMarkdown(line.slice(3), articles, onSelectArticle)}</h2>)
    } else if (line.startsWith("# ")) {
      blocks.push(<h1 key={index} className="pt-3 text-2xl font-bold">{inlineMarkdown(line.slice(2), articles, onSelectArticle)}</h1>)
    } else if (line.startsWith("> ")) {
      blocks.push(<blockquote key={index} className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground">{inlineMarkdown(line.slice(2), articles, onSelectArticle)}</blockquote>)
    } else if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={index} className="border-border" />)
    } else if (line.trim()) {
      blocks.push(<p key={index} className="leading-7">{inlineMarkdown(line, articles, onSelectArticle)}</p>)
    } else {
      blocks.push(<div key={index} className="h-2" />)
    }
    index += 1
  }

  return <div className="space-y-3 break-words">{blocks}</div>
}
