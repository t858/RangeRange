import fs from 'fs';
import path from 'path';

export interface LeadSubmission {
  id: string;
  createdAt: string;
  updatedAt: string;
  stage: 'eligibility_passed' | 'appointment_booked';
  // Before eligibility data
  iraAmount?: string;
  focusAreas?: string[];
  firstName?: string;
  lastName?: string;
  hasHadAdvisor?: string;
  concerns?: string[];
  otherConcern?: string;
  household?: string[];
  householdIncome?: string;
  email?: string;
  // Appointment data
  bookingDate?: string;
  bookingTime?: string;
  phone?: string;
  smsConsent?: boolean;
  pdfUrl?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'submissions.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getAllSubmissions(): LeadSubmission[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading submissions.json:', e);
    return [];
  }
}

export function saveOrUpdateSubmission(data: Partial<LeadSubmission>): LeadSubmission {
  ensureDataFile();
  const list = getAllSubmissions();
  const now = new Date().toISOString();

  // If a specific record ID is provided (e.g. updating the same session from Step 9 to Step 10 booking)
  let existingIndex = -1;
  if (data.id) {
    existingIndex = list.findIndex(item => item.id === data.id);
  }

  let record: LeadSubmission;

  if (existingIndex >= 0) {
    // Updating the current session's appointment info on Step 10
    const cleanedUpdates = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    record = {
      ...list[existingIndex],
      ...cleanedUpdates,
      updatedAt: now,
      stage: data.stage || (data.bookingTime ? 'appointment_booked' : list[existingIndex].stage),
    };
    list[existingIndex] = record;
  } else {
    // ALWAYS create a brand new distinct submission entry on the dashboard
    // Every time anyone passes eligibility (even if using the same email or name as an existing user)
    const newId = data.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    record = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
      stage: data.stage || (data.bookingTime ? 'appointment_booked' : 'eligibility_passed'),
    };
    list.unshift(record);
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  return record;
}

export function clearAllSubmissions(): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
}
