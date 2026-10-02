import type { Field } from "payload";
import { showForTypes } from "./conditions";

const isVideoGame = showForTypes("videoGame");

export const gameFields: Field[] = [
  {
    name: "platforms",
    type: "select",
    hasMany: true,
    options: [
      { label: "PC", value: "pc" },
      { label: "PlayStation", value: "playstation" },
      { label: "Xbox", value: "xbox" },
      { label: "Nintendo Switch", value: "switch" },
      { label: "Mobile", value: "mobile" },
      { label: "VR", value: "vr" },
    ],
    admin: {
      description: "Gaming platforms",
      condition: isVideoGame,
    },
  },
  {
    name: "esrbRating",
    type: "select",
    options: [
      { label: "E - Everyone", value: "e" },
      { label: "E10+ - Everyone 10+", value: "e10" },
      { label: "T - Teen", value: "t" },
      { label: "M - Mature", value: "m" },
      { label: "AO - Adults Only", value: "ao" },
    ],
    admin: {
      description: "ESRB rating",
      condition: isVideoGame,
    },
  },
  {
    name: "metacriticScore",
    type: "number",
    min: 0,
    max: 100,
    admin: {
      description: "Metacritic score",
      condition: isVideoGame,
    },
  },
  {
    name: "developer",
    type: "text",
    admin: {
      description: "Game developer",
      condition: isVideoGame,
    },
  },
];
