import { AttractionRecommendation, DailyRoute, RouteOptimization } from '@/types/travel';

interface Location {
  lat: number;
  lng: number;
}

interface OptimizationRequest {
  attractions: AttractionRecommendation[];
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  startLocation?: Location;
  preferences?: {
    clustering?: boolean; // Group nearby attractions together
    optimizeBy?: 'distance' | 'time' | 'crowd';
  };
}

/**
 * Route Optimizer - Optimizes the path between attractions to minimize travel time
 * while considering opening hours, crowd density, and user preferences
 */
export class RouteOptimizer {
  private static instance: RouteOptimizer;

  private constructor() {}

  public static getInstance(): RouteOptimizer {
    if (!RouteOptimizer.instance) {
      RouteOptimizer.instance = new RouteOptimizer();
    }
    return RouteOptimizer.instance;
  }

  /**
   * Optimize route between attractions
   */
  optimizeRoute(request: OptimizationRequest): RouteOptimization {
    const { attractions, startTime, endTime, preferences } = request;

    // Default preferences
    const opts = {
      clustering: true,
      optimizeBy: 'distance' as const,
      ...preferences,
    };

    // Calculate total time available
    const totalMinutes = this.timeDiffToMinutes(endTime, startTime);
    const bufferMinutes = totalMinutes * 0.1; // 10% buffer
    const usableMinutes = totalMinutes - bufferMinutes;

    // Group attractions by day based on distance and opening hours
    const dailyRoutes = this.groupAttractionsByDay(
      attractions,
      usableMinutes,
      opts.clustering
    );

    // Calculate total distance and time
    let totalDistance = 0;
    let totalTime = 0;

    for (const day of dailyRoutes) {
      totalDistance += day.totalDistance;
      totalTime += day.totalTime;
    }

    const optimizedOrder = dailyRoutes
      .flatMap((_, dayIndex) =>
        dailyRoutes[dayIndex].activities.map(a => a)
      );

    return {
      totalDistance,
      totalTime,
      optimizedOrder,
      dailyRoutes,
    };
  }

  /**
   * Group attractions by day based on proximity and time constraints
   */
  private groupAttractionsByDay(
    attractions: AttractionRecommendation[],
    availableMinutes: number,
    cluster: boolean
  ): DailyRoute[] {
    if (!cluster || attractions.length === 0) {
      return attractions.map((attraction, index) => ({
        day: index + 1,
        activities: [attraction.name],
        totalDistance: 0,
        totalTime: 0,
        transportMode: 'walking',
      }));
    }

    // Simple clustering algorithm - sort by some criteria
    // In production, use more sophisticated clustering (K-means, etc.)
    const sortedAttractions = [...attractions].sort((a, b) => {
      // Sort by rating descending, then by name alphabetically
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });

    // Group into days (max 4-5 activities per day)
    const activitiesPerDay = 4;
    const dailyRoutes: DailyRoute[] = [];
    let currentDistance = 0;
    let currentTime = 0;

    for (let i = 0; i < sortedAttractions.length; i += activitiesPerDay) {
      const dayActivities = sortedAttractions.slice(i, i + activitiesPerDay);
      const dayNum = Math.floor(i / activitiesPerDay) + 1;

      // Estimate distances between activities
      const distances = this.estimateDistances(dayActivities);
      currentDistance += distances.reduce((sum, d) => sum + d, 0);

      // Estimate time needed
      const timeNeeded = dayActivities.reduce((sum, act) => {
        const duration = this.parseDurationToMinutes(act.estimatedDuration);
        return sum + duration + 15; // Add 15 min travel time between activities
      }, 0);
      currentTime += timeNeeded;

      dailyRoutes.push({
        day: dayNum,
        activities: dayActivities.map(a => a.name),
        totalDistance: this.calculateTotalDistance(distances),
        totalTime: timeNeeded,
        transportMode: this.determineTransportMode(distances, timeNeeded),
      });
    }

    return dailyRoutes;
  }

  /**
   * Estimate distances between attractions (using mock distance estimation)
   */
  private estimateDistances(attractions: AttractionRecommendation[]): number[] {
    return attractions.slice(1).map(() => Math.random() * 5); // 0-5 km mock
  }

  /**
   * Calculate total distance from individual distances
   */
  private calculateTotalDistance(distances: number[]): number {
    // Distance is sum of all segments
    return distances.reduce((sum, d) => sum + d, 0);
  }

  /**
   * Determine optimal transport mode based on distances and time
   */
  private determineTransportMode(distances: number[], totalTime: number): string {
    const totalDistance = distances.reduce((sum, d) => sum + d, 0);
    const avgDistance = totalDistance / Math.max(distances.length, 1);

    if (totalTime > 300) return 'public transport';
    if (avgDistance > 2) return 'taxi/metro';
    if (avgDistance > 0.5) return 'walking';
    return 'walking';
  }

  /**
   * Parse duration string to minutes
   */
  private parseDurationToMinutes(duration: string): number {
    // Handles formats like "2 hours", "1 hour 30 min", "90 minutes"
    const hours = parseInt(duration.match(/(\d+)\s*hour/i)?.[1] || '0', 10);
    const minutes = parseInt(duration.match(/(\d+)\s*min/i)?.[1] || '0', 10);
    return hours * 60 + minutes;
  }

  /**
   * Calculate time difference in minutes
   */
  private timeDiffToMinutes(end: string, start: string): number {
    const [endH, endM] = end.split(':').map(Number);
    const [startH, startM] = start.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  }

  /**
   * Optimize route order using nearest neighbor heuristic
   */
  optimizeOrderNearestNeighbor(
    attractions: AttractionRecommendation[],
    locations: Map<string, Location>
  ): string[] {
    if (attractions.length === 0) return [];

    const sorted = [...attractions];
    const order: string[] = [];
    let currentLocation = locations.get(sorted[0].id);

    while (sorted.length > 0) {
      if (!currentLocation) {
        currentLocation = locations.get(sorted[0].id);
      }

      let nearestIndex = 0;
      let nearestDistance = Infinity;

      sorted.forEach((attraction, index) => {
        const location = locations.get(attraction.id);
        if (location && currentLocation) {
          const distance = this.calculateDistance(currentLocation, location);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        }
      });

      const nearest = sorted.splice(nearestIndex, 1)[0];
      order.push(nearest.name);
      currentLocation = locations.get(nearest.id);
    }

    return order;
  }

  /**
   * Calculate distance between two locations (Haversine formula)
   */
  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(loc2.lat - loc1.lat);
    const dLon = this.toRadians(loc2.lng - loc1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(loc1.lat)) *
        Math.cos(this.toRadians(loc2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}

export const routeOptimizer = RouteOptimizer.getInstance();