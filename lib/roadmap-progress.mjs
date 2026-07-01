export function getRoadmapOverallProgress(roadmap) {
  const weeks = Array.isArray(roadmap?.weeks) ? roadmap.weeks : []
  if (!weeks.length) return 0

  const total = weeks.reduce((sum, week) => {
    const progress = Number.isFinite(Number(week?.progress)) ? Number(week.progress) : 0
    return sum + Math.min(100, Math.max(0, progress))
  }, 0)

  return Math.round(total / weeks.length)
}
