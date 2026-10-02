import {
  down as migration_20260226_161331_baseline_down,
  up as migration_20260226_161331_baseline_up,
} from "./20260226_161331_baseline";
import {
  down as migration_20260422_183456_down,
  up as migration_20260422_183456_up,
} from "./20260422_183456";
import {
  down as migration_20261002_140539_payload_3_90_upgrade_down,
  up as migration_20261002_140539_payload_3_90_upgrade_up,
} from "./20261002_140539_payload_3_90_upgrade";
import {
  down as migration_20261002_150000_search_functions_down,
  up as migration_20261002_150000_search_functions_up,
} from "./20261002_150000_search_functions";
import {
  down as migration_20261002_160000_dedupe_relationship_rows_down,
  up as migration_20261002_160000_dedupe_relationship_rows_up,
} from "./20261002_160000_dedupe_relationship_rows";

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
  {
    up: migration_20261002_140539_payload_3_90_upgrade_up,
    down: migration_20261002_140539_payload_3_90_upgrade_down,
    name: "20261002_140539_payload_3_90_upgrade",
  },
  {
    up: migration_20261002_150000_search_functions_up,
    down: migration_20261002_150000_search_functions_down,
    name: "20261002_150000_search_functions",
  },
  {
    up: migration_20261002_160000_dedupe_relationship_rows_up,
    down: migration_20261002_160000_dedupe_relationship_rows_down,
    name: "20261002_160000_dedupe_relationship_rows",
  },
];
