import { useEffect, useState, type ReactNode } from "react"
import { Link, useParams } from "react-router-dom"

import { loadResearcherProfile } from "../api/researchers.ts"
import { PageNotFound } from "./PageNotFound.tsx"
import { StatusMessage } from "./StatusMessage.tsx"
import {
  copy,
  employmentLabel,
  memberStatusLabel,
  projectStatusLabel,
  teamStatusLabel,
} from "../copy.ts"
import {
  formatProfileDate,
  initials,
  leaderPath,
  parseResearcherId,
} from "../data/profile.ts"
import type {
  ProfileLeader,
  ProfileProject,
  ResearcherProfile,
} from "../types/researcher.ts"

function profileHref(basePath: string, id: number) {
  return `${basePath}/${id}`
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="card">
      <div className="card-header">{title}</div>
      {children}
    </section>
  )
}

function BadgeList({ labels }: { labels: readonly string[] }) {
  return (
    <ul className="list-unstyled d-flex flex-wrap gap-2 mb-0">
      {labels.map((label) => (
        <li key={label}>
          <span className="badge text-bg-secondary">{label}</span>
        </li>
      ))}
    </ul>
  )
}

function LeaderName({
  leader,
  basePath,
}: {
  leader: ProfileLeader
  basePath: string
}) {
  if (leaderPath(leader) === null) return <span>{leader.name}</span>
  return <Link to={profileHref(basePath, leader.id)}>{leader.name}</Link>
}

function ProjectRow({ project }: { project: ProfileProject }) {
  return (
    <tr>
      <td>{project.name}</td>
      <td>
        <span className="badge text-bg-light border">
          {projectStatusLabel[project.status]}
        </span>
      </td>
      <td>
        <div className="d-flex align-items-center gap-2">
          <div
            className="progress flex-grow-1"
            role="progressbar"
            aria-valuenow={project.allocationPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={project.name}
          >
            <div
              className="progress-bar"
              style={{ width: `${project.allocationPercentage}%` }}
            />
          </div>
          <span className="text-nowrap">{`${project.allocationPercentage}%`}</span>
        </div>
      </td>
    </tr>
  )
}

type ProfileLoad =
  | { status: "loading"; forId: number }
  | { status: "ready"; forId: number; profile: ResearcherProfile | null }
  | { status: "error"; forId: number; message: string }

function failureMessage(reason: unknown): string {
  if (reason instanceof Error && reason.message !== "") return reason.message
  return "Could not load the researcher profile."
}

export function ResearcherProfilePage({ basePath }: { basePath: string }) {
  const { id } = useParams()
  const researcherId = parseResearcherId(id)
  const [attempt, setAttempt] = useState(0)
  const [load, setLoad] = useState<ProfileLoad>({
    status: "loading",
    forId: -1,
  })

  useEffect(() => {
    if (researcherId === null) return
    let active = true
    setLoad({ status: "loading", forId: researcherId })
    loadResearcherProfile(researcherId).then(
      (profile) => {
        if (active) setLoad({ status: "ready", forId: researcherId, profile })
      },
      (reason: unknown) => {
        if (!active) return
        setLoad({
          status: "error",
          forId: researcherId,
          message: failureMessage(reason),
        })
      }
    )
    return () => {
      active = false
    }
  }, [researcherId, attempt])

  if (researcherId === null) return <PageNotFound basePath={basePath} />
  if (load.forId !== researcherId || load.status === "loading") {
    return <StatusMessage variant="loading" />
  }
  if (load.status === "error") {
    return (
      <StatusMessage
        variant="error"
        message={load.message}
        onRetry={() => setAttempt((current) => current + 1)}
      />
    )
  }
  if (load.profile === null) return <PageNotFound basePath={basePath} />

  const profile = load.profile
  const contract = profile.contract

  return (
    <div className="d-flex flex-column gap-3">
      <Link to={basePath || "/"}>{copy.researchers}</Link>
      <div className="card">
        <div className="card-body d-flex align-items-start gap-3">
          <span
            className="badge rounded-pill text-bg-secondary fs-6"
            aria-hidden="true"
          >
            {initials(profile.name)}
          </span>
          <div>
            <h1 className="h3 mb-1">{profile.name}</h1>
            <p className="text-body-secondary mb-2">{profile.role}</p>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge text-bg-primary">
                {memberStatusLabel[profile.memberStatus]}
              </span>
              <span className="badge text-bg-light border">
                {employmentLabel[profile.employmentType]}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-lg-8 d-flex flex-column gap-3">
          <SectionCard title={copy.skills}>
            <div className="card-body">
              <BadgeList labels={profile.skills} />
            </div>
          </SectionCard>
          <SectionCard title={copy.researchTopics}>
            <div className="card-body">
              <BadgeList labels={profile.topics} />
            </div>
          </SectionCard>
          <SectionCard title={copy.researchHistory}>
            <ul className="list-group list-group-flush">
              {profile.researchHistory.map((entry) => (
                <li key={entry} className="list-group-item">
                  {entry}
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title={copy.projects}>
            {profile.projects.length === 0 ? (
              <div className="card-body">
                <StatusMessage variant="empty" message={copy.noProject} />
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table mb-0 align-middle">
                  <thead>
                    <tr>
                      <th scope="col">{copy.name}</th>
                      <th scope="col">Status</th>
                      <th scope="col">Allocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.projects.map((project) => (
                      <ProjectRow key={project.id} project={project} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
        <div className="col-lg-4 d-flex flex-column gap-3">
          <SectionCard title={copy.team}>
            <div className="card-body d-flex flex-column gap-3">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <p className="fw-medium mb-0">{profile.team.name}</p>
                <span className="badge text-bg-light border">
                  {teamStatusLabel[profile.team.status]}
                </span>
              </div>
              <p className="mb-0">{profile.team.description}</p>
              <BadgeList labels={profile.team.topics} />
              <div>
                <span className="text-body-secondary me-2">{copy.leader}</span>
                <LeaderName leader={profile.team.leader} basePath={basePath} />
              </div>
            </div>
          </SectionCard>
          <SectionCard title={copy.colleagues}>
            {profile.colleagues.length === 0 ? (
              <div className="card-body">
                <StatusMessage variant="empty" message={copy.noColleagues} />
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {profile.colleagues.map((colleague) => (
                  <li
                    key={colleague.id}
                    className="list-group-item d-flex flex-wrap justify-content-between gap-2"
                  >
                    <Link to={profileHref(basePath, colleague.id)}>
                      {colleague.name}
                    </Link>
                    <span className="text-body-secondary">
                      {colleague.role}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
          <SectionCard title={copy.contract}>
            <div className="card-body">
              {contract === null ? (
                <StatusMessage variant="empty" message={copy.noContract} />
              ) : (
                <dl className="row mb-0">
                  <dt className="col-sm-4">Type</dt>
                  <dd className="col-sm-8">{contract.type}</dd>
                  <dt className="col-sm-4">Start</dt>
                  <dd className="col-sm-8">
                    <time dateTime={contract.startDate}>
                      {formatProfileDate(contract.startDate)}
                    </time>
                  </dd>
                  <dt className="col-sm-4">End</dt>
                  <dd className="col-sm-8 mb-0">
                    <time dateTime={contract.endDate}>
                      {formatProfileDate(contract.endDate)}
                    </time>
                  </dd>
                </dl>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
