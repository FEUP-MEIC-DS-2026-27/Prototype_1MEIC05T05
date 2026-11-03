import { expect, test } from 'vitest'

import {
  completedProjectChoices,
  countResearchersWithCompletedProjects,
  facetCatalog,
  getResearcherProfile,
  listResearchers,
  previousProjectNames,
  searchResearchers,
  searchSuggestions,
} from './profile'
import {
  copy,
  emptyResultCopy,
  employmentLabel,
  facetWindow,
  formatProfileDate,
  initials,
  leaderPath,
  memberStatusLabel,
  parseResearcherId,
  resultSummary,
  type FacetFilters,
  type PreviousFilter,
} from '../shared'

test('joins the three mock researchers', () => {
  expect(listResearchers().map((row) => row.id)).toEqual([1, 2, 3, 4])
  expect(listResearchers()[2]).toMatchObject({
    name: 'Maria Ferreira',
    role: 'Researcher',
    teamName: 'Computer Vision Team',
    memberStatus: 'former',
  })

  const ana = getResearcherProfile(1)
  expect(ana).toMatchObject({
    name: 'Ana Silva',
    role: 'Researcher',
    memberStatus: 'active',
    employmentType: 'employee',
    skills: ['Machine Learning', 'Python'],
    topics: ['Artificial Intelligence', 'Data Science'],
    researchHistory: ['Machine Learning for Healthcare', 'Data Analytics'],
  })
  expect(ana?.team.leader).toMatchObject({
    id: 1,
    name: 'Ana Silva',
    isSelf: true,
  })
  expect(ana?.team.topics).toEqual(['Artificial Intelligence', 'Data Science'])
  expect(ana?.colleagues).toEqual([{ id: 2, name: 'João Costa', role: 'PhD Researcher' }])
  expect(ana?.contract).toEqual({
    type: 'Employment Contract',
    startDate: '2024-01-01',
    endDate: '2027-12-31',
  })
  expect(ana?.projects).toEqual([
    { id: 1, name: 'HumanISE', status: 'active', allocationPercentage: 60 },
    { id: 2, name: 'AI4Health', status: 'active', allocationPercentage: 30 },
  ])

  const joao = getResearcherProfile(2)
  expect(joao?.team.leader).toMatchObject({
    id: 1,
    name: 'Ana Silva',
    isSelf: false,
  })
  expect(joao?.colleagues).toEqual([{ id: 1, name: 'Ana Silva', role: 'Researcher' }])
  expect(joao?.projects).toEqual([{ id: 1, name: 'HumanISE', status: 'active', allocationPercentage: 100 }])
  expect(joao?.employmentType).toBe('scholarship')

  const maria = getResearcherProfile(3)
  expect(maria?.colleagues).toEqual([])
  expect(maria?.projects).toEqual([])
  expect(maria?.contract).toEqual({
    type: 'Fixed-term Contract',
    startDate: '2023-01-01',
    endDate: '2025-12-31',
  })
  expect(maria?.memberStatus).toBe('former')
  expect(maria?.employmentType).toBe('contractor')
  expect(maria?.team.leader.isSelf).toBe(true)
  expect(maria?.team.topics).toEqual(['Computer Vision'])

  const rita = getResearcherProfile(4)
  expect(rita).toMatchObject({
    name: 'Rita Oliveira',
    role: 'Researcher',
    memberStatus: 'active',
    employmentType: 'employee',
    skills: ['Statistics'],
    topics: ['Data Science'],
    researchHistory: ['Statistical Modelling'],
  })
  expect(rita?.team).toMatchObject({
    id: 3,
    name: 'Data Platform Team',
    description: 'Research team focused on data platforms.',
    status: 'active',
  })
  expect(rita?.team.leader).toMatchObject({
    id: 4,
    name: 'Rita Oliveira',
    isSelf: true,
  })
  expect(rita?.team.topics).toEqual(['Data Science'])
  expect(rita?.colleagues).toEqual([])
  expect(rita?.contract).toEqual({
    type: 'Employment Contract',
    startDate: '2024-03-01',
    endDate: '2026-12-31',
  })
  expect(rita?.projects).toEqual([{ id: 3, name: 'MedVis', status: 'completed', allocationPercentage: 40 }])

  expect(getResearcherProfile(9)).toBeNull()
})

test('parses only canonical SQL ids', () => {
  expect(parseResearcherId('1')).toBe(1)
  expect(parseResearcherId('9')).toBe(9)
  expect(parseResearcherId('abc')).toBeNull()
  expect(parseResearcherId('1.5')).toBeNull()
  expect(parseResearcherId('01')).toBeNull()
  expect(parseResearcherId(undefined)).toBeNull()
})

