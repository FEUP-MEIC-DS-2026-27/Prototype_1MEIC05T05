import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpenIcon,
  BriefcaseIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

export interface Publication {
  id: string
  title: string
  year: number
  venue: string
  citations: number
}

export interface ResearchProject {
  id: string
  title: string
  period: string
  status: "active" | "completed" | "paused"
  description: string
}

export interface ResearcherData {
  id: string
  name: string
  avatarUrl?: string
  role: string
  team: string
  institution: string
  location: string
  email: string
  bio: string
  skills: string[]
  researchTopics: string[]
  publications: Publication[]
  projects: ResearchProject[]
}

// ---------------------------------------------------------------------------
// Default mock data (swap out via props for real API data)
// ---------------------------------------------------------------------------

const DEFAULT_RESEARCHER: ResearcherData = {
  id: "1",
  name: "Dr. Ana Ferreira",
  avatarUrl: "",
  role: "Senior Researcher",
  team: "Human–Computer Interaction Lab",
  institution: "FEUP – Universidade do Porto",
  location: "Porto, Portugal",
  email: "ana.ferreira@fe.up.pt",
  bio:
    "Ana is a senior researcher specialising in human–computer interaction and accessible design. She has led multiple EU-funded projects and published extensively in CHI and UIST. Her current focus is on AI-driven adaptive interfaces for people with motor disabilities.",
  skills: ["HCI", "Accessible Design", "User Research", "Prototyping", "AI/ML", "React"],
  researchTopics: [
    "Adaptive Interfaces",
    "Accessibility",
    "AI-assisted UX",
    "Inclusive Design",
    "Eye Tracking",
  ],
  publications: [
    {
      id: "p1",
      title: "Adaptive Cursor Assistance for Motor-Impaired Users",
      year: 2024,
      venue: "CHI 2024",
      citations: 12,
    },
    {
      id: "p2",
      title: "Eye-Gaze Interaction on Low-Cost Hardware",
      year: 2023,
      venue: "UIST 2023",
      citations: 34,
    },
    {
      id: "p3",
      title: "Inclusive Prototyping with Generative AI",
      year: 2022,
      venue: "ACM ASSETS 2022",
      citations: 57,
    },
  ],
  projects: [
    {
      id: "r1",
      title: "AccessAI – EU Horizon 2024",
      period: "2024 – present",
      status: "active",
      description:
        "Developing AI-driven assistive technologies for users with physical disabilities across four European institutions.",
    },
    {
      id: "r2",
      title: "GazeTech – FCT Project",
      period: "2021 – 2023",
      status: "completed",
      description:
        "Low-cost eye-gaze interfaces for AAC (Augmentative and Alternative Communication) devices.",
    },
  ],
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ResearchProject["status"] }) {
  const variantMap: Record<
    ResearchProject["status"],
    "default" | "secondary" | "outline"
  > = {
    active: "default",
    completed: "secondary",
    paused: "outline",
  }
  return <Badge variant={variantMap[status]}>{status}</Badge>
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface ResearcherProfileProps {
  /** Pass custom data to override the built-in mock researcher. */
  researcher?: ResearcherData
  /** Extra class names on the outermost element. */
  className?: string
}

/**
 * ResearcherProfile — User Story #73
 *
 * Displays a researcher's profile including their skills, role, team,
 * research topics and research history. Designed as a self-contained
 * component so it can be dropped into any page or composed with other
 * user-story prototypes.
 *
 * Usage:
 *   <ResearcherProfile />                          // uses built-in mock data
 *   <ResearcherProfile researcher={myResearcher} /> // custom data
 */
export function ResearcherProfile({
  researcher = DEFAULT_RESEARCHER,
  className,
}: ResearcherProfileProps) {
  const initials = researcher.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={`flex flex-col gap-6 ${className ?? ""}`}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start">
          <Avatar size="lg" className="size-20 text-xl">
            {researcher.avatarUrl && (
              <AvatarImage src={researcher.avatarUrl} alt={researcher.name} />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col gap-2">
            <div>
              <h1 className="text-2xl font-semibold">{researcher.name}</h1>
              <p className="text-muted-foreground">{researcher.role}</p>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <UsersIcon className="size-4" />
                {researcher.team}
              </span>
              <span className="flex items-center gap-1">
                <BriefcaseIcon className="size-4" />
                {researcher.institution}
              </span>
              <span className="flex items-center gap-1">
                <MapPinIcon className="size-4" />
                {researcher.location}
              </span>
              <a
                href={`mailto:${researcher.email}`}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <MailIcon className="size-4" />
                {researcher.email}
              </a>
            </div>

            <p className="text-sm leading-relaxed">{researcher.bio}</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Skills & Topics ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {researcher.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Research Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {researcher.researchTopics.map((topic) => (
                <Badge key={topic} variant="outline">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Research History Tabs ──────────────────────────────────── */}
      <Tabs defaultValue="publications">
        <TabsList>
          <TabsTrigger value="publications">
            <BookOpenIcon data-icon="inline-start" />
            Publications
          </TabsTrigger>
          <TabsTrigger value="projects">
            <ClockIcon data-icon="inline-start" />
            Projects
          </TabsTrigger>
        </TabsList>

        {/* Publications */}
        <TabsContent value="publications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publications</CardTitle>
              <CardDescription>
                {researcher.publications.length} publication
                {researcher.publications.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-0">
              {researcher.publications.map((pub, i) => (
                <div key={pub.id}>
                  {i > 0 && <Separator className="my-4" />}
                  <div className="flex flex-col gap-1">
                    <p className="font-medium leading-snug">{pub.title}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                      <span>{pub.venue}</span>
                      <span>{pub.year}</span>
                      <span>{pub.citations} citations</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Research Projects</CardTitle>
              <CardDescription>
                {researcher.projects.length} project
                {researcher.projects.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-0">
              {researcher.projects.map((project, i) => (
                <div key={project.id}>
                  {i > 0 && <Separator className="my-4" />}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium leading-snug">{project.title}</p>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{project.period}</p>
                    <p className="text-sm leading-relaxed">{project.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ResearcherProfile

