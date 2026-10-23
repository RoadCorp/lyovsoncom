import * as migration_20260226_161331_baseline from './20260226_161331_baseline';
import * as migration_20260422_183456 from './20260422_183456';
import * as migration_20261002_140539_payload_3_90_upgrade from './20261002_140539_payload_3_90_upgrade';
import * as migration_20261002_150000_search_functions from './20261002_150000_search_functions';
import * as migration_20261002_160000_dedupe_relationship_rows from './20261002_160000_dedupe_relationship_rows';
import * as migration_20261002_170851_remove_plugins_jobs_contacts_sizes from './20261002_170851_remove_plugins_jobs_contacts_sizes';
import * as migration_20261016_132922_portfolio_projects from './20261016_132922_portfolio_projects';
import * as migration_20261016_145009_live_highlights from './20261016_145009_live_highlights';
import * as migration_20261023_132907_sizes_to_variants from './20261023_132907_sizes_to_variants';
import * as migration_20261023_132912_payload_4_schema from './20261023_132912_payload_4_schema';

export const migrations = [
  {
    up: migration_20260226_161331_baseline.up,
    down: migration_20260226_161331_baseline.down,
    name: '20260226_161331_baseline',
  },
  {
    up: migration_20260422_183456.up,
    down: migration_20260422_183456.down,
    name: '20260422_183456',
  },
  {
    up: migration_20261002_140539_payload_3_90_upgrade.up,
    down: migration_20261002_140539_payload_3_90_upgrade.down,
    name: '20261002_140539_payload_3_90_upgrade',
  },
  {
    up: migration_20261002_150000_search_functions.up,
    down: migration_20261002_150000_search_functions.down,
    name: '20261002_150000_search_functions',
  },
  {
    up: migration_20261002_160000_dedupe_relationship_rows.up,
    down: migration_20261002_160000_dedupe_relationship_rows.down,
    name: '20261002_160000_dedupe_relationship_rows',
  },
  {
    up: migration_20261002_170851_remove_plugins_jobs_contacts_sizes.up,
    down: migration_20261002_170851_remove_plugins_jobs_contacts_sizes.down,
    name: '20261002_170851_remove_plugins_jobs_contacts_sizes',
  },
  {
    up: migration_20261016_132922_portfolio_projects.up,
    down: migration_20261016_132922_portfolio_projects.down,
    name: '20261016_132922_portfolio_projects',
  },
  {
    up: migration_20261016_145009_live_highlights.up,
    down: migration_20261016_145009_live_highlights.down,
    name: '20261016_145009_live_highlights',
  },
  {
    up: migration_20261023_132907_sizes_to_variants.up,
    down: migration_20261023_132907_sizes_to_variants.down,
    name: '20261023_132907_sizes_to_variants',
  },
  {
    up: migration_20261023_132912_payload_4_schema.up,
    down: migration_20261023_132912_payload_4_schema.down,
    name: '20261023_132912_payload_4_schema'
  },
];
