export interface LiveAdjustment {
  id: string;
  tripId?: string;
  type: 'schedule-change' | 'route-change' | 'attraction-closure' | 'weather-alert' | 'transport-delay';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedArea: 'itinerary' | 'budget' | 'route' | 'accommodation' | 'activities';
  originalValue: string;
  newValue: string;
  timestamp: string;
  resolved: boolean;
  resolution?: string;
}

export interface LiveTripState {
  itineraryId: string;
  currentDay: number;
  currentActivityIndex: number;
  isPaused: boolean;
  adjustments: LiveAdjustment[];
  lastUpdated: string;
}

/**
 * Live Trip Adjustments Engine - Monitors real-time changes and
 * automatically adjusts itineraries based on disruptions
 */
export class LiveAdjustmentsEngine {
  private static adjustments: LiveAdjustment[] = [];
  private static tripStates: Map<string, LiveTripState> = new Map();

  /**
   * Record a live adjustment for a trip
   */
  static recordAdjustment(adjustment: Omit<LiveAdjustment, 'id' | 'timestamp' | 'resolved'>) {
    const newAdjustment: LiveAdjustment = {
      ...adjustment,
      id: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    LiveAdjustmentsEngine.adjustments.push(newAdjustment);

    // Update or create trip state
    const existingState = LiveAdjustmentsEngine.tripStates.get(adjustment.tripId || '');
    if (existingState) {
      existingState.adjustments.push(newAdjustment);
      existingState.lastUpdated = newAdjustment.timestamp;
    } else {
      const newState: LiveTripState = {
        itineraryId: adjustment.tripId || '',
        currentDay: 1,
        currentActivityIndex: 0,
        isPaused: false,
        adjustments: [newAdjustment],
        lastUpdated: newAdjustment.timestamp,
      };
      LiveAdjustmentsEngine.tripStates.set(adjustment.tripId || '', newState);
    }

    return newAdjustment;
  }

  /**
   * Get all adjustments for a trip
   */
  static getAdjustments(tripId: string): LiveAdjustment[] {
    return LiveAdjustmentsEngine.adjustments.filter(
      (adj) => adj.title.includes(tripId) || adj.affectedArea === 'itinerary'
    );
  }

  /**
   * Get trip state
   */
  static getTripState(tripId: string): LiveTripState | undefined {
    return LiveAdjustmentsEngine.tripStates.get(tripId);
  }

  /**
   * Mark an adjustment as resolved
   */
  static markResolved(adjustmentId: string, resolution: string) {
    const adjustment = LiveAdjustmentsEngine.adjustments.find(
      (adj) => adj.id === adjustmentId
    );
    if (adjustment) {
      adjustment.resolved = true;
      adjustment.resolution = resolution;
    }
  }

  /**
   * Get unresolved adjustments
   */
  static getUnresolvedAdjustments(tripId?: string): LiveAdjustment[] {
    const all = LiveAdjustmentsEngine.adjustments.filter(
      (adj) => !adj.resolved
    );
    return tripId ? all.filter((adj) => adj.title.includes(tripId)) : all;
  }

  /**
   * Simulate real-time disruptions for testing
   */
  static simulateDisruption(tripId: string, disruptionType: LiveAdjustment['type']) {
    const disruptions: Record<LiveAdjustment['type'], LiveAdjustment> = {
      'schedule-change': {
        id: 'sim-1',
        tripId,
        type: 'schedule-change',
        title: 'Flight Delay',
        description: 'Flight FR123 delayed by 3 hours',
        severity: 'high',
        affectedArea: 'itinerary',
        originalValue: 'Day 1, Activity 1',
        newValue: 'Day 1, Activity 3',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolved: false,
      },
      'route-change': {
        id: 'sim-2',
        tripId,
        type: 'route-change',
        title: 'Road Construction',
        description: 'Main road closed between attractions',
        severity: 'medium',
        affectedArea: 'route',
        originalValue: 'Direct route',
        newValue: 'Alternative route via secondary roads',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        resolved: false,
      },
      'attraction-closure': {
        id: 'sim-3',
        tripId,
        type: 'attraction-closure',
        title: 'Museum Closure',
        description: 'Louvre Museum closed unexpectedly',
        severity: 'high',
        affectedArea: 'itinerary',
        originalValue: 'Louvre Museum visit',
        newValue: 'Orsay Museum visit',
        timestamp: new Date().toISOString(),
        resolved: false,
      },
      'weather-alert': {
        id: 'sim-4',
        tripId,
        type: 'weather-alert',
        title: 'Rain Alert',
        description: 'Heavy rain expected afternoon',
        severity: 'medium',
        affectedArea: 'activities',
        originalValue: 'Outdoor walking tour',
        newValue: 'Indoor museum visit',
        timestamp: new Date().toISOString(),
        resolved: false,
      },
      'transport-delay': {
        id: 'sim-5',
        tripId,
        type: 'transport-delay',
        title: 'Train Delay',
        description: 'RER B line delayed 20 minutes',
        severity: 'low',
        affectedArea: 'route',
        originalValue: 'Train to Versailles',
        newValue: 'Bus to Versailles',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        resolved: false,
      },
    };

    const disruption = disruptions[disruptionType];
    if (disruption) {
      LiveAdjustmentsEngine.recordAdjustment({
        ...disruption,
        tripId,
      });
    }
  }

  getUnresolvedAdjustments = LiveAdjustmentsEngine.getUnresolvedAdjustments.bind(LiveAdjustmentsEngine);
  getTripState = LiveAdjustmentsEngine.getTripState.bind(LiveAdjustmentsEngine);
  recordAdjustment = LiveAdjustmentsEngine.recordAdjustment.bind(LiveAdjustmentsEngine);
  markResolved = LiveAdjustmentsEngine.markResolved.bind(LiveAdjustmentsEngine);
  getAdjustments = LiveAdjustmentsEngine.getAdjustments.bind(LiveAdjustmentsEngine);
  simulateDisruption = LiveAdjustmentsEngine.simulateDisruption.bind(LiveAdjustmentsEngine);

  get adjustments(): LiveAdjustment[] {
    return LiveAdjustmentsEngine.adjustments;
  }
}

export const liveAdjustmentsEngine = new LiveAdjustmentsEngine();

export const liveEngine = new LiveAdjustmentsEngine();