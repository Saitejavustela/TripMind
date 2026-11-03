'use client';

import React, { useEffect, useState } from 'react';
import PreferenceForm from '@/components/PreferenceForm';

export default function ProfilePage() {
  const [preferences, setPreferences] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved preferences
    fetch('/api/preferences')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPreferences(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = (prefs: any) => {
    setPreferences(prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      </header>

      {saved && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          Preferences saved successfully!
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6 pb-4 border-b">
          <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
          <p className="text-gray-600">
            User preferences are stored locally in your browser and can be
            synced with your account when you sign in.
          </p>
        </div>

        <PreferenceForm onSave={handleSave} />
      </div>
    </div>
  );
}