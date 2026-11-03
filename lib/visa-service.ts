export type VisaType = "visa_free" | "visa_on_arrival" | "e_visa" | "embassy_visa" | "eta";

export interface VisaRequirement {
  passportCountry: string;
  destinationCountry: string;
  visaRequired: boolean;
  visaType: VisaType;
  maxStayDays: number;
  processingDays?: number;
  feeAmount?: number;
  feeCurrency?: string;
  requiredDocuments: string[];
  passportValidityRequiredMonths: number;
  officialUrl?: string;
  notes?: string;
}

export interface PassportCheckResult {
  isExpiringSoon: boolean;
  monthsRemaining: number;
  satisfiesRequirement: boolean;
  warningMessage?: string;
}

const VISA_RULES: Record<string, VisaRequirement> = {
  "US:Japan": {
    passportCountry: "US",
    destinationCountry: "Japan",
    visaRequired: false,
    visaType: "visa_free",
    maxStayDays: 90,
    requiredDocuments: ["Valid Passport", "Return Flight Ticket"],
    passportValidityRequiredMonths: 6,
    officialUrl: "https://www.mofa.go.jp/j_info/visit/visa/",
    notes: "Tourism or business up to 90 days visa-free.",
  },
  "US:France": {
    passportCountry: "US",
    destinationCountry: "France",
    visaRequired: false,
    visaType: "eta",
    maxStayDays: 90,
    requiredDocuments: ["Valid Passport", "ETIAS (online travel authorization)"],
    passportValidityRequiredMonths: 3,
    officialUrl: "https://travel-europe.europa.eu/etias_en",
    notes: "Schengen 90/180 rule applies.",
  },
  "US:Indonesia": {
    passportCountry: "US",
    destinationCountry: "Indonesia",
    visaRequired: true,
    visaType: "e_visa",
    maxStayDays: 30,
    processingDays: 2,
    feeAmount: 35,
    feeCurrency: "USD",
    requiredDocuments: ["Valid Passport", "Return Ticket", "Proof of Funds"],
    passportValidityRequiredMonths: 6,
    officialUrl: "https://molina.imigrasi.go.id/",
    notes: "e-VOA available online or on arrival at Ngurah Rai Bali.",
  },
  "UK:France": {
    passportCountry: "UK",
    destinationCountry: "France",
    visaRequired: false,
    visaType: "visa_free",
    maxStayDays: 90,
    requiredDocuments: ["Valid Passport"],
    passportValidityRequiredMonths: 3,
    notes: "Post-Brexit: 90 days within any 180-day period.",
  },
  "IN:Thailand": {
    passportCountry: "India",
    destinationCountry: "Thailand",
    visaRequired: false,
    visaType: "visa_free",
    maxStayDays: 30,
    requiredDocuments: ["Valid Passport", "Proof of 10,000 THB per person", "Confirmed return ticket"],
    passportValidityRequiredMonths: 6,
    officialUrl: "https://www.thaiembassy.com/",
    notes: "Temporary visa exemption for Indian passport holders.",
  },
};

export class VisaService {
  static checkRequirement(passportCountry: string, destinationCountry: string): VisaRequirement {
    const key = `${passportCountry.trim()}:${destinationCountry.trim()}`;
    if (VISA_RULES[key]) return VISA_RULES[key];

    // Generic fallback rule
    return {
      passportCountry,
      destinationCountry,
      visaRequired: false,
      visaType: "visa_free",
      maxStayDays: 90,
      requiredDocuments: ["Valid Passport (at least 6 months validity)", "Return Ticket"],
      passportValidityRequiredMonths: 6,
      notes: "Standard reciprocal tourist entry rules apply. Verify with local embassy before travel.",
    };
  }

  static checkPassportExpiry(expiryDateStr: string, requiredValidityMonths = 6): PassportCheckResult {
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    const diffMonths = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

    const satisfiesRequirement = diffMonths >= requiredValidityMonths;
    const isExpiringSoon = diffMonths <= 9;

    let warningMessage: string | undefined;
    if (!satisfiesRequirement) {
      warningMessage = `Passport expires in ${Math.max(0, Math.round(diffMonths))} months, which violates the ${requiredValidityMonths}-month validity rule for entry.`;
    } else if (isExpiringSoon) {
      warningMessage = `Passport valid for ${Math.round(diffMonths)} months. Consider renewing soon before multi-destination transit.`;
    }

    return {
      isExpiringSoon,
      monthsRemaining: Math.max(0, Math.round(diffMonths)),
      satisfiesRequirement,
      warningMessage,
    };
  }

  checkRequirement = VisaService.checkRequirement.bind(VisaService);
  checkPassportExpiry = VisaService.checkPassportExpiry.bind(VisaService);
}

export const visaService = new VisaService();

