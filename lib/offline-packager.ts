export interface EmergencyContact {
  label: string;
  number: string;
  type: "police" | "medical" | "embassy" | "tourist_helpline";
}

export interface OfflineBundle {
  bundleId: string;
  tripId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  validUntil: string;
  emergencyContacts: EmergencyContact[];
  reservations: {
    confirmationCode: string;
    type: "flight" | "hotel" | "activity";
    provider: string;
    details: string;
  }[];
  offlineHtmlSummary: string;
}

export class OfflinePackager {
  static createOfflineBundle(trip: {
    tripId: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
  }): OfflineBundle {
    const generatedAt = new Date();
    const validUntil = new Date(generatedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    const emergencyContacts: EmergencyContact[] = [
      { label: "Emergency Services", number: "112", type: "police" },
      { label: "Medical Helpline", number: "15", type: "medical" },
      { label: "Tourist Information & Assistance", number: "+33 1 49 52 42 63", type: "tourist_helpline" },
      { label: "US Citizen Services Embassy", number: "+33 1 43 12 22 22", type: "embassy" },
    ];

    const reservations = [
      {
        confirmationCode: `RES-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        type: "hotel" as const,
        provider: "Central Boutique Lodging",
        details: `Check-in: ${trip.startDate}, Check-out: ${trip.endDate}`,
      },
    ];

    const offlineHtmlSummary = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Offline Travel Guide - ${trip.title}</title>
        <style>
          body { font-family: sans-serif; padding: 24px; color: #111; line-height: 1.5; }
          h1 { color: #0284c7; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <h1>Offline Travel Plan: ${trip.title}</h1>
        <p><strong>Destination:</strong> ${trip.destination}</p>
        <p><strong>Dates:</strong> ${trip.startDate} - ${trip.endDate}</p>
        <div class="card">
          <h2>Emergency Contacts</h2>
          ${emergencyContacts.map((c) => `<p>• ${c.label}: <strong>${c.number}</strong></p>`).join("")}
        </div>
      </body>
      </html>
    `.trim();

    return {
      bundleId: `bundle_${Date.now()}`,
      tripId: trip.tripId,
      title: trip.title,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      generatedAt: generatedAt.toISOString(),
      validUntil: validUntil.toISOString(),
      emergencyContacts,
      reservations,
      offlineHtmlSummary,
    };
  }

  createOfflineBundle = OfflinePackager.createOfflineBundle.bind(OfflinePackager);
}

export const offlinePackager = new OfflinePackager();

