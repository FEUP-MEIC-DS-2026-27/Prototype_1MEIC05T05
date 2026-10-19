import { useMemo, useState } from "react"
import { EyeOffIcon, RotateCcwIcon, SaveIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  FIELD_GROUPS,
  INITIAL_VISIBILITY,
  PROFILE,
  PROFILE_FIELDS,
  ROLES,
  cloneVisibility,
  visibilityKey,
  type RoleId,
  type Visibility,
} from "@/data/profile"

export function ProfileVisibility() {
  const [saved, setSaved] = useState<Visibility>(() =>
    cloneVisibility(INITIAL_VISIBILITY)
  )
  const [draft, setDraft] = useState<Visibility>(() =>
    cloneVisibility(INITIAL_VISIBILITY)
  )
  const [viewAs, setViewAs] = useState<RoleId>("researcher")
  const [savedNotice, setSavedNotice] = useState(false)

  const dirty = visibilityKey(draft) !== visibilityKey(saved)
  const viewRole = ROLES.find((role) => role.id === viewAs) ?? ROLES[0]
  const visibleFields = useMemo(
    () =>
      PROFILE_FIELDS.filter((field) =>
        (draft[field.id] ?? []).includes(viewAs)
      ),
    [draft, viewAs]
  )
  const hiddenCount = PROFILE_FIELDS.length - visibleFields.length

  function setFieldRoles(fieldId: string, roles: RoleId[]) {
    setSavedNotice(false)
    setDraft((current) => ({ ...current, [fieldId]: roles }))
  }

  function save() {
    setSaved(cloneVisibility(draft))
    setSavedNotice(true)
  }

  function discard() {
    setDraft(cloneVisibility(saved))
    setSavedNotice(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">HumanISE.info</p>
        <h1 className="font-heading text-2xl font-medium tracking-tight">
          Profile visibility
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Choose which parts of your profile each role can see. A field with no
          role selected stays visible only to you. This prototype keeps the
          choice in the page.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Field visibility by role</CardTitle>
            <CardDescription>
              Roles assumed for the centre: HumanISE researcher and R&amp;D
              coordinator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {FIELD_GROUPS.map((group) => (
                <FieldSet key={group}>
                  <FieldLegend>{group}</FieldLegend>
                  <FieldGroup className="@container/field-group">
                    {PROFILE_FIELDS.filter((field) => field.group === group).map(
                      (field) => {
                        const roles = draft[field.id] ?? []
                        return (
                          <Field key={field.id} orientation="responsive">
                            <FieldContent>
                              <FieldTitle id={`${field.id}-label`}>
                                {field.label}
                              </FieldTitle>
                              <FieldDescription>{field.value}</FieldDescription>
                              {roles.length === 0 ? (
                                <Badge variant="secondary">Only you</Badge>
                              ) : null}
                            </FieldContent>
                            <ToggleGroup
                              multiple
                              size="sm"
                              variant="outline"
                              spacing={2}
                              aria-labelledby={`${field.id}-label`}
                              value={roles}
                              onValueChange={(next) =>
                                setFieldRoles(field.id, next as RoleId[])
                              }
                            >
                              {ROLES.map((role) => (
                                <ToggleGroupItem key={role.id} value={role.id}>
                                  {role.short}
                                </ToggleGroupItem>
                              ))}
                            </ToggleGroup>
                          </Field>
                        )
                      }
                    )}
                  </FieldGroup>
                </FieldSet>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-3">
            {savedNotice ? (
              <Alert>
                <AlertTitle>Visibility saved in this prototype</AlertTitle>
                <AlertDescription>
                  The preview already uses the same choices. Nothing was sent
                  to a server.
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={save} disabled={!dirty}>
                <SaveIcon data-icon="inline-start" />
                Save visibility
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={discard}
                disabled={!dirty}
              >
                <RotateCcwIcon data-icon="inline-start" />
                Discard changes
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Seen by this role</CardTitle>
            <CardDescription>
              {hiddenCount === 0
                ? `${viewRole.label} can see every field.`
                : `${hiddenCount} field${hiddenCount === 1 ? "" : "s"} hidden from ${viewRole.label}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field orientation="horizontal">
              <FieldTitle id="view-as-label">View as</FieldTitle>
              <ToggleGroup
                spacing={2}
                size="sm"
                variant="outline"
                aria-labelledby="view-as-label"
                value={[viewAs]}
                onValueChange={(next) => {
                  const role = next[0]
                  if (role === "researcher" || role === "coordinator") {
                    setViewAs(role)
                  }
                }}
              >
                {ROLES.map((role) => (
                  <ToggleGroupItem key={role.id} value={role.id}>
                    {role.short}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
            <Separator />
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {(draft.photo ?? []).includes(viewAs) ? PROFILE.initials : "–"}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <p className="truncate font-medium">
                  {(draft.name ?? []).includes(viewAs)
                    ? PROFILE.displayName
                    : "Name hidden"}
                </p>
                <p className="truncate text-muted-foreground">
                  {PROFILE.affiliation}
                </p>
              </div>
            </div>
            {visibleFields.filter((field) => field.id !== "name" && field.id !== "photo")
              .length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <EyeOffIcon />
                  </EmptyMedia>
                  <EmptyTitle>Nothing else is shared</EmptyTitle>
                  <EmptyDescription>
                    Turn on Researcher or Coordinator on a field to show it
                    here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <dl className="flex flex-col gap-3">
                {visibleFields
                  .filter((field) => field.id !== "name" && field.id !== "photo")
                  .map((field) => (
                    <div key={field.id} className="flex flex-col gap-0.5">
                      <dt className="text-muted-foreground">{field.label}</dt>
                      <dd>{field.value}</dd>
                    </div>
                  ))}
              </dl>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
