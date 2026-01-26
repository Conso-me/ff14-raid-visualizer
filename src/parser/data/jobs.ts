// FF14 Job Definitions
// Maps job IDs to names and roles

export type JobRole = 'tank' | 'healer' | 'melee' | 'ranged' | 'caster';

export interface JobInfo {
  id: number;
  name: string;
  abbreviation: string;
  role: JobRole;
}

// Complete job list as of Dawntrail
export const JOBS: Record<number, JobInfo> = {
  // Tanks
  19: { id: 19, name: 'Paladin', abbreviation: 'PLD', role: 'tank' },
  21: { id: 21, name: 'Warrior', abbreviation: 'WAR', role: 'tank' },
  32: { id: 32, name: 'Dark Knight', abbreviation: 'DRK', role: 'tank' },
  37: { id: 37, name: 'Gunbreaker', abbreviation: 'GNB', role: 'tank' },

  // Healers
  24: { id: 24, name: 'White Mage', abbreviation: 'WHM', role: 'healer' },
  28: { id: 28, name: 'Scholar', abbreviation: 'SCH', role: 'healer' },
  33: { id: 33, name: 'Astrologian', abbreviation: 'AST', role: 'healer' },
  40: { id: 40, name: 'Sage', abbreviation: 'SGE', role: 'healer' },

  // Melee DPS
  20: { id: 20, name: 'Monk', abbreviation: 'MNK', role: 'melee' },
  22: { id: 22, name: 'Dragoon', abbreviation: 'DRG', role: 'melee' },
  30: { id: 30, name: 'Ninja', abbreviation: 'NIN', role: 'melee' },
  34: { id: 34, name: 'Samurai', abbreviation: 'SAM', role: 'melee' },
  39: { id: 39, name: 'Reaper', abbreviation: 'RPR', role: 'melee' },
  41: { id: 41, name: 'Viper', abbreviation: 'VPR', role: 'melee' },

  // Physical Ranged DPS
  23: { id: 23, name: 'Bard', abbreviation: 'BRD', role: 'ranged' },
  31: { id: 31, name: 'Machinist', abbreviation: 'MCH', role: 'ranged' },
  38: { id: 38, name: 'Dancer', abbreviation: 'DNC', role: 'ranged' },

  // Magical Ranged DPS
  25: { id: 25, name: 'Black Mage', abbreviation: 'BLM', role: 'caster' },
  27: { id: 27, name: 'Summoner', abbreviation: 'SMN', role: 'caster' },
  35: { id: 35, name: 'Red Mage', abbreviation: 'RDM', role: 'caster' },
  42: { id: 42, name: 'Pictomancer', abbreviation: 'PCT', role: 'caster' },

  // Base classes (shouldn't appear in raids but included for completeness)
  1: { id: 1, name: 'Gladiator', abbreviation: 'GLA', role: 'tank' },
  2: { id: 2, name: 'Pugilist', abbreviation: 'PGL', role: 'melee' },
  3: { id: 3, name: 'Marauder', abbreviation: 'MRD', role: 'tank' },
  4: { id: 4, name: 'Lancer', abbreviation: 'LNC', role: 'melee' },
  5: { id: 5, name: 'Archer', abbreviation: 'ARC', role: 'ranged' },
  6: { id: 6, name: 'Conjurer', abbreviation: 'CNJ', role: 'healer' },
  7: { id: 7, name: 'Thaumaturge', abbreviation: 'THM', role: 'caster' },
  26: { id: 26, name: 'Arcanist', abbreviation: 'ACN', role: 'caster' },
  29: { id: 29, name: 'Rogue', abbreviation: 'ROG', role: 'melee' },
};

// Get job info by ID
export function getJobById(jobId: number): JobInfo | undefined {
  return JOBS[jobId];
}

// Get job abbreviation by ID
export function getJobAbbreviation(jobId: number): string {
  return JOBS[jobId]?.abbreviation || 'UNK';
}

// Get job role by ID
export function getJobRole(jobId: number): JobRole | undefined {
  return JOBS[jobId]?.role;
}

// Role priority order for sorting (Tank > Healer > Melee > Ranged > Caster)
export const ROLE_PRIORITY: Record<JobRole, number> = {
  tank: 0,
  healer: 1,
  melee: 2,
  ranged: 3,
  caster: 4,
};

// Sort jobs by role priority
export function sortByRolePriority(a: { jobId: number }, b: { jobId: number }): number {
  const roleA = getJobRole(a.jobId);
  const roleB = getJobRole(b.jobId);

  if (!roleA || !roleB) return 0;

  const priorityDiff = ROLE_PRIORITY[roleA] - ROLE_PRIORITY[roleB];
  if (priorityDiff !== 0) return priorityDiff;

  // Within same role, sort by job ID
  return a.jobId - b.jobId;
}
