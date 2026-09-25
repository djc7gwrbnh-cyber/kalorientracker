export type Unit = 'g' | 'ml';

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FoodSource = 'own' | 'off';

/** Naehrwerte in kcal und Gramm. */
export interface Nutrients {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface UserProfile {
  /** Singleton-Schluessel. */
  id: 'profile';
  /** Koerpergroesse in cm. */
  height: number;
  calorieGoal: number;
  proteinGoal: number;
  fatGoal: number;
  /** Optional: gesetzt bedeutet, dass der Kohlenhydrat-Ring angezeigt wird. */
  carbGoal?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Food {
  id: string;
  name: string;
  /** Naehrwerte pro 100 g bzw. 100 ml. */
  per100: Nutrients;
  unit: Unit;
  /** Optionale Portion, z. B. "1 Banane" mit servingSize 120. */
  servingName?: string;
  servingSize?: number;
  favorite: boolean;
  usageCount: number;
  lastUsedAt?: number;
  source: FoodSource;
  barcode?: string;
  createdAt: number;
  updatedAt: number;
}

export interface MealIngredient {
  foodId: string;
  /** Menge in der Einheit des Lebensmittels. */
  amount: number;
}

export interface Meal {
  id: string;
  name: string;
  favorite: boolean;
  usageCount: number;
  lastUsedAt?: number;
  /** Summen werden immer live berechnet und nie gespeichert. */
  ingredients: MealIngredient[];
  createdAt: number;
  updatedAt: number;
}

export interface FoodEntry {
  id: string;
  timestamp: number;
  /** Lokaler Tag im Format YYYY-MM-DD. */
  day: string;
  category: MealCategory;
  /** Menge in der Einheit des Eintrags. */
  amount: number;

  /*
   * Snapshot des Lebensmittels zum Eintragszeitpunkt. Gespeichert werden die
   * Werte pro 100 statt der fertigen Summen: so bleibt die Historie korrekt,
   * wenn das Lebensmittel spaeter geaendert oder geloescht wird, und ein
   * nachtraeglich geaenderter Mengenwert rechnet sich trotzdem richtig aus.
   */
  name: string;
  per100: Nutrients;
  unit: Unit;

  /** Verweis auf das Lebensmittel, falls es noch existiert. */
  foodId?: string;
  /** Verbindet die Eintraege einer gemeinsam eingetragenen Mahlzeit. */
  mealGroupId?: string;
  mealName?: string;
}

export interface WeightEntry {
  /** Lokaler Tag im Format YYYY-MM-DD, zugleich Primaerschluessel. */
  day: string;
  /** Gewicht in kg. */
  weight: number;
  updatedAt: number;
}

export interface WorkoutEntry {
  /** Lokaler Tag im Format YYYY-MM-DD, zugleich Primaerschluessel. */
  day: string;
  /** Was trainiert wurde, z. B. "Push" oder "Beine". */
  type: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
}
