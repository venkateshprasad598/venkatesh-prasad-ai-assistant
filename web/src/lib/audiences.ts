import { Briefcase, Heart, type LucideIcon } from "lucide-react";

export type AudienceId = "recruiter" | "friend";

export interface Audience {
  id: AudienceId;
  icon: LucideIcon;
  title: string;
  description: string;
  highlights: string[];
  chatLabel: string;
  greeting: string;
  suggestions: string[];
}

export const AUDIENCES: Record<AudienceId, Audience> = {
  recruiter: {
    id: "recruiter",
    icon: Briefcase,
    title: "I'm a Recruiter",
    description: "Experience, skills, projects and how to reach out.",
    highlights: ["Work history", "Tech stack", "Impact"],
    chatLabel: "Recruiter",
    greeting:
      "Hi! I'm Venkatesh's AI assistant. Ask me about his experience, skills, projects, or how to get in touch.",
    suggestions: [
      "Summarize his experience",
      "What are his key skills?",
      "Tell me about Niyo Aero",
      "What did he build at Keenai?",
      "How can I contact him?",
    ],
  },
  friend: {
    id: "friend",
    icon: Heart,
    title: "Friend or Family",
    description: "His story, roots, education and the person behind the code.",
    highlights: ["His story", "Education", "Family"],
    chatLabel: "Friends & family",
    greeting:
      "Hey! I'm Venkatesh's AI assistant. Ask me about his story, where he's from, where he studied, or what he's up to these days.",
    suggestions: [
      "Where is he from?",
      "Tell me about his family",
      "Where did he study?",
      "What does he do for work?",
      "What's his Instagram?",
    ],
  },
};
