import { ThemedLogo } from "@/components/ThemedLogo"

export function Logo() {
  return (
    <div className="flex items-center">
      <div className="flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
        <ThemedLogo alt="MEDCOENERGI logo" className="h-full w-full" />
      </div>
    </div>
  )
}
