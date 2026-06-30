"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, NotebookPen, ShieldCheck, Mail } from "lucide-react"

const helpCategories = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Learn how to organize knowledge, schedule, and competencies",
    color: "text-primary",
  },
  {
    icon: NotebookPen,
    title: "Journaling Tips",
    description: "How to write effective daily field observations",
    color: "text-info",
  },
  {
    icon: ShieldCheck,
    title: "Safety Resources",
    description: "Quick links to permit, isolation, and safety references",
    color: "text-warning",
  },
  { icon: Mail, title: "Contact Mentor", description: "Reach out to your field supervisor", color: "text-success" },
]

const faqs = [
  {
    question: "How do I add a knowledge entry?",
    answer: "Open the Knowledge Base and click 'New Entry' to capture a technical topic, tag it, and mark it as mastered when ready.",
  },
  {
    question: "Where do I record field observations?",
    answer: "Use the Field Journal to log daily site observations, lessons learned, and notes tied to each training week.",
  },
  {
    question: "How is my training progress tracked?",
    answer: "The Competencies page summarizes topics studied, field hours, and competency areas across the 18-week program.",
  },
  {
    question: "Can I plan my training sessions?",
    answer: "Yes — use the Schedule to plan site visits, toolbox talks, and mentor reviews throughout your OJT.",
  },
]

export function HelpContent() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search for help..." className="pl-10 h-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {helpCategories.map((category, index) => (
          <Card
            key={category.title}
            className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-secondary">
                <category.icon className={`w-6 h-6 ${category.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="p-4 rounded-lg border border-border hover:bg-secondary transition-all duration-300 animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <h4 className="font-medium mb-2">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
