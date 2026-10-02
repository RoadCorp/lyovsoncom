import type { Field } from "payload";
import { showForTypes } from "./conditions";

const isPerson = showForTypes("person");

export const personFields: Field[] = [
  {
    name: "roles",
    type: "select",
    hasMany: true,
    options: [
      { label: "Author", value: "author" },
      { label: "Director", value: "director" },
      { label: "Actor", value: "actor" },
      { label: "Musician", value: "musician" },
      { label: "Developer", value: "developer" },
      { label: "Host", value: "host" },
      { label: "Public Figure", value: "publicFigure" },
    ],
    admin: {
      description: "What roles does this person have?",
      condition: isPerson,
    },
  },
  {
    name: "birthDate",
    type: "date",
    admin: {
      description: "Birth date",
      condition: isPerson,
      date: {
        pickerAppearance: "dayOnly",
      },
    },
  },
  {
    name: "deathDate",
    type: "date",
    admin: {
      description: "Death date",
      condition: isPerson,
      date: {
        pickerAppearance: "dayOnly",
      },
    },
  },
  {
    name: "nationality",
    type: "text",
    admin: {
      description: "Nationality",
      condition: isPerson,
    },
  },
  {
    // Also shown for companies.
    name: "website",
    type: "text",
    admin: {
      description: "Personal or professional website",
      placeholder: "https://example.com",
      condition: showForTypes("person", "company"),
    },
  },
  {
    name: "socialLinks",
    type: "json",
    admin: {
      description: "Social media links and profiles",
      condition: isPerson,
    },
  },
];
