export function recalculateObjectiveProgress(objective) {
  const checklist = Array.isArray(objective?.checklist) ? objective.checklist : []
  if (checklist.length) {
    const done = checklist.filter((item) => Boolean(item.done)).length
    return Math.round((done / checklist.length) * 100)
  }
  if (objective?.status === "completed") return 100
  if (objective?.status === "in-progress") return 50
  return 0
}

export function recalculateWeekProgress(week) {
  const objectives = Array.isArray(week?.objectives) ? week.objectives : []
  if (!objectives.length) return 0
  return Math.round(
    objectives.reduce((total, objective) => total + recalculateObjectiveProgress(objective), 0) /
      objectives.length
  )
}

export function getWeekStatus(week) {
  const progress = recalculateWeekProgress(week)
  if (progress === 100) return "completed"
  if (progress > 0) return "in-progress"
  return "not-started"
}

export function recalculateRoadmapProgress(roadmap) {
  const weeks = Array.isArray(roadmap?.weeks) ? roadmap.weeks : []
  if (!weeks.length) return 0
  return Math.round(
    weeks.reduce((total, week) => total + recalculateWeekProgress(week), 0) / weeks.length
  )
}

export function generateWeeklyPlansFromRoadmap(roadmap) {
  if (!roadmap || !Array.isArray(roadmap.weeks)) return []
  return roadmap.weeks
    .map((week) => ({
      id: week.id,
      weekNumber: week.weekNumber,
      title: week.title || `Week ${week.weekNumber}`,
      reflection: week.reflection || "",
      linkedRoadmapId: roadmap.id,
      linkedWeekId: week.id,
      progress: recalculateWeekProgress(week),
      status: getWeekStatus(week),
      objectives: (week.objectives || []).map((objective) => ({
        ...objective,
        roadmapId: roadmap.id,
        roadmapWeekId: week.id,
        linkedRoadmapId: roadmap.id,
        linkedWeekId: week.id,
        status: objective.status || "not-started",
        progress: recalculateObjectiveProgress(objective),
      })),
      createdAt: roadmap.createdAt,
      updatedAt: new Date().toISOString(),
    }))
    .sort((left, right) => (Number(left.weekNumber) || 0) - (Number(right.weekNumber) || 0))
}

export function createRoadmapWithWeeks(input, createRoadmap) {
  return createRoadmap(input)
}

export function updateObjectiveStatus(objective, status) {
  const checklist = Array.isArray(objective?.checklist) ? objective.checklist : []
  const nextChecklist =
    status === "completed"
      ? checklist.map((item) => ({ ...item, done: true }))
      : status === "not-started"
        ? checklist.map((item) => ({ ...item, done: false }))
        : checklist
  return {
    ...objective,
    checklist: nextChecklist,
    status,
    progress: recalculateObjectiveProgress({ ...objective, checklist: nextChecklist, status }),
  }
}