test('formats calendar dates in en-GB', () => {
  expect(formatProfileDate('2024-01-01')).toBe('1 Jan 2024')
  expect(formatProfileDate('2027-12-31')).toBe('31 Dec 2027')
})

test('leader path skips the person on the page', () => {
  const ana = getResearcherProfile(1)
  const joao = getResearcherProfile(2)
  expect(leaderPath(ana!.team.leader)).toBeNull()
  expect(leaderPath(joao!.team.leader)).toBe('/researchers/1')
})

test('initials use the first and last token', () => {
  expect(initials('Ana Silva')).toBe('AS')
  expect(initials('João Costa')).toBe('JC')
})

test('empty copy matches the spec', () => {
  expect(copy.noProject).toBe('No project assignment')
  expect(copy.noColleagues).toBe('No other members on this team')
  expect(copy.noContract).toBe('No contract on file')
  expect(copy.notFound).toBe('Researcher not found')
  expect(memberStatusLabel.former).toBe('Former')
  expect(employmentLabel.scholarship).toBe('Scholarship')
})

test('search copy matches the spec', () => {
  expect(copy.search).toBe('Search')
  expect(copy.searchPlaceholder).toBe('Name, topic, skill, or expertise')
  expect(copy.previousProjects).toBe('Previous projects')
  expect(copy.allResearchers).toBe('All researchers')
  expect(copy.anyCompletedProject).toBe('Any completed project')
  expect(copy.noMatch).toBe('No researcher matches.')
  expect(copy.noCompletedProject).toBe('No researcher has a completed project.')
  expect(copy.previousProject).toBe('Previous project')
})

test('searches the directory from the spec table', () => {
  const ids = (query: string, previous: PreviousFilter) => searchResearchers({ query, previous }).map((hit) => hit.id)

  expect(ids('', 'all')).toEqual([1, 2, 3, 4])
  expect(searchResearchers({ query: '', previous: 'all' }).every((hit) => hit.reasons.length === 0)).toBe(true)

  const python = searchResearchers({ query: 'Python', previous: 'all' })
  expect(python.map((hit) => hit.id)).toEqual([1, 2])
  expect(python[0].reasons).toEqual([{ field: 'skill', label: copy.skills, values: ['Python'] }])
  expect(python[1].reasons).toEqual([{ field: 'skill', label: copy.skills, values: ['Python'] }])

  expect(searchResearchers({ query: 'Healthcare', previous: 'all' })).toMatchObject([
    {
      id: 1,
      reasons: [
        {
          field: 'history',
          label: copy.researchHistory,
          values: ['Machine Learning for Healthcare'],
        },
      ],
    },
  ])

  expect(searchResearchers({ query: 'Data Science', previous: 'all' }).map((hit) => [hit.id, hit.reasons])).toEqual([
    [
      1,
      [
        {
          field: 'topic',
          label: copy.researchTopics,
          values: ['Data Science'],
        },
      ],
    ],
    [
      4,
      [
        {
          field: 'topic',
          label: copy.researchTopics,
          values: ['Data Science'],
        },
      ],
    ],
  ])

  expect(searchResearchers({ query: 'Data', previous: 'all' }).map((hit) => [hit.id, hit.reasons])).toEqual([
    [
      1,
      [
        {
          field: 'topic',
          label: copy.researchTopics,
          values: ['Data Science'],
        },
        {
          field: 'history',
          label: copy.researchHistory,
          values: ['Data Analytics'],
        },
      ],
    ],
    [
      4,
      [
        {
          field: 'topic',
          label: copy.researchTopics,
          values: ['Data Science'],
        },
      ],
    ],
  ])

  expect(searchResearchers({ query: 'Computer Vision', previous: 'all' })).toMatchObject([
    {
      id: 3,
      reasons: [
        {
          field: 'topic',
          label: copy.researchTopics,
          values: ['Computer Vision'],
        },
        { field: 'skill', label: copy.skills, values: ['Computer Vision'] },
        {
          field: 'history',
          label: copy.researchHistory,
          values: ['Computer Vision'],
        },
      ],
    },
  ])

  const joao = searchResearchers({ query: 'joão', previous: 'all' })
  expect(joao.map((hit) => hit.id)).toEqual([2])
  expect(joao[0].reasons).toEqual([])

  expect(ids('joao', 'all')).toEqual([])
  expect(ids('HumanISE', 'all')).toEqual([])
  expect(ids('MedVis', 'all')).toEqual([])
  expect(ids('', 99)).toEqual([])

  expect(searchResearchers({ query: '', previous: 'any' })).toMatchObject([
    {
      id: 4,
      reasons: [
        {
          field: 'previousProject',
          label: copy.previousProject,
          values: ['MedVis'],
        },
      ],
    },
  ])
  expect(searchResearchers({ query: '', previous: 3 })).toMatchObject([
    {
      id: 4,
      reasons: [
        {
          field: 'previousProject',
          label: copy.previousProject,
          values: ['MedVis'],
        },
      ],
    },
  ])
  expect(ids('', 4)).toEqual([])
  expect(ids('Python', 'any')).toEqual([])

  expect(searchResearchers({ query: 'Statistics', previous: 3 })).toMatchObject([
    {
      id: 4,
      reasons: [
        { field: 'skill', label: copy.skills, values: ['Statistics'] },
        {
          field: 'previousProject',
          label: copy.previousProject,
          values: ['MedVis'],
        },
      ],
    },
  ])
})

