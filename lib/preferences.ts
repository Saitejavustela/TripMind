export type TravelStyle = 'budget' | 'moderate' | 'luxury';
export type Pace = 'relaxed' | 'moderate' | 'packed';
export type AccommodationType = 'hotel' | 'hostel' | 'airbnb' | 'resort' | 'any';
export type TransportationPreference = 'public' | 'private' | 'mixed';
export type GroupType = 'solo' | 'couple' | 'family' | 'friends' | 'business';

export interface TravelPreferences {
  travelStyle: TravelStyle;
  pace: Pace;
  accommodationsType: AccommodationType;
  transportationPreference: TransportationPreference;
  interests: string[];
  dietaryRestrictions: string[];
  groupType: GroupType;
  specialRequirements: string[];
  savedAt: string;
}

const DEFAULT_PREFERENCES: TravelPreferences = {
  travelStyle: 'moderate',
  pace: 'moderate',
  accommodationsType: 'any',
  transportationPreference: 'mixed',
  interests: [],
  dietaryRestrictions: [],
  groupType: 'solo',
  specialRequirements: [],
  savedAt: new Date().toISOString(),
};

export class PreferenceManager {
  private static readonly STORAGE_KEY = 'trip_mind_preferences';
  private static preferences: TravelPreferences | null = null;

  /**
   * Get preferences from localStorage (browser only) or from default
   */
  static getPreferences(): TravelPreferences {
    // In server-side rendering, return defaults
    if (typeof localStorage === 'undefined') {
      return DEFAULT_PREFERENCES;
    }

    // Use cached preferences if available
    if (this.preferences) {
      return this.preferences;
    }

    // Try to get from localStorage
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          this.preferences = parsed;
          return parsed as TravelPreferences;
        }
      }
    } catch {
      // If there's an error parsing, return default
    }

    this.savePreferences(DEFAULT_PREFERENCES);
    return DEFAULT_PREFERENCES;
  }

  /**
   * Save preferences to localStorage
   */
  static savePreferences(preferences: Partial<TravelPreferences>): TravelPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...preferences, savedAt: new Date().toISOString() };
    this.preferences = updated;

    // Save to localStorage (browser only)
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Storage failed, but continue
      }
    }

    return updated;
  }

  /**
   * Delete preferences from storage
   */
  static deletePreferences(): void {
    this.preferences = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Reset to default preferences
   */
  static resetToDefault(): TravelPreferences {
    return this.savePreferences(DEFAULT_PREFERENCES);
  }

  /**
   * Check if dietary restriction matches
   */
  static matchesDietary(dietaryRestrictions: string[], foods: string[]): boolean {
    return dietaryRestrictions.some(restriction =>
      foods.some(food => food.toLowerCase().includes(restriction.toLowerCase()))
    );
  }
}

export const defaultPreferences = DEFAULT_PREFERENCES;