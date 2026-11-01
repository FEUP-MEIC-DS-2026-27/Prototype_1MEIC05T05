import { expect, test } from "vitest"

import {
  formatProfileDate,
  getResearcherProfile,
  initials,
  leaderPath,
  listResearchers,
  parseResearcherId,
} from "./profile.ts"
import { copy, employmentLabel, memberStatusLabel } from "../copy.ts"

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
