"use client";

import {
  DateTimeField,
  SelectField,
  useConfig,
  useDocumentInfo,
  useField,
  useFormFields,
  useFormInitializing,
} from "@payloadcms/ui";
import type { DateFieldClientProps, SelectFieldClientProps } from "payload";
import type React from "react";
import { useEffect, useRef } from "react";

import type { Activity, Reference } from "@/payload-types";
import { getRelationId } from "@/utilities/relations";

/**
 * Admin defaults that make "I finished X today" a pick and a Publish click:
 * the activity type follows the reference type, and a new activity is
 * finished today. Both stay editable.
 */

const ACTIVITY_TYPE_BY_REFERENCE_TYPE: Partial<
  Record<Reference["type"], Activity["activityType"]>
> = {
  // Every book logged so far was an audiobook (11 of 11, Oct 2026).
  book: "listen",
  course: "learn",
  movie: "watch",
  music: "listen",
  podcast: "listen",
  tvShow: "watch",
  videoGame: "play",
};

export const ActivityTypeField: React.FC<SelectFieldClientProps> = (props) => {
  const { path } = props;
  const {
    config: { routes, serverURL },
  } = useConfig();
  const { setValue, value } = useField<string>({ path });
  const referenceId = useFormFields(([fields]) =>
    getRelationId(fields.reference?.value ?? null)
  );
  // The value this field last filled in, so a manual choice is never replaced.
  const autoValue = useRef<string>(undefined);
  const current = useRef(value);
  current.current = value;

  useEffect(() => {
    if (referenceId === null) {
      return;
    }
    const controller = new AbortController();
    fetch(
      `${serverURL}${routes.api}/references/${referenceId}?depth=0&select[type]=true`,
      { credentials: "include", signal: controller.signal }
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((reference: Pick<Reference, "type"> | null) => {
        const next =
          reference && ACTIVITY_TYPE_BY_REFERENCE_TYPE[reference.type];
        if (
          next &&
          (!current.current || current.current === autoValue.current)
        ) {
          autoValue.current = next;
          setValue(next);
        }
      })
      .catch(() => {
        // Aborted or offline: the type stays a manual choice.
      });
    return () => controller.abort();
  }, [referenceId, routes.api, serverURL, setValue]);

  return <SelectField {...props} />;
};

/** Today's date as the day picker stores it: noon UTC of the local day. */
function today(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  ).toISOString();
}

/**
 * Autosave creates the draft on the server before the form opens, so a
 * server default would use the server's date. Fill the browser's date
 * instead, but only on a draft nobody has edited yet.
 */
export const TodayDateField: React.FC<DateFieldClientProps> = (props) => {
  const { data } = useDocumentInfo();
  const initializing = useFormInitializing();
  const { setValue, value } = useField<string>({ path: props.path });
  const isFresh =
    !initializing &&
    Boolean(data?.createdAt) &&
    data?.createdAt === data?.updatedAt;

  // Fill once, so clearing the date for an activity in progress sticks.
  const filled = useRef(false);

  useEffect(() => {
    if (!filled.current && isFresh && !value) {
      filled.current = true;
      setValue(today());
    }
  }, [isFresh, setValue, value]);

  return <DateTimeField {...props} />;
};
