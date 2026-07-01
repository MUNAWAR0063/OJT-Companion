export const COMPETENCY_PAGE_SIZE = 6

export const COMPETENCY_SORT_OPTIONS = [
  "updated-desc",
  "progress-desc",
  "progress-asc",
  "title-asc",
  "status-asc",
]

const statusRank = {
  completed: 0,
  "in-progress": 1,
  "not-started": 2,
}

export function timestamp(value) {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isFinite(time) ? time : 0
}

export function formatCompetencyDate(value, locale) {
  const time = timestamp(value)
  if (!time) return "No updates yet"
  return new Date(time).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })
}

export function filterCompetencies(competencies, { query = "", category = "all", status = "all" } = {}) {
  const normalizedQuery = query.trim().toLowerCase()
  return competencies.filter((competency) => {
    const title = String(competency.title ?? "").toLowerCase()
    const competencyCategory = String(competency.category ?? "")
    const description = String(competency.description ?? "").toLowerCase()
    const matchesQuery =
      !normalizedQuery ||
      title.includes(normalizedQuery) ||
      competencyCategory.toLowerCase().includes(normalizedQuery) ||
      description.includes(normalizedQuery)
    const matchesCategory = category === "all" || competencyCategory === category
    const matchesStatus = status === "all" || competency.status === status
    return matchesQuery && matchesCategory && matchesStatus
  })
}

export function sortCompetencies(competencies, sort = "updated-desc") {
  return [...competencies].sort((left, right) => {
    if (sort === "progress-desc") return right.progress - left.progress || left.title.localeCompare(right.title)
    if (sort === "progress-asc") return left.progress - right.progress || left.title.localeCompare(right.title)
    if (sort === "title-asc") return left.title.localeCompare(right.title)
    if (sort === "status-asc") {
      return (statusRank[left.status] ?? 99) - (statusRank[right.status] ?? 99) || left.title.localeCompare(right.title)
    }
    return timestamp(right.lastUpdated) - timestamp(left.lastUpdated) || left.title.localeCompare(right.title)
  })
}

export function paginateCompetencies(competencies, page, pageSize = COMPETENCY_PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(competencies.length / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const start = (safePage - 1) * pageSize
  return {
    page: safePage,
    pageCount,
    pageSize,
    total: competencies.length,
    items: competencies.slice(start, start + pageSize),
  }
}

export function getVisibleCompetencies(competencies, filters, sort, page, pageSize = COMPETENCY_PAGE_SIZE) {
  const filtered = filterCompetencies(competencies, filters)
  const sorted = sortCompetencies(filtered, sort)
  return {
    filtered,
    sorted,
    pagination: paginateCompetencies(sorted, page, pageSize),
  }
}
