import type { Field } from "payload";
import { showForTypes } from "./conditions";

const isCourse = showForTypes("course");

export const courseFields: Field[] = [
  {
    name: "instructor",
    type: "text",
    admin: {
      description: "Instructor or creator name",
      condition: isCourse,
    },
  },
  {
    name: "coursePlatform",
    type: "select",
    options: [
      { label: "Udemy", value: "udemy" },
      { label: "Coursera", value: "coursera" },
      { label: "Frontend Masters", value: "frontendMasters" },
      { label: "MasterClass", value: "masterclass" },
      { label: "Pluralsight", value: "pluralsight" },
      { label: "edX", value: "edx" },
      { label: "Skillshare", value: "skillshare" },
      { label: "LinkedIn Learning", value: "linkedinLearning" },
      { label: "Egghead", value: "egghead" },
      { label: "YouTube", value: "youtube" },
      { label: "Other", value: "other" },
    ],
    admin: {
      description: "Platform offering the course",
      condition: isCourse,
    },
  },
  {
    name: "courseDuration",
    type: "text",
    admin: {
      description: "Total duration (e.g. '12h 30m', '8 weeks')",
      condition: isCourse,
    },
  },
  {
    name: "courseLevel",
    type: "select",
    options: [
      { label: "Beginner", value: "beginner" },
      { label: "Intermediate", value: "intermediate" },
      { label: "Advanced", value: "advanced" },
    ],
    admin: {
      description: "Difficulty level",
      condition: isCourse,
    },
  },
  {
    name: "courseUrl",
    type: "text",
    admin: {
      description: "URL to the course",
      condition: isCourse,
    },
  },
];
