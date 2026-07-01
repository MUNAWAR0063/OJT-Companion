export interface UserGuideSection {
  heading: string
  steps: string[]
}

export interface UserGuide {
  id: string
  title: string
  readingTime: string
  description: string
  sections: UserGuideSection[]
  tips: string[]
}

export const userGuides: UserGuide[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    readingTime: "5 min",
    description: "Set up your trainee workspace, roadmap, planner, and evidence flow.",
    sections: [
      {
        heading: "Set up your workspace",
        steps: [
          "Sign in and use the dashboard as the starting point for your OJT workspace.",
          "Open Settings, complete your trainee profile, and add your current training information.",
          "Review the dashboard cards to understand your current week, tasks, learning activity, and progress.",
          "Open Learning Roadmap to review the OJT sequence, weekly objectives, and expected milestones.",
        ],
      },
      {
        heading: "Start recording your OJT activity",
        steps: [
          "Create your first Weekly Planner and add the objectives and tasks agreed with your mentor.",
          "Upload supporting evidence or documents after completing an activity.",
          "Monitor dashboard, roadmap, and competency progress regularly.",
          "Contact your mentor or administrator when access, assignments, or validation do not match your OJT plan.",
        ],
      },
    ],
    tips: [
      "Complete your profile and roadmap before creating detailed weekly records.",
      "Record evidence while the activity is still fresh instead of waiting until the end of the week.",
    ],
  },
  {
    id: "creating-weekly-planner",
    title: "Creating Weekly Planner",
    readingTime: "6 min",
    description: "Plan weekly objectives, estimate hours, and track task completion.",
    sections: [
      {
        heading: "Build the weekly plan",
        steps: [
          "Open Weekly Planner and select the OJT week you want to plan.",
          "Add clear weekly objectives that describe the expected learning outcome.",
          "Estimate the activity hours needed for each objective.",
          "Add specific tasks and arrange them in a practical working order.",
        ],
      },
      {
        heading: "Complete and review the plan",
        steps: [
          "Mark each task as completed when the work has actually been performed.",
          "Upload relevant evidence, photos, notes, or documents for completed work.",
          "Review objectives, hours, task status, and evidence before submitting or sharing the planner.",
          "Update unfinished items or carry them forward according to your mentor's direction.",
        ],
      },
    ],
    tips: [
      "Use measurable objectives such as inspect, identify, explain, test, or document.",
      "Keep estimated hours realistic so the weekly progress summary remains meaningful.",
    ],
  },
  {
    id: "building-learning-roadmap",
    title: "Building Learning Roadmap",
    readingTime: "7 min",
    description: "Structure OJT trips, weeks, objectives, and milestones.",
    sections: [
      {
        heading: "Understand the roadmap",
        steps: [
          "Open Learning Roadmap to see the complete OJT learning sequence.",
          "Review weeks 1 through 18 and identify the current active week.",
          "Read each weekly objective and milestone before planning site activities.",
          "Use the status and progress indicators to distinguish upcoming, active, and completed work.",
        ],
      },
      {
        heading: "Maintain roadmap progress",
        steps: [
          "Update progress after completing the related learning activities.",
          "Adjust week details when site schedules or operational priorities change.",
          "Keep changes aligned with the approved OJT outcome rather than removing required learning.",
          "Use mentor or administrator review to confirm major changes and completed milestones.",
        ],
      },
    ],
    tips: [
      "Compare the roadmap with your Weekly Planner before each new week.",
      "Discuss schedule changes early so milestones can be reviewed before they become overdue.",
    ],
  },
  {
    id: "managing-competencies",
    title: "Managing Competencies",
    readingTime: "6 min",
    description: "Understand how competency evidence and progress are calculated.",
    sections: [
      {
        heading: "Review competency requirements",
        steps: [
          "Open Competencies to review the knowledge and practical abilities required by the program.",
          "Open a competency to see its current status, progress, and related expectations.",
          "Connect relevant planner tasks, documents, equipment records, notes, or other evidence.",
          "Check that each evidence item clearly demonstrates the competency being claimed.",
        ],
      },
      {
        heading: "Track validation",
        steps: [
          "Use the calculated progress as a summary of completed source records, not as final approval.",
          "Submit complete evidence for mentor review when the competency is ready.",
          "Wait for mentor validation before treating a submitted competency as verified.",
          "Read statuses as: Not Started, In Progress, Submitted, and Verified.",
        ],
      },
    ],
    tips: [
      "Quality and relevance of evidence matter more than the number of attachments.",
      "Resolve mentor feedback before submitting the same competency again.",
    ],
  },
  {
    id: "equipment-library",
    title: "Equipment Library",
    readingTime: "8 min",
    description: "Catalog equipment details, checklists, photos, and related standards.",
    sections: [
      {
        heading: "Find and study equipment",
        steps: [
          "Open Equipment Library to access your technical equipment catalog.",
          "Search for transformers, switchgear, motors, or protection devices by name or keyword.",
          "Open an equipment record to review specifications, operating principles, and technical details.",
          "Use its checklist to track the inspection or learning points you have covered.",
        ],
      },
      {
        heading: "Record site learning",
        steps: [
          "Upload an appropriate equipment photo or add a field note when permitted by site rules.",
          "Link equipment records with supporting learning evidence and related standards.",
          "Update checklist progress after completing the relevant site activity.",
          "Use the library during site work as a reference, while continuing to follow operational and safety procedures.",
        ],
      },
    ],
    tips: [
      "Never upload restricted site photos or sensitive equipment information.",
      "Use precise equipment names and tags so records are easy to find later.",
    ],
  },
  {
    id: "generating-reports",
    title: "Generating Reports",
    readingTime: "4 min",
    description: "Create progress reports for mentors, assessors, and administrators.",
    sections: [
      {
        heading: "Prepare the report",
        steps: [
          "Open Reports and choose the reporting period or range of OJT weeks.",
          "Select the activity, planner, evidence, and competency data to include.",
          "Review the generated activity summary for missing or inaccurate records.",
          "Review linked evidence and competency progress before final generation.",
        ],
      },
      {
        heading: "Generate and share",
        steps: [
          "Generate the report after confirming the selected source data.",
          "Export or download the report when that option is available.",
          "Use the completed report for mentor, assessor, or administrator review.",
          "Return to the source module if report details need correction, then generate it again.",
        ],
      },
    ],
    tips: [
      "Complete and save source records before generating a report.",
      "Use a reporting range that matches the review period requested by your mentor.",
    ],
  },
  {
    id: "using-search",
    title: "Using Search",
    readingTime: "3 min",
    description: "Find records across modules using keywords, categories, and linked evidence.",
    sections: [
      {
        heading: "Search the workspace",
        steps: [
          "Open global search from the application header.",
          "Enter a keyword from the title, description, equipment name, or evidence record.",
          "Narrow results by category or module when filters are available.",
          "Open matching evidence, equipment, tasks, or planner records directly from the results.",
        ],
      },
      {
        heading: "Improve search results",
        steps: [
          "Use specific technical terms instead of broad words.",
          "Try an equipment tag, document title, week number, or task phrase.",
          "Check spelling and remove unnecessary words when no results appear.",
        ],
      },
    ],
    tips: [
      "A short, distinctive phrase usually produces better results than a full sentence.",
      "Add consistent titles and tags when creating records to make future searches easier.",
    ],
  },
  {
    id: "application-settings",
    title: "Application Settings",
    readingTime: "5 min",
    description: "Manage theme, language, profile, storage, backup, import, and export.",
    sections: [
      {
        heading: "Personalize the application",
        steps: [
          "Open Settings from the user menu.",
          "Change the visual theme and language when those options are available.",
          "Update your trainee profile and save the changes.",
          "Upload or replace your profile photo using a supported image format.",
        ],
      },
      {
        heading: "Manage data and account access",
        steps: [
          "Review storage usage before adding large files.",
          "Use backup, import, or export tools when available and verify the selected file before restoring.",
          "Log out from the user menu when using a shared device.",
          "Use Forgot Password on the login page when you need a secure password reset link.",
        ],
      },
    ],
    tips: [
      "Export a backup before performing a full application-data reset.",
      "Do not share password-reset links or exported personal workspace data.",
    ],
  },
]
