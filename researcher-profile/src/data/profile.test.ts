import { expect, test } from "vitest"

import {
  completedProjectChoices,
  countResearchersWithCompletedProjects,
  emptyResultCopy,
  formatProfileDate,
  getResearcherProfile,
  initials,
  leaderPath,
  listResearchers,
  parseResearcherId,
  previousProjectNames,
  searchResearchers,
} from "./profile.ts"
import { copy, employmentLabel, memberStatusLabel } from "../copy.ts"
import type { PreviousFilter } from "../types/researcher.ts"

test("joins the three mock researchers", () => {
  expect(listResearchers().map((row) => row.id)).toEqual([1, 2, 3, 4])
  expect(listResearchers()[2]).toMatchObject({
    name: "Maria Ferreira",
    role: "Researcher",
    teamName: "Computer Vision Team",
    memberStatus: "former",
  })

  const ana = getResearcherProfile(1)
  expect(ana).toMatchObject({
    name: "Ana Silva",
    role: "Researcher",
    memberStatus: "active",
    employmentType: "employee",
    skills: ["Machine Learning", "Python"],
    topics: ["Artificial Intelligence", "Data Science"],
    researchHistory: ["Machine Learning for Healthcare", "Data Analytics"],
  })
  expect(ana?.team.leader).toMatchObject({
    id: 1,
    name: "Ana Silva",
    isSelf: true,
  })
  expect(ana?.team.topics).toEqual(["Artificial Intelligence", "Data Science"])
  expect(ana?.colleagues).toEqual([
    { id: 2, name: "João Costa", role: "PhD Researcher" },
  ])
  expect(ana?.contract).toEqual({
    type: "Employment Contract",
    startDate: "2024-01-01",
    endDate: "2027-12-31",
  })
  expect(ana?.projects).toEqual([
    { id: 1, name: "HumanISE", status: "active", allocationPercentage: 60 },
    { id: 2, name: "AI4Health", status: "active", allocationPercentage: 30 },
  ])

  const joao = getResearcherProfile(2)
  expect(joao?.team.leader).toMatchObject({
    id: 1,
    name: "Ana Silva",
    isSelf: false,
  })
  expect(joao?.colleagues).toEqual([
    { id: 1, name: "Ana Silva", role: "Researcher" },
  ])
  expect(joao?.projects).toEqual([
    { id: 1, name: "HumanISE", status: "active", allocationPercentage: 100 },
  ])
  expect(joao?.employmentType).toBe("scholarship")

  const maria = getResearcherProfile(3)
  expect(maria?.colleagues).toEqual([])
  expect(maria?.projects).toEqual([])
  expect(maria?.contract).toEqual({
    type: "Fixed-term Contract",
    startDate: "2023-01-01",
    endDate: "2025-12-31",
  })
  expect(maria?.memberStatus).toBe("former")
  expect(maria?.employmentType).toBe("contractor")
  expect(maria?.team.leader.isSelf).toBe(true)
  expect(maria?.team.topics).toEqual(["Computer Vision"])

  const rita = getResearcherProfile(4)
  expect(rita).toMatchObject({
    name: "Rita Oliveira",
    role: "Researcher",
    memberStatus: "active",
    employmentType: "employee",
    skills: ["Statistics"],
    topics: ["Data Science"],
    researchHistory: ["Statistical Modelling"],
  })
  expect(rita?.team).toMatchObject({
    id: 3,
    name: "Data Platform Team",
    description: "Research team focused on data platforms.",
    status: "active",
  })
  expect(rita?.team.leader).toMatchObject({
    id: 4,
    name: "Rita Oliveira",
    isSelf: true,
  })
  expect(rita?.team.topics).toEqual(["Data Science"])
  expect(rita?.colleagues).toEqual([])
  expect(rita?.contract).toEqual({
    type: "Employment Contract",
    startDate: "2024-03-01",
    endDate: "2026-12-31",
  })
  expect(rita?.projects).toEqual([
    { id: 3, name: "MedVis", status: "completed", allocationPercentage: 40 },
  ])

  expect(getResearcherProfile(9)).toBeNull()
})

test("parses only canonical SQL ids", () => {
  expect(parseResearcherId("1")).toBe(1)
  expect(parseResearcherId("9")).toBe(9)
  expect(parseResearcherId("abc")).toBeNull()
  expect(parseResearcherId("1.5")).toBeNull()
  expect(parseResearcherId("01")).toBeNull()
  expect(parseResearcherId(undefined)).toBeNull()
})

