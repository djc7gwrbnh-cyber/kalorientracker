import { db } from './db';
import type { UserProfile } from './types';

export type ProfileInput = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>;

/** Formularzustand: Felder sind null, solange nichts Gueltiges eingegeben ist. */
export interface ProfileDraft {
  height: number | null;
  calorieGoal: number | null;
  proteinGoal: number | null;
  fatGoal: number | null;
  carbGoal: number | null;
}

/**
 * Prueft einen Formularzustand und gibt die speicherbaren Werte zurueck,
 * oder null, wenn noch etwas fehlt.
 */
export function toProfileInput(draft: ProfileDraft): ProfileInput | null {
  const { height, calorieGoal, proteinGoal, fatGoal, carbGoal } = draft;

  if (height == null || height <= 0) return null;
  if (calorieGoal == null || calorieGoal <= 0) return null;
  if (proteinGoal == null || proteinGoal < 0) return null;
  if (fatGoal == null || fatGoal < 0) return null;
  if (carbGoal != null && carbGoal < 0) return null;

  const input: ProfileInput = { height, calorieGoal, proteinGoal, fatGoal };
  if (carbGoal != null) input.carbGoal = carbGoal;
  return input;
}

export function toProfileDraft(profile: UserProfile | null): ProfileDraft {
  return {
    height: profile?.height ?? null,
    calorieGoal: profile?.calorieGoal ?? null,
    proteinGoal: profile?.proteinGoal ?? null,
    fatGoal: profile?.fatGoal ?? null,
    carbGoal: profile?.carbGoal ?? null,
  };
}

export async function loadProfile(): Promise<UserProfile | null> {
  return (await db.profile.get('profile')) ?? null;
}

/**
 * Legt das Profil an oder aktualisiert es. Ziele aendert ausschliesslich
 * diese Funktion, also immer nur durch eine Eingabe des Nutzers.
 */
export async function saveProfile(input: ProfileInput): Promise<UserProfile> {
  const now = Date.now();
  const existing = await db.profile.get('profile');

  const profile: UserProfile = {
    id: 'profile',
    height: input.height,
    calorieGoal: input.calorieGoal,
    proteinGoal: input.proteinGoal,
    fatGoal: input.fatGoal,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  if (input.carbGoal != null) profile.carbGoal = input.carbGoal;

  await db.profile.put(profile);
  return profile;
}
