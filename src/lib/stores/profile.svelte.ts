import { loadProfile, saveProfile, type ProfileInput } from '../db/profile';
import type { UserProfile } from '../db/types';

let profile = $state<UserProfile | null>(null);
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
