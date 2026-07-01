"use client"

import { useMemo } from "react"
import { useUserProfileStore } from "@/lib/user-profile-store"
import {
  disciplineLabelToCode,
  filterForDiscipline,
  getWorkspaceConfiguration,
  type DisciplineEntity,
} from "@/lib/discipline/discipline-engine"

export function useDisciplineWorkspace() {
  const disciplineLabel = useUserProfileStore((state) => state.profile.discipline)
  const discipline = disciplineLabelToCode(disciplineLabel)

  return useMemo(() => {
    const configuration = getWorkspaceConfiguration(discipline)

    return {
      discipline,
      configuration,
      filter<T extends DisciplineEntity>(items: T[]) {
        return filterForDiscipline(items, discipline)
      },
    }
  }, [discipline])
}
