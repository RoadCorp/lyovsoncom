import type { DateField } from "payload";

interface PublishedAtOptions {
  description: string;
  position?: "sidebar";
}

/** Publication date, set to the publish time when left empty on publish. */
export const publishedAtField = ({
  description,
  position,
}: PublishedAtOptions): DateField => ({
  name: "publishedAt",
  type: "date",
  admin: {
    date: {
      pickerAppearance: "dayAndTime",
    },
    ...(position ? { position } : {}),
    description,
  },
  hooks: {
    beforeChange: [
      ({ siblingData, value }) => {
        if (siblingData._status === "published" && !value) {
          return new Date();
        }
        return value;
      },
    ],
  },
});
