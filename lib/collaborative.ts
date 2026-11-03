import { supabase } from '@/lib/supabase';

export interface CollaborationVote {
  id: string;
  userId: string;
  userName: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'activity';
  itemId: string;
  itemTitle: string;
  upvote: boolean;
  createdAt: string;
}

export interface CollaborationSession {
  id: string;
  tripId: string;
  title: string;
  createdBy: string;
  participants: CollaborationParticipant[];
  votes: CollaborationVote[];
  createdAt: string;
  updatedAt: string;
}

export interface CollaborationParticipant {
  userId: string;
  userName: string;
  role: 'organizer' | 'contributor' | 'viewer';
  joinedAt: string;
  preferences?: {
    travelStyle?: 'budget' | 'moderate' | 'luxury';
    pace?: 'relaxed' | 'moderate' | 'packed';
    dietaryRestrictions?: string[];
  };
}

export interface PollOption {
  id: string;
  title: string;
  votes: number;
  voters: string[]; // userIds who voted
}

/**
 * Collaborative Trip Planning Engine - Enables multiple users to plan trips together
 * Supports both in-memory mock mode and Supabase real-time mode
 */
export class CollaborativePlanningEngine {
  private static sessions: CollaborationSession[] = [];
  private static readonly USE_REAL_API = process.env.NEXT_PUBLIC_USE_SUPABASE === "true";

  /**
   * Create a new collaboration session
   */
  static createSession(tripId: string, title: string, createdBy: string): CollaborationSession {
    const newSession: CollaborationSession = {
      id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tripId,
      title,
      createdBy,
      participants: [{
        userId: createdBy,
        userName: createdBy,
        role: 'organizer',
        joinedAt: new Date().toISOString(),
      }],
      votes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.USE_REAL_API) {
      // Save to Supabase
      this.saveSessionToSupabase(newSession);
    } else {
      // Save to in-memory store
      CollaborativePlanningEngine.sessions.push(newSession);
    }

    return newSession;
  }

  /**
   * Get a collaboration session by ID
   */
  static async getSession(sessionId: string): Promise<CollaborationSession | undefined> {
    if (this.USE_REAL_API) {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      if (error || !data) return this.getSessionFromMemory(sessionId);
      return data as CollaborationSession;
    }
    return this.getSessionFromMemory(sessionId);
  }

  /**
   * Get session by trip ID
   */
  static async getSessionByTripId(tripId: string): Promise<CollaborationSession | undefined> {
    if (this.USE_REAL_API) {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('trip_id', tripId)
        .single();
      if (error || !data) return this.getSessionFromMemoryByTripId(tripId);
      return data as CollaborationSession;
    }
    return this.getSessionFromMemoryByTripId(tripId);
  }

  /**
   * Add a participant to a session
   */
  static addParticipant(
    sessionId: string,
    userId: string,
    userName: string,
    role: 'organizer' | 'contributor' | 'viewer'
  ): CollaborationSession | undefined {
    const session = this.getSessionFromMemory(sessionId);

    if (!session) return undefined;

    // Check if participant already exists
    const existing = session.participants.find(
      (p) => p.userId === userId
    );

    if (existing) {
      // Update role if changed
      existing.role = role;
      existing.joinedAt = new Date().toISOString();
    } else {
      session.participants.push({
        userId,
        userName,
        role,
        joinedAt: new Date().toISOString(),
      });
    }

    session.updatedAt = new Date().toISOString();

    if (this.USE_REAL_API) {
      // Save updated session to Supabase
      this.saveSessionToSupabase(session);
    } else {
      // Update in-memory store
      const idx = CollaborativePlanningEngine.sessions.findIndex(
        (s) => s.id === sessionId
      );
      if (idx !== -1) {
        CollaborativePlanningEngine.sessions[idx] = session;
      }
    }

    return session;
  }

  /**
   * Cast a vote on an item
   */
  static castVote(
    sessionId: string,
    userId: string,
    userName: string,
    type: 'attraction' | 'restaurant' | 'hotel' | 'activity',
    itemId: string,
    itemTitle: string,
    upvote: boolean
  ): CollaborationVote | undefined {
    const session = this.getSessionFromMemory(sessionId);

    if (!session) return undefined;

    // Check if user already voted on this item
    const existingVote = session.votes.find(
      (v) => v.userId === userId && v.itemId === itemId
    );

    if (existingVote) {
      // Toggle vote
      existingVote.upvote = upvote;
    } else {
      // Add new vote
      const newVote: CollaborationVote = {
        id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        userName,
        type,
        itemId,
        itemTitle,
        upvote,
        createdAt: new Date().toISOString(),
      };
      session.votes.push(newVote);
    }

    session.updatedAt = new Date().toISOString();

    if (this.USE_REAL_API) {
      // Save updated session to Supabase
      this.saveSessionToSupabase(session);
    } else {
      // Update in-memory store
      const idx = CollaborativePlanningEngine.sessions.findIndex(
        (s) => s.id === sessionId
      );
      if (idx !== -1) {
        CollaborativePlanningEngine.sessions[idx] = session;
      }
    }

    return session.votes.find(
      (v) => v.userId === userId && v.itemId === itemId
    );
  }

