import type { CheckboxField, TextField } from "payload";

import { formatSlugHook } from "./format-slug";

interface Overrides {
  checkboxOverrides?: Partial<CheckboxField>;
  slugOverrides?: Partial<TextField>;
}

type Slug = (
  fieldToUse?: string,
  overrides?: Overrides
) => [TextField, CheckboxField];

export const slugField: Slug = (fieldToUse = "title", overrides = {}) => {
  const { slugOverrides, checkboxOverrides } = overrides;

  const checkBoxField: CheckboxField = {
    name: "slugLock",
    type: "checkbox",
    defaultValue: true,
    admin: {
      hidden: true,
      position: "sidebar",
    },
    ...checkboxOverrides,
  };

  // Expect ts error here because of typescript mismatching Partial<TextField> with TextField
  // @ts-expect-error
  const slugTextField: TextField = {
    name: "slug",
    type: "text",
    index: true,
    label: "Slug",
    ...(slugOverrides || {}),
    hooks: {
      // Kept this in for hook or API based updates
      beforeValidate: [formatSlugHook(fieldToUse)],
    },
    admin: {
      position: "sidebar",
      ...(slugOverrides?.admin || {}),
      components: {
        Field: {
          path: "@/fields/slug/slug-component#SlugComponent",
          clientProps: {
            fieldToUse,
            checkboxFieldPath: checkBoxField.name,
          },
        },
      },
    },
  };

  return [slugTextField, checkBoxField];
};
