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

  // Match existing record by email or name if updating appointment
  let existingIndex = -1;
  if (data.email) {
    existingIndex = list.findIndex(item => item.email && item.email.toLowerCase() === data.email?.toLowerCase());
  }
  if (existingIndex === -1 && data.firstName && data.lastName) {
    existingIndex = list.findIndex(item =>
      item.firstName?.toLowerCase() === data.firstName?.toLowerCase() &&
      item.lastName?.toLowerCase() === data.lastName?.toLowerCase()
    );
  }

  let record: LeadSubmission;

  if (existingIndex >= 0) {
    // Strip undefined keys from incoming data so we don't overwrite existing pre-eligibility fields
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
    // Create new record
    record = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
      stage: data.stage || (data.bookingTime ? 'appointment_booked' : 'eligibility_passed'),
      ...data,
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