  /**
   * Get poll results for an item type
   */
  static getPollResults(
    sessionId: string,
    type: 'attraction' | 'restaurant' | 'hotel' | 'activity'
  ): { option: string; yesVotes: number; totalVotes: number }[] {
    const session = this.getSessionFromMemory(sessionId);

    if (!session) return [];

    // Group votes by item title
    const itemVotes = session.votes
      .filter((v) => v.type === type)
      .reduce((acc, vote) => {
        if (!acc[vote.itemTitle]) {
          acc[vote.itemTitle] = { yesVotes: 0, totalVotes: 0, voters: [] };
        }
        acc[vote.itemTitle].totalVotes++;
        if (vote.upvote) acc[vote.itemTitle].yesVotes++;
        acc[vote.itemTitle].voters.push(vote.userId);
        return acc;
      }, {} as Record<string, { yesVotes: number; totalVotes: number; voters: string[] }>);

    return Object.entries(itemVotes).map(
      ([option, data]) => ({
        option,
        yesVotes: data.yesVotes,
        totalVotes: data.totalVotes,
      })
    );
  }

  /**
   * Get consensus (items with majority support)
   */
  static getConsensus(
    sessionId: string,
    type: 'attraction' | 'restaurant' | 'hotel' | 'activity'
  ): { item: string; yesVotes: number; totalVotes: number; percentage: number }[] {
    const results = this.getPollResults(sessionId, type);
    return results
      .filter((r) => r.totalVotes >= 1)
      .map((r) => ({
        item: r.option,
        yesVotes: r.yesVotes,
        totalVotes: r.totalVotes,
        percentage: Math.round((r.yesVotes / r.totalVotes) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }

  /**
   * End a session and finalize the itinerary
   */
  static finalizeSession(sessionId: string): CollaborationSession | undefined {
    const session = this.getSessionFromMemory(sessionId);

    if (!session) return undefined;

    // Mark session as finalized - in a real app, this would generate the final itinerary
    session.updatedAt = new Date().toISOString();

    if (this.USE_REAL_API) {
      // Save finalized session to Supabase
      this.saveSessionToSupabase(session);
    }

    return session;
  }

  /**
   * Get session from in-memory store
   */
  private static getSessionFromMemory(sessionId: string): CollaborationSession | undefined {
    return CollaborativePlanningEngine.sessions.find(
      (session) => session.id === sessionId
    );
  }

  /**
   * Get session from in-memory store by trip ID
   */
  private static getSessionFromMemoryByTripId(tripId: string): CollaborationSession | undefined {
    return CollaborativePlanningEngine.sessions.find(
      (session) => session.tripId === tripId
    );
  }

  /**
   * Save session to Supabase (real API mode)
   */
  private static async saveSessionToSupabase(session: CollaborationSession): Promise<void> {
    try {
      const { error } = await supabase
        .from('collaboration_sessions')
        .upsert({
          id: session.id,
          trip_id: session.tripId,
          title: session.title,
          created_by: session.createdBy,
          participants: session.participants,
          votes: session.votes,
          created_at: session.createdAt,
          updated_at: session.updatedAt,
        });

      if (error) throw error;
      console.log('Session saved to Supabase:', session.id);
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      // Fall back to in-memory
      const idx = CollaborativePlanningEngine.sessions.findIndex(
        (s) => s.id === session.id
      );
      if (idx !== -1) {
        CollaborativePlanningEngine.sessions[idx] = session;
      }
    }
  }

  createSession = CollaborativePlanningEngine.createSession.bind(CollaborativePlanningEngine);
  getSession = CollaborativePlanningEngine.getSession.bind(CollaborativePlanningEngine);
  getSessionByTripId = CollaborativePlanningEngine.getSessionByTripId.bind(CollaborativePlanningEngine);
  addParticipant = CollaborativePlanningEngine.addParticipant.bind(CollaborativePlanningEngine);
  castVote = CollaborativePlanningEngine.castVote.bind(CollaborativePlanningEngine);
  getPollResults = CollaborativePlanningEngine.getPollResults.bind(CollaborativePlanningEngine);
  getConsensus = CollaborativePlanningEngine.getConsensus.bind(CollaborativePlanningEngine);
  finalizeSession = CollaborativePlanningEngine.finalizeSession.bind(CollaborativePlanningEngine);
}

export const collaborativeEngine = new CollaborativePlanningEngine();