test("formats calendar dates in en-GB", () => {
  expect(formatProfileDate("2024-01-01")).toBe("1 Jan 2024")
  expect(formatProfileDate("2027-12-31")).toBe("31 Dec 2027")
})

test("leader path skips the person on the page", () => {
  const ana = getResearcherProfile(1)
  const joao = getResearcherProfile(2)
  expect(leaderPath(ana!.team.leader)).toBeNull()
  expect(leaderPath(joao!.team.leader)).toBe("/researchers/1")
})

test("initials use the first and last token", () => {
  expect(initials("Ana Silva")).toBe("AS")
  expect(initials("João Costa")).toBe("JC")
})

test("empty copy matches the spec", () => {
  expect(copy.noProject).toBe("No project assignment")
  expect(copy.noColleagues).toBe("No other members on this team")
  expect(copy.noContract).toBe("No contract on file")
  expect(copy.notFound).toBe("Researcher not found")
  expect(memberStatusLabel.former).toBe("Former")
  expect(employmentLabel.scholarship).toBe("Scholarship")
})

test("search copy matches the spec", () => {
  expect(copy.search).toBe("Search")
  expect(copy.searchPlaceholder).toBe("Name, topic, skill, or expertise")
  expect(copy.previousProjects).toBe("Previous projects")
  expect(copy.allResearchers).toBe("All researchers")
  expect(copy.anyCompletedProject).toBe("Any completed project")
  expect(copy.noMatch).toBe("No researcher matches.")
  expect(copy.noCompletedProject).toBe("No researcher has a completed project.")
  expect(copy.previousProject).toBe("Previous project")
})

test("searches the directory from the spec table", () => {
  const ids = (query: string, previous: PreviousFilter) =>
    searchResearchers({ query, previous }).map((hit) => hit.id)

  expect(ids("", "all")).toEqual([1, 2, 3, 4])
  expect(
    searchResearchers({ query: "", previous: "all" }).every(
      (hit) => hit.reasons.length === 0
    )
  ).toBe(true)

  const python = searchResearchers({ query: "Python", previous: "all" })
  expect(python.map((hit) => hit.id)).toEqual([1, 2])
  expect(python[0].reasons).toEqual([
    { field: "skill", label: copy.skills, values: ["Python"] },
  ])
  expect(python[1].reasons).toEqual([
    { field: "skill", label: copy.skills, values: ["Python"] },
  ])

  expect(
    searchResearchers({ query: "Healthcare", previous: "all" })
  ).toMatchObject([
    {
      id: 1,
      reasons: [
        {
          field: "history",
          label: copy.researchHistory,
          values: ["Machine Learning for Healthcare"],
        },
      ],
    },
  ])

  expect(
    searchResearchers({ query: "Data Science", previous: "all" }).map((hit) => [
      hit.id,
      hit.reasons,
    ])
  ).toEqual([
    [
      1,
      [
        {
          field: "topic",
          label: copy.researchTopics,
          values: ["Data Science"],
        },
      ],
    ],
    [
      4,
      [
        {
          field: "topic",
          label: copy.researchTopics,
          values: ["Data Science"],
        },
      ],
    ],
  ])

  expect(
    searchResearchers({ query: "Data", previous: "all" }).map((hit) => [
      hit.id,
      hit.reasons,
    ])
  ).toEqual([
    [
      1,
      [
        {
          field: "topic",
          label: copy.researchTopics,
          values: ["Data Science"],
        },
        {
          field: "history",
          label: copy.researchHistory,
          values: ["Data Analytics"],
        },
      ],
    ],
    [
      4,
      [
        {
          field: "topic",
          label: copy.researchTopics,
          values: ["Data Science"],
        },
      ],
    ],
  ])

  expect(
    searchResearchers({ query: "Computer Vision", previous: "all" })
  ).toMatchObject([
    {
      id: 3,
      reasons: [
        {
          field: "topic",
          label: copy.researchTopics,
          values: ["Computer Vision"],
        },
        { field: "skill", label: copy.skills, values: ["Computer Vision"] },
        {
          field: "history",
          label: copy.researchHistory,
          values: ["Computer Vision"],
        },
      ],
    },
  ])

  const joao = searchResearchers({ query: "joão", previous: "all" })
  expect(joao.map((hit) => hit.id)).toEqual([2])
  expect(joao[0].reasons).toEqual([])

  expect(ids("joao", "all")).toEqual([])
  expect(ids("HumanISE", "all")).toEqual([])
  expect(ids("MedVis", "all")).toEqual([])
  expect(ids("", 99)).toEqual([])

  expect(searchResearchers({ query: "", previous: "any" })).toMatchObject([
    {
      id: 4,
      reasons: [
        {
          field: "previousProject",
          label: copy.previousProject,
          values: ["MedVis"],
        },
      ],
    },
  ])
  expect(searchResearchers({ query: "", previous: 3 })).toMatchObject([
    {
      id: 4,
      reasons: [
        {
          field: "previousProject",
          label: copy.previousProject,
          values: ["MedVis"],
        },
      ],
    },
  ])
  expect(ids("", 4)).toEqual([])
  expect(ids("Python", "any")).toEqual([])

  expect(searchResearchers({ query: "Statistics", previous: 3 })).toMatchObject(
    [
      {
        id: 4,
        reasons: [
          { field: "skill", label: copy.skills, values: ["Statistics"] },
          {
            field: "previousProject",
            label: copy.previousProject,
            values: ["MedVis"],
          },
        ],
      },
    ]
  )
})