test('normalizes case and surrounding space', () => {
  expect(searchResearchers({ query: 'python', previous: 'all' }).map((hit) => hit.id)).toEqual([1, 2])
  expect(searchResearchers({ query: '  Python  ', previous: 'all' }).map((hit) => hit.id)).toEqual([1, 2])
})

test('treats a whitespace query as no query', () => {
  const hits = searchResearchers({ query: '   ', previous: 'all' })
  expect(hits.map((hit) => hit.id)).toEqual([1, 2, 3, 4])
  expect(hits.every((hit) => hit.reasons.length === 0)).toBe(true)
})

test('ignores role, team, and internal extra spaces', () => {
  expect(searchResearchers({ query: 'PhD', previous: 'all' })).toEqual([])
  expect(searchResearchers({ query: 'Team', previous: 'all' })).toEqual([])
  expect(searchResearchers({ query: 'Machine  Learning', previous: 'all' })).toEqual([])
})

test('orders every matched field', () => {
  expect(searchResearchers({ query: 'Machine', previous: 'all' })).toMatchObject([
    {
      id: 1,
      reasons: [
        { field: 'skill', label: copy.skills, values: ['Machine Learning'] },
        {
          field: 'history',
          label: copy.researchHistory,
          values: ['Machine Learning for Healthcare'],
        },
      ],
    },
  ])
})

test('previous project names drop active work', () => {
  expect(
    previousProjectNames([
      { id: 1, name: 'HumanISE', status: 'active' },
      { id: 4, name: 'Coastal Survey', status: 'completed' },
      { id: 3, name: 'MedVis', status: 'completed' },
    ]),
  ).toEqual(['MedVis', 'Coastal Survey'])
})

test('lists completed projects and counts assignees', () => {
  expect(completedProjectChoices()).toEqual([
    { id: 3, name: 'MedVis' },
    { id: 4, name: 'Coastal Survey' },
  ])
  expect(countResearchersWithCompletedProjects()).toBe(1)
})

test('picks the empty sentence', () => {
  expect(
    emptyResultCopy({
      query: '',
      previous: 'any',
      matchCount: 0,
      completedAssignmentCount: 0,
    }),
  ).toBe(copy.noCompletedProject)
  expect(
    emptyResultCopy({
      query: '  ',
      previous: 'any',
      matchCount: 0,
      completedAssignmentCount: 0,
    }),
  ).toBe(copy.noCompletedProject)
  expect(
    emptyResultCopy({
      query: '',
      previous: 'all',
      matchCount: 0,
      completedAssignmentCount: 0,
    }),
  ).toBe(copy.noMatch)
  expect(
    emptyResultCopy({
      query: 'Python',
      previous: 'any',
      matchCount: 0,
      completedAssignmentCount: 1,
    }),
  ).toBe(copy.noMatch)
  expect(
    emptyResultCopy({
      query: '',
      previous: 'any',
      matchCount: 1,
      completedAssignmentCount: 0,
    }),
  ).toBeNull()
})

test('search discovery copy matches the addendum', () => {
  expect(copy.suggestions).toBe('Suggestions')
  expect(copy.recoveryHint).toBe(
    'Search matches a name, topic, skill, or line of expertise. It does not match project names.',
  )
  expect(copy.removeSearch).toBe('Remove search')
  expect(copy.removePrevious).toBe('Remove previous project')
})

test('suggests stored phrases that contain the query', () => {
  expect(searchSuggestions('py')).toEqual([{ field: 'skill', label: 'Python' }])
  expect(searchSuggestions('data')).toEqual([
    { field: 'topic', label: 'Data Science' },
    { field: 'history', label: 'Data Analytics' },
  ])
  expect(searchSuggestions('joão')).toEqual([{ field: 'name', label: 'João Costa' }])
})

