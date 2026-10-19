export const ROLES = [
  {
    id: "researcher",
    label: "HumanISE researcher",
    short: "Researcher",
  },
  {
    id: "coordinator",
    label: "R&D coordinator",
    short: "Coordinator",
  },
] as const

export type RoleId = (typeof ROLES)[number]["id"]

export type FieldGroup = "Identity" | "Contact" | "Research"

export type ProfileField = {
  id: string
  group: FieldGroup
  label: string
  value: string
}

export const PROFILE = {
  displayName: "Sample researcher",
  affiliation: "HumanISE · INESC TEC",
  initials: "SR",
}

export const FIELD_GROUPS: FieldGroup[] = ["Identity", "Contact", "Research"]

export const PROFILE_FIELDS: ProfileField[] = [
  {
    id: "name",
    group: "Identity",
    label: "Display name",
    value: PROFILE.displayName,
  },
  {
    id: "photo",
    group: "Identity",
    label: "Photo",
    value: "Portrait used on the radiator",
  },
  {
    id: "bio",
    group: "Identity",
    label: "Short bio",
    value: "Works on human-centred software engineering at the centre.",
  },
  {
    id: "email",
    group: "Contact",
    label: "Institutional email",
    value: "researcher.sample@inesctec.pt",
  },
  {
    id: "phone",
    group: "Contact",
    label: "Phone",
    value: "+351 220 000 000",
  },
  {
    id: "office",
    group: "Contact",
    label: "Office",
    value: "INESC TEC, Porto",
  },
  {
    id: "orcid",
    group: "Research",
    label: "ORCID",
    value: "0000-0000-0000-0000",
  },
  {
    id: "topics",
    group: "Research",
    label: "Research topics",
    value: "Software engineering, information radiators",
  },
  {
    id: "projects",
    group: "Research",
    label: "Current projects",
    value: "Centre activities linked to this profile",
  },
]

export type Visibility = Record<string, RoleId[]>

export const INITIAL_VISIBILITY: Visibility = {
  name: ["researcher", "coordinator"],
  photo: ["researcher", "coordinator"],
  bio: ["researcher", "coordinator"],
  email: ["coordinator"],
  phone: [],
  office: ["researcher", "coordinator"],
  orcid: ["researcher", "coordinator"],
  topics: ["researcher", "coordinator"],
  projects: ["coordinator"],
}

export function cloneVisibility(visibility: Visibility): Visibility {
  return Object.fromEntries(
    Object.entries(visibility).map(([fieldId, roles]) => [fieldId, [...roles]])
  )
}

export function visibilityKey(visibility: Visibility) {
  return PROFILE_FIELDS.map((field) =>
    [...(visibility[field.id] ?? [])].sort().join(",")
  ).join("|")
}
