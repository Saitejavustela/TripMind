'use client';

import React, { useEffect, useState } from 'react';
import {
  CollaborativePlanningEngine,
  type CollaborationSession,
  type CollaborationParticipant,
} from '@/lib/collaborative';

export default function CollaborationPage() {
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tripIdInput, setTripIdInput] = useState<string>('paris-summer');

  useEffect(() => {
    // Load session - in real app, this would be from URL params or auth
    const loadSession = async () => {
      try {
        const response = await fetch('/api/collaboration?tripId=paris-summer');
        const result = await response.json();

        if (result.success && result.data) {
          setSession(result.data);
        } else {
          // Initialize fallback demo session
          const demoSession = CollaborativePlanningEngine.createSession(
            'paris-summer',
            'Paris Summer Group Trip',
            'current-user'
          );
          setSession(demoSession);
        }
      } catch (err) {
        console.error('Error loading collaboration session:', err);
        const demoSession = CollaborativePlanningEngine.createSession(
          'paris-summer',
          'Paris Summer Group Trip',
          'current-user'
        );
        setSession(demoSession);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const handleVote = (itemId: string, itemTitle: string, type: 'attraction' | 'restaurant' | 'hotel' | 'activity') => {
    if (!session) return;
    CollaborativePlanningEngine.castVote(
      session.id,
      'current-user',
      'You',
      type,
      itemId,
      itemTitle,
      true
    );
    // Refresh session state
    const updated = CollaborativePlanningEngine.getSession(session.id);
    if (updated instanceof Promise) {
      updated.then((s) => s && setSession({ ...s }));
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Collaborative Trip Planning</h2>
        <p className="text-gray-600">Loading session...</p>
        <div className="animate-spin h-6 w-6 mx-auto my-4 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Collaborative Trip Planning</h2>
        <p className="text-gray-600">
          No active collaboration session found. Create a session to start planning
          with friends or family.
        </p>
        <div className="mt-8 bg-white p-6 rounded-lg max-w-md mx-auto shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4">Start a New Session</h3>
          <p className="text-gray-600 mb-6 text-sm">
            Collaborate with others to plan your perfect trip.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const newSession = CollaborativePlanningEngine.createSession(
                tripIdInput,
                `${tripIdInput.replace('-', ' ')} Trip`,
                'current-user'
              );
              setSession(newSession);
            }}
          >
            <div className="mb-4 text-left">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Trip ID
              </label>
              <input
                type="text"
                value={tripIdInput}
                onChange={(e) => setTripIdInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="mt-3 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
              >
                Join or Create Session
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const attractionResults = CollaborativePlanningEngine.getPollResults(session.id, 'attraction');

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {session.title || 'Trip Collaboration'}
        </h1>
        <p className="text-gray-600 mt-1">
          Collaborating with {session.participants.length} participants
        </p>
      </header>

      {/* Session Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Participants</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{session.participants.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Votes Cast</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{session.votes.length}</p>
        </div>
      </div>

      {/* Participants */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Participants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {session.participants.map((participant: CollaborationParticipant) => (
            <div
              key={participant.userId}
              className={`p-3 rounded-lg border ${
                participant.role === 'organizer'
                  ? 'border-blue-500 bg-blue-50/50'
                  : participant.role === 'contributor'
                    ? 'border-green-500 bg-green-50/50'
                    : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                  {participant.userName.slice(0, 1).toUpperCase()}
                </div>
                <span className="font-medium text-gray-900">{participant.userName}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">{participant.role.toUpperCase()}</p>
              <p className="text-xs text-gray-400">
                joined {new Date(participant.joinedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Voting on Attractions */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Vote on Attractions</h2>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Attraction Poll</h3>

          {attractionResults.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No votes recorded yet. Vote below to get started!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {attractionResults.map((result) => (
                <div
                  key={result.option}
                  className={`p-4 rounded-lg border ${
                    result.yesVotes > result.totalVotes / 2
                      ? 'border-green-500 bg-green-50/40'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">{result.option}</h4>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{result.yesVotes}</p>
                      <p className="text-xs text-gray-500">of {result.totalVotes} votes</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{
                        width: `${Math.round((result.yesVotes / Math.max(1, result.totalVotes)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Voting controls */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-3 font-medium">Cast your vote:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleVote('eiffel-tower', 'Eiffel Tower', 'attraction')}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
              >
                👍 Eiffel Tower
              </button>
              <button
                type="button"
                onClick={() => handleVote('louvre-museum', 'Louvre Museum', 'attraction')}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
              >
                👍 Louvre Museum
              </button>
              <button
                type="button"
                onClick={() => handleVote('notre-dame', 'Notre Dame Cathedral', 'attraction')}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
              >
                👍 Notre Dame
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Consensus */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Consensus Results</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['attraction', 'restaurant', 'hotel', 'activity'] as const).map((type) => {
            const consensus = CollaborativePlanningEngine.getConsensus(session.id, type);
            return (
              <div
                key={type}
                className={`p-4 rounded-lg border-l-4 bg-white shadow-sm border border-gray-100 ${
                  type === 'attraction'
                    ? 'border-l-blue-500'
                    : type === 'restaurant'
                      ? 'border-l-green-500'
                      : type === 'hotel'
                        ? 'border-l-purple-500'
                        : 'border-l-orange-500'
                }`}
              >
                <h3 className="font-semibold text-gray-800 mb-2 uppercase text-xs tracking-wider">
                  {type}
                </h3>
                {consensus.length === 0 ? (
                  <p className="text-gray-400 text-sm">No consensus reached yet</p>
                ) : (
                  <div className="space-y-3">
                    {consensus.map((item) => (
                      <div key={item.item} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-800">{item.item}</span>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {item.percentage}% ({item.yesVotes}/{item.totalVotes})
                          </p>
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
