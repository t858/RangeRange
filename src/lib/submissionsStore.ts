import fs from 'fs';
import path from 'path';
import dns from 'dns';

// Ensure Node resolves IPv4 first on Windows to avoid getaddrinfo ENOTFOUND errors
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  throw new Error('Fetch failed after retries');
}

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

// JSONBin configuration from environment variables (with default fallback)
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || '6aef44deffd5d16053af4a8d';
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || '$2a$10$suA2R1NTVop/Ymsi6ZC.ieK1mJdWRV8G.J1CpUrg4ndgJpeMSC/dC';

export function isJsonBinConfigured(): boolean {
  return Boolean(JSONBIN_BIN_ID && JSONBIN_API_KEY);
}

export function getStorageInfo() {
  return {
    isConfigured: isJsonBinConfigured(),
    binId: JSONBIN_BIN_ID,
    source: isJsonBinConfigured() ? 'JSONBin.io' : 'Local File',
  };
}

// In-memory fallback cache so serverless executions don't wipe data between local calls
let inMemoryCache: LeadSubmission[] | null = null;

function ensureLocalDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    // Read-only filesystem on Vercel
  }
}

function getLocalSubmissions(): LeadSubmission[] {
  ensureLocalDataFile();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore read errors
  }
  return inMemoryCache || [];
}

function saveLocalSubmissions(list: LeadSubmission[]) {
  inMemoryCache = list;
  try {
    ensureLocalDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    // Vercel read-only filesystem; handled via inMemoryCache and JSONBin
  }
}

/**
 * Fetch all submissions asynchronously.
 * If JSONBin is configured, queries the remote JSONBin.
 * Otherwise falls back to local file / memory cache.
 */
export async function getAllSubmissionsAsync(): Promise<LeadSubmission[]> {
  if (isJsonBinConfigured()) {
    try {
      const res = await fetchWithRetry(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest?_t=${Date.now()}`, {
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        let list: LeadSubmission[] = [];
        if (Array.isArray(data.record)) {
          list = data.record;
        } else if (data.record && Array.isArray(data.record.submissions)) {
          list = data.record.submissions;
        }
        inMemoryCache = list;
        return list;
      } else {
        console.error('Failed to fetch from JSONBin:', res.status, await res.text());
      }
    } catch (e) {
      console.error('Failed to fetch from JSONBin:', e);
    }
  }
  return getLocalSubmissions();
}

/**
 * Synchronous read for initial SSR render.
 */
export function getAllSubmissions(): LeadSubmission[] {
  return inMemoryCache || getLocalSubmissions();
}

/**
 * Save or update a submission.
 * Saves to JSONBin if credentials exist, and also updates local file / in-memory cache.
 */
export async function saveOrUpdateSubmissionAsync(data: Partial<LeadSubmission>): Promise<LeadSubmission> {
  const list = await getAllSubmissionsAsync();
  const now = new Date().toISOString();

  // If a specific record ID is provided (e.g. updating the same session from Step 9 to Step 10 booking)
  let existingIndex = -1;
  if (data.id) {
    existingIndex = list.findIndex(item => item.id === data.id);
  } else if (data.email) {
    // If id not passed yet, check if there's a recent matching submission with same email created within last 30 minutes
    const thirtyMinsAgo = Date.now() - 30 * 60 * 1000;
    existingIndex = list.findIndex(item =>
      item.email?.toLowerCase() === data.email?.toLowerCase() &&
      new Date(item.createdAt).getTime() > thirtyMinsAgo
    );
  }

  let record: LeadSubmission;

  if (existingIndex >= 0) {
    // Updating the current session's appointment or lead info
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

  // Update local file / cache
  saveLocalSubmissions(list);

  // Sync to JSONBin in the cloud
  if (isJsonBinConfigured()) {
    try {
      const res = await fetchWithRetry(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
        },
        body: JSON.stringify({ submissions: list }),
      });
      if (!res.ok) {
        console.error(`Failed to sync to JSONBin (Status ${res.status}):`, await res.text());
      }
    } catch (e) {
      console.error('Failed to sync to JSONBin:', e);
    }
  }

  return record;
}

export function saveOrUpdateSubmission(data: Partial<LeadSubmission>): LeadSubmission {
  // Synchronous wrapper
  const list = getLocalSubmissions();
  const now = new Date().toISOString();

  let existingIndex = -1;
  if (data.id) {
    existingIndex = list.findIndex(item => item.id === data.id);
  }

  let record: LeadSubmission;

  if (existingIndex >= 0) {
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

  saveLocalSubmissions(list);
  return record;
}

export async function clearAllSubmissionsAsync(): Promise<void> {
  saveLocalSubmissions([]);
  if (isJsonBinConfigured()) {
    try {
      const res = await fetchWithRetry(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
        },
        body: JSON.stringify({ submissions: [] }),
      });
      if (!res.ok) {
        console.error(`Failed to clear JSONBin (Status ${res.status}):`, await res.text());
      }
    } catch (e) {
      console.error('Failed to clear JSONBin:', e);
    }
  }
}

export function clearAllSubmissions(): void {
  saveLocalSubmissions([]);
}
