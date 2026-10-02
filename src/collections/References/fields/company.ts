import type { Field } from "payload";
import { showForTypes } from "./conditions";

const isCompany = showForTypes("company");

/** The shared `website` field is defined with the person fields. */
export const companyFields: Field[] = [
  {
    name: "industry",
    type: "text",
    admin: {
      description: "Industry",
      condition: isCompany,
    },
  },
  {
    name: "foundedDate",
    type: "date",
    admin: {
      description: "Founded date",
      condition: isCompany,
      date: {
        pickerAppearance: "dayOnly",
      },
    },
  },
];
