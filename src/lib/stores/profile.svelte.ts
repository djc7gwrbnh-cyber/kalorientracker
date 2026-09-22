import { loadProfile, saveProfile, type ProfileInput } from '../db/profile';
import type { UserProfile } from '../db/types';

// raw: das Profil wird immer als Ganzes ersetzt und bleibt so ein einfaches
// Objekt, das sich wieder speichern laesst.
let profile = $state.raw<UserProfile | null>(null);
let ready = $state(false);

export const profileStore = {
  get current(): UserProfile | null {
    return profile;
  },
  /** false, solange die Datenbank noch gelesen wird. */
  get ready(): boolean {
    return ready;
  },
  async load(): Promise<void> {
    profile = await loadProfile();
    ready = true;
  },
  async save(input: ProfileInput): Promise<void> {
    profile = await saveProfile(input);
  },
};
