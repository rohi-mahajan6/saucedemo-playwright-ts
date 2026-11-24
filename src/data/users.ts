import path from 'node:path';

/** SauceDemo seeded personas. Usernames are public; the password comes from env. */
export const Persona = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
  problem: 'problem_user',
  performanceGlitch: 'performance_glitch_user',
  error: 'error_user',
  visual: 'visual_user',
} as const;

export type PersonaName = (typeof Persona)[keyof typeof Persona];

/** Personas that are expected to reach the inventory page after login. */
export const personasThatCanLogIn: PersonaName[] = [
  Persona.standard,
  Persona.problem,
  Persona.performanceGlitch,
  Persona.error,
  Persona.visual,
];

export const storageStatePath = (persona: PersonaName): string =>
  path.join(__dirname, '..', '..', '.auth', `${persona}.json`);