test('keeps the same phrase in each field it belongs to', () => {
  expect(searchSuggestions('Computer Vision')).toEqual([
    { field: 'topic', label: 'Computer Vision' },
    { field: 'skill', label: 'Computer Vision' },
    { field: 'history', label: 'Computer Vision' },
  ])
})

test('caps suggestions at eight', () => {
  expect(searchSuggestions('a')).toEqual([
    { field: 'name', label: 'Ana Silva' },
    { field: 'name', label: 'João Costa' },
    { field: 'name', label: 'Maria Ferreira' },
    { field: 'name', label: 'Rita Oliveira' },
    { field: 'topic', label: 'Artificial Intelligence' },
    { field: 'topic', label: 'Data Science' },
    { field: 'skill', label: 'Machine Learning' },
    { field: 'skill', label: 'Statistics' },
  ])
})

test('suggests a completed project and ignores an active one', () => {
  expect(searchSuggestions('MedVis')).toEqual([{ field: 'previousProject', label: 'MedVis' }])
  expect(searchSuggestions('HumanISE')).toEqual([])
})

test('folds suggestions without dropping accents', () => {
  expect(searchSuggestions('joao')).toEqual([])
  expect(searchSuggestions('  Python  ')).toEqual([{ field: 'skill', label: 'Python' }])
})

test('treats a whitespace query as no suggestions', () => {
  expect(searchSuggestions('   ')).toEqual([])
})

const noFacets: FacetFilters = {
  topics: [],
  skills: [],
  history: [],
  completed: 'all',
}

test('facets match any value in a group and every group at once', () => {
  const ids = (facets: FacetFilters) => searchResearchers({ query: '', previous: 'all', facets }).map((hit) => hit.id)

  expect(ids({ ...noFacets, skills: ['Python', 'Statistics'] })).toEqual([1, 2, 4])
  expect(ids({ ...noFacets, topics: ['Data Science'], skills: ['Statistics'] })).toEqual([4])
  expect(ids({ ...noFacets, skills: ['Python'], completed: 'any' })).toEqual([])
  expect(ids({ ...noFacets, completed: [3, 4] })).toEqual([4])
  expect(searchResearchers({ query: 'martelo', previous: 'all', facets: noFacets })).toEqual([])
})

test('a selected facet is a reason when the query is blank', () => {
  expect(
    searchResearchers({
      query: '',
      previous: 'all',
      facets: { ...noFacets, topics: ['Data Science'] },
    }),
  ).toMatchObject([
    {
      id: 1,
      reasons: [{ field: 'topic', label: copy.researchTopics, values: ['Data Science'] }],
    },
    {
      id: 4,
      reasons: [{ field: 'topic', label: copy.researchTopics, values: ['Data Science'] }],
    },
  ])
})

test('facet counts ignore the same group and keep the others', () => {
  const catalog = facetCatalog({
    query: '',
    facets: { ...noFacets, skills: ['Python'] },
  })

  expect(catalog.skills.find((item) => item.label === 'Python')?.count).toBe(2)
  expect(catalog.skills.find((item) => item.label === 'Statistics')?.count).toBe(1)
  expect(catalog.topics.find((item) => item.label === 'Data Science')?.count).toBe(1)
  expect(catalog.anyCompleted.count).toBe(0)
  expect(catalog.projects.find((item) => item.label === 'MedVis')?.count).toBe(0)
  expect(catalog.projects.map((item) => item.label)).toEqual(['MedVis', 'Coastal Survey'])
})

test('facet window keeps common values first and a selected value in view', () => {
  const choices = [
    { value: 'rare', label: 'Rare', count: 1 },
    { value: 'common', label: 'Common', count: 4 },
    { value: 'med', label: 'MedVis', count: 2 },
    { value: 'other', label: 'Other', count: 1 },
    { value: 'zeta', label: 'Zeta', count: 1 },
    { value: 'alpha', label: 'Alpha', count: 1 },
  ]

  expect(facetWindow(choices, { query: '', limit: 5, selected: [] }).visible.map((item) => item.label)).toEqual([
    'Common',
    'MedVis',
    'Alpha',
    'Other',
    'Rare',
  ])

  const kept = facetWindow(choices, {
    query: '',
    limit: 5,
    selected: ['zeta'],
  })
  expect(kept.visible.map((item) => item.value)).toContain('zeta')
  expect(kept.remaining).toBe(0)

  expect(facetWindow(choices, { query: 'med', limit: 5, selected: [] }).visible.map((item) => item.label)).toEqual([
    'MedVis',
  ])
})

test('counts the visible rows', () => {
  expect(resultSummary(2, 4)).toBe('2 of 4 researchers')
  expect(resultSummary(4, 4)).toBe('4 of 4 researchers')
  expect(resultSummary(0, 4)).toBe('0 of 4 researchers')
})
