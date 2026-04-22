import {
  down as migration_20260226_161331_baseline_down,
  up as migration_20260226_161331_baseline_up,
} from "./20260226_161331_baseline";
import {
  down as migration_20260422_183456_down,
  up as migration_20260422_183456_up,
} from "./20260422_183456";

export const migrations = [
  {
    up: migration_20260226_161331_baseline_up,
    down: migration_20260226_161331_baseline_down,
    name: "20260226_161331_baseline",
  },
  {
    up: migration_20260422_183456_up,
    down: migration_20260422_183456_down,
    name: "20260422_183456",
  },
];
