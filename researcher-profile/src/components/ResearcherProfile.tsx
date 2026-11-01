import type { ReactNode } from "react"
import { Link, useParams } from "react-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { Progress } from "@/components/ui/progress.tsx"
import { Separator } from "@/components/ui/separator.tsx"
import {
  copy,
  employmentLabel,
  memberStatusLabel,
  projectStatusLabel,
  teamStatusLabel,
} from "@/copy.ts"
import {
  formatProfileDate,
  getResearcherProfile,
  initials,
  leaderPath,
  parseResearcherId,
} from "@/data/profile.ts"
import type { ProfileLeader, ProfileProject } from "@/types/researcher.ts"

const textLinkClass =
  "w-fit rounded-sm text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 ease-out hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:text-muted-foreground motion-reduce:transition-none"

function ProfileSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-3">{children}</CardContent>
    </Card>
  )
}

function EmptyLine({ children }: { children: string }) {
  return <p className="text-muted-foreground">{children}</p>
}

function SecondaryBadges({ labels }: { labels: readonly string[] }) {
  return (
    <ul className="flex list-none flex-wrap gap-2 p-0">
      {labels.map((label) => (
        <li key={label}>
          <Badge variant="secondary">{label}</Badge>
        </li>
      ))}
    </ul>
  )
}

function LeaderName({ leader }: { leader: ProfileLeader }) {
  const path = leaderPath(leader)
  if (path === null) return <span>{leader.name}</span>
  return (
    <Link to={path} className={textLinkClass}>
      {leader.name}
    </Link>
  )
}

function ProjectAssignment({ project }: { project: ProfileProject }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium">{project.name}</p>
        <Badge variant="outline">{projectStatusLabel[project.status]}</Badge>
      </div>
      <p className="font-medium text-primary tabular-nums">
        {`${project.allocationPercentage}%`}
      </p>
      <Progress
        value={project.allocationPercentage}
        aria-label={project.name}
      />
    </div>
  )
}

export function ResearcherProfile() {
  const { id } = useParams()
  const researcherId = parseResearcherId(id)
  const profile =
    researcherId === null ? null : getResearcherProfile(researcherId)

  if (profile === null) {
    return (
      <main className="flex min-h-svh flex-col gap-6 px-6 py-8">
        <p>{copy.notFound}</p>
        <Link to="/" className={textLinkClass}>
          {copy.researchers}
        </Link>
      </main>
    )
  }

  const contract = profile.contract

  return (
    <main className="flex min-h-svh flex-col gap-6 px-6 py-8">
      <Link to="/" className={textLinkClass}>
        {copy.researchers}
      </Link>
      <header className="flex items-start gap-4">
        <Avatar size="lg">
          <AvatarFallback>{initials(profile.name)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">{profile.role}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {memberStatusLabel[profile.memberStatus]}
            </Badge>
            <Badge variant="outline">
              {employmentLabel[profile.employmentType]}
            </Badge>
          </div>
        </div>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,24rem)]">
        <div className="flex min-w-0 flex-col gap-6">
          <ProfileSection title={copy.skills}>
            <SecondaryBadges labels={profile.skills} />
          </ProfileSection>
          <ProfileSection title={copy.researchTopics}>
            <SecondaryBadges labels={profile.topics} />
          </ProfileSection>
          <ProfileSection title={copy.researchHistory}>
            <ul className="flex list-none flex-col gap-2 p-0">
              {profile.researchHistory.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </ProfileSection>
          <ProfileSection title={copy.projects}>
            {profile.projects.length === 0 ? (
              <EmptyLine>{copy.noProject}</EmptyLine>
            ) : (
              <ul className="flex list-none flex-col gap-4 p-0">
                {profile.projects.map((project) => (
                  <li key={project.id}>
                    <ProjectAssignment project={project} />
                  </li>
                ))}
              </ul>
            )}
          </ProfileSection>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <ProfileSection title={copy.team}>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{profile.team.name}</p>
              <Badge variant="outline">
                {teamStatusLabel[profile.team.status]}
              </Badge>
            </div>
            <p>{profile.team.description}</p>
            <SecondaryBadges labels={profile.team.topics} />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-muted-foreground">{copy.leader}</span>
              <LeaderName leader={profile.team.leader} />
            </div>
          </ProfileSection>
          <ProfileSection title={copy.colleagues}>
            {profile.colleagues.length === 0 ? (
              <EmptyLine>{copy.noColleagues}</EmptyLine>
            ) : (
              <ul className="flex list-none flex-col gap-3 p-0">
                {profile.colleagues.map((colleague) => (
                  <li
                    key={colleague.id}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
                  >
                    <Link
                      to={`/researchers/${colleague.id}`}
                      className={textLinkClass}
                    >
                      {colleague.name}
                    </Link>
                    <span className="text-muted-foreground">
                      {colleague.role}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </ProfileSection>
          <ProfileSection title={copy.contract}>
            {contract === null ? (
              <EmptyLine>{copy.noContract}</EmptyLine>
            ) : (
              <div className="flex flex-col gap-1">
                <p>{contract.type}</p>
                <p className="tabular-nums">
                  <time dateTime={contract.startDate}>
                    {formatProfileDate(contract.startDate)}
                  </time>
                  {" – "}
                  <time dateTime={contract.endDate}>
                    {formatProfileDate(contract.endDate)}
                  </time>
                </p>
              </div>
            )}
          </ProfileSection>
        </div>
      </div>
    </main>
  )
}
