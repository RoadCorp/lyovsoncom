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
import {
  down as migration_20261002_170851_remove_plugins_jobs_contacts_sizes_down,
  up as migration_20261002_170851_remove_plugins_jobs_contacts_sizes_up,
} from "./20261002_170851_remove_plugins_jobs_contacts_sizes";
import {
  down as migration_20261016_132922_portfolio_projects_down,
  up as migration_20261016_132922_portfolio_projects_up,
} from "./20261016_132922_portfolio_projects";
import {
  down as migration_20261016_145009_live_highlights_down,
  up as migration_20261016_145009_live_highlights_up,
} from "./20261016_145009_live_highlights";
import {
  down as migration_20261023_132410_project_kind_down,
  up as migration_20261023_132410_project_kind_up,
} from "./20261023_132410_project_kind";
import {
  down as migration_20261023_141615_sizes_to_variants_down,
  up as migration_20261023_141615_sizes_to_variants_up,
} from "./20261023_141615_sizes_to_variants";
import {
  down as migration_20261023_141617_payload_4_schema_down,
  up as migration_20261023_141617_payload_4_schema_up,
} from "./20261023_141617_payload_4_schema";
import {
  down as migration_20261023_141618_drop_legacy_columns_down,
  up as migration_20261023_141618_drop_legacy_columns_up,
} from "./20261023_141618_drop_legacy_columns";
import {
  down as migration_20261023_171114_trash_down,
  up as migration_20261023_171114_trash_up,
} from "./20261023_171114_trash";
import {
  down as migration_20261023_173048_topic_hierarchy_down,
  up as migration_20261023_173048_topic_hierarchy_up,
} from "./20261023_173048_topic_hierarchy";
import {
  down as migration_20261023_181124_reference_system_v2_down,
  up as migration_20261023_181124_reference_system_v2_up,
} from "./20261023_181124_reference_system_v2";
import {
  down as migration_20261023_221810_reference_hubs_down,
  up as migration_20261023_221810_reference_hubs_up,
} from "./20261023_221810_reference_hubs";
import {
  down as migration_20261024_065603_reference_relations_down,
  up as migration_20261024_065603_reference_relations_up,
} from "./20261024_065603_reference_relations";
import {
  down as migration_20261024_113002_agents_down,
  up as migration_20261024_113002_agents_up,
} from "./20261024_113002_agents";
import {
  down as migration_20261024_144952_retire_notes_down,
  up as migration_20261024_144952_retire_notes_up,
} from "./20261024_144952_retire_notes";

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
  {
    up: migration_20261002_170851_remove_plugins_jobs_contacts_sizes_up,
    down: migration_20261002_170851_remove_plugins_jobs_contacts_sizes_down,
    name: "20261002_170851_remove_plugins_jobs_contacts_sizes",
  },
  {
    up: migration_20261016_132922_portfolio_projects_up,
    down: migration_20261016_132922_portfolio_projects_down,
    name: "20261016_132922_portfolio_projects",
  },
  {
    up: migration_20261016_145009_live_highlights_up,
    down: migration_20261016_145009_live_highlights_down,
    name: "20261016_145009_live_highlights",
  },
  {
    up: migration_20261023_132410_project_kind_up,
    down: migration_20261023_132410_project_kind_down,
    name: "20261023_132410_project_kind",
  },
  {
    up: migration_20261023_141615_sizes_to_variants_up,
    down: migration_20261023_141615_sizes_to_variants_down,
    name: "20261023_141615_sizes_to_variants",
  },
  {
    up: migration_20261023_141617_payload_4_schema_up,
    down: migration_20261023_141617_payload_4_schema_down,
    name: "20261023_141617_payload_4_schema",
  },
  {
    up: migration_20261023_141618_drop_legacy_columns_up,
    down: migration_20261023_141618_drop_legacy_columns_down,
    name: "20261023_141618_drop_legacy_columns",
  },
  {
    up: migration_20261023_171114_trash_up,
    down: migration_20261023_171114_trash_down,
    name: "20261023_171114_trash",
  },
  {
    up: migration_20261023_173048_topic_hierarchy_up,
    down: migration_20261023_173048_topic_hierarchy_down,
    name: "20261023_173048_topic_hierarchy",
  },
  {
    up: migration_20261023_181124_reference_system_v2_up,
    down: migration_20261023_181124_reference_system_v2_down,
    name: "20261023_181124_reference_system_v2",
  },
  {
    up: migration_20261023_221810_reference_hubs_up,
    down: migration_20261023_221810_reference_hubs_down,
    name: "20261023_221810_reference_hubs",
  },
  {
    up: migration_20261024_065603_reference_relations_up,
    down: migration_20261024_065603_reference_relations_down,
    name: "20261024_065603_reference_relations",
  },
  {
    up: migration_20261024_113002_agents_up,
    down: migration_20261024_113002_agents_down,
    name: "20261024_113002_agents",
  },
  {
    up: migration_20261024_144952_retire_notes_up,
    down: migration_20261024_144952_retire_notes_down,
    name: "20261024_144952_retire_notes",
  },
];
