'use client';

import React, { useState } from 'react';
import { visaService, type VisaRequirement, type PassportCheckResult } from '@/lib/visa-service';

export default function VisaCheckerPage() {
  const [passportCountry, setPassportCountry] = useState('US');
  const [destinationCountry, setDestinationCountry] = useState('Japan');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [result, setResult] = useState<{
    requirement: VisaRequirement;
    passportCheck?: PassportCheckResult;
  } | null>(() => ({
    requirement: visaService.checkRequirement('US', 'Japan'),
  }));

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const req = visaService.checkRequirement(passportCountry, destinationCountry);
    let check: PassportCheckResult | undefined;
    if (passportExpiry) {
      check = visaService.checkPassportExpiry(passportExpiry, req.passportValidityRequiredMonths);
    }
    setResult({ requirement: req, passportCheck: check });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Visa & Passport Checker</h1>
        <p className="text-gray-600 mt-1">
          Verify entry regulations, document requirements, and passport validity before traveling
        </p>
      </header>

      {/* Form */}
      <form onSubmit={handleCheck} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passport Nationality</label>
            <select
              value={passportCountry}
              onChange={(e) => setPassportCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="US">United States (US)</option>
              <option value="UK">United Kingdom (UK)</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="India">India</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country</label>
            <select
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="Japan">Japan</option>
              <option value="France">France</option>
              <option value="Spain">Spain</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Thailand">Thailand</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry Date</label>
            <input
              type="date"
              value={passportExpiry}
              onChange={(e) => setPassportExpiry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
        >
          Check Requirements
        </button>
      </form>

      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {result.requirement.passportCountry} → {result.requirement.destinationCountry}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Maximum stay: {result.requirement.maxStayDays} days
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                result.requirement.visaRequired
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {result.requirement.visaRequired
                ? result.requirement.visaType.replace('_', ' ').toUpperCase()
                : 'VISA FREE'}
            </span>
          </div>

          {/* Passport Expiry Warning */}
          {result.passportCheck?.warningMessage && (
            <div
              className={`p-4 rounded-lg border text-sm ${
                !result.passportCheck.satisfiesRequirement
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <strong>⚠️ Passport Warning:</strong> {result.passportCheck.warningMessage}
            </div>
          )}

          {/* Required Documents */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Required Documents</h3>
            <ul className="space-y-1.5 text-sm text-gray-600">
              {result.requirement.requiredDocuments.map((doc, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span> {doc}
                </li>
              ))}
            </ul>
          </div>

          {/* Notes & Links */}
          {result.requirement.notes && (
            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              ℹ️ {result.requirement.notes}
            </p>
          )}

          {result.requirement.officialUrl && (
            <a
              href={result.requirement.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-blue-600 hover:underline font-medium"
            >
              Official Embassy & Visa Portal →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