test("normalizes case and surrounding space", () => {
  expect(
    searchResearchers({ query: "python", previous: "all" }).map((hit) => hit.id)
  ).toEqual([1, 2])
  expect(
    searchResearchers({ query: "  Python  ", previous: "all" }).map(
      (hit) => hit.id
    )
  ).toEqual([1, 2])
})

test("treats a whitespace query as no query", () => {
  const hits = searchResearchers({ query: "   ", previous: "all" })
  expect(hits.map((hit) => hit.id)).toEqual([1, 2, 3, 4])
  expect(hits.every((hit) => hit.reasons.length === 0)).toBe(true)
})

test("ignores role, team, and internal extra spaces", () => {
  expect(searchResearchers({ query: "PhD", previous: "all" })).toEqual([])
  expect(searchResearchers({ query: "Team", previous: "all" })).toEqual([])
  expect(
    searchResearchers({ query: "Machine  Learning", previous: "all" })
  ).toEqual([])
})

test("orders every matched field", () => {
  expect(
    searchResearchers({ query: "Machine", previous: "all" })
  ).toMatchObject([
    {
      id: 1,
      reasons: [
        { field: "skill", label: copy.skills, values: ["Machine Learning"] },
        {
          field: "history",
          label: copy.researchHistory,
          values: ["Machine Learning for Healthcare"],
        },
      ],
    },
  ])
})

test("previous project names drop active work", () => {
  expect(
    previousProjectNames([
      { id: 1, name: "HumanISE", status: "active" },
      { id: 4, name: "Coastal Survey", status: "completed" },
      { id: 3, name: "MedVis", status: "completed" },
    ])
  ).toEqual(["MedVis", "Coastal Survey"])
})

test("lists completed projects and counts assignees", () => {
  expect(completedProjectChoices()).toEqual([
    { id: 3, name: "MedVis" },
    { id: 4, name: "Coastal Survey" },
  ])
  expect(countResearchersWithCompletedProjects()).toBe(1)
})

test("picks the empty sentence", () => {
  expect(
    emptyResultCopy({
      query: "",
      previous: "any",
      matchCount: 0,
      completedAssignmentCount: 0,
    })
  ).toBe(copy.noCompletedProject)
  expect(
    emptyResultCopy({
      query: "  ",
      previous: "any",
      matchCount: 0,
      completedAssignmentCount: 0,
    })
  ).toBe(copy.noCompletedProject)
  expect(
    emptyResultCopy({
      query: "",
      previous: "all",
      matchCount: 0,
      completedAssignmentCount: 0,
    })
  ).toBe(copy.noMatch)
  expect(
    emptyResultCopy({
      query: "Python",
      previous: "any",
      matchCount: 0,
      completedAssignmentCount: 1,
    })
  ).toBe(copy.noMatch)
  expect(
    emptyResultCopy({
      query: "",
      previous: "any",
      matchCount: 1,
      completedAssignmentCount: 0,
    })
  ).toBeNull()
})
