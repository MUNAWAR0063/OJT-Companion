import { cn } from "@/lib/utils"

interface ThemedLogoProps {
  alt: string
  className?: string
}

export function ThemedLogo({ alt, className }: ThemedLogoProps) {
  return (
    <>
      <img
        src="/logo-light.png"
        alt={alt}
        className={cn("object-contain dark:hidden", className)}
      />
      <img
        src="/logo-dark.png"
        alt={alt}
        className={cn("hidden object-contain dark:block", className)}
      />
    </>
  )
}
