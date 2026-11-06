export interface ClientSubmissionData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  iraAmount: string;
  focusAreas: string[];
  hasHadAdvisor: string;
  concerns: string[];
  otherConcern?: string;
  household: string[];
  householdIncome: string;
  bookingDate: string;
  bookingTime: string;
  smsConsent?: boolean;
}

const IRA_MAP: Record<string, string> = {
  below_100k: 'Less than $100K',
  '100k_250k': '$100K - $249K',
  '250k_500k': '$250K - $499K',
  '500k_1m': '$500K - $999K',
  'over_1m': '$1M+',
};

const FOCUS_MAP: Record<string, string> = {
  investments: 'Investments',
  retirement: 'Retirement planning',
  taxes: 'Taxes',
  estate: 'Estate planning',
};

const CONCERN_MAP: Record<string, string> = {
  wrong_mix: "I'm not sure my investments are right",
  high_fees: "I feel like I'm overpaying in advisor or fund fees",
  scattered_accounts: 'My money is scattered across too many places',
  tax_drag: "I don't have a real tax strategy",
  family_protection: 'My family is not protected if something happens',
  other: 'Something else',
};

const INCOME_MAP: Record<string, string> = {
  Under150k: 'Under $150K',
  From150kTo250k: '$150K - $249K',
  From250kTo500k: '$250K - $499K',
  From500kTo1m: '$500K - $999K',
  Over1m: '$1M+',
};

function escapePdf(text: string): string {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

export function generatePdfBuffer(data: ClientSubmissionData): Buffer {
  const contentLines: string[] = [];

  // Top decorative brand header banner
  contentLines.push('0.06 0.08 0.12 rg'); // Deep navy slate background
  contentLines.push('0 705 612 87 re f');

  // Header Title
  contentLines.push('BT');
  contentLines.push('/F2 22 Tf');
  contentLines.push('1 1 1 rg');
  contentLines.push('40 750 Td');
  contentLines.push(`(${escapePdf('RangeRange Wealth Management')}) Tj`);
  contentLines.push('ET');

  // Header Subtitle
  contentLines.push('BT');
  contentLines.push('/F1 10 Tf');
  contentLines.push('0.7 0.85 1 rg');
  contentLines.push('40 732 Td');
  contentLines.push(`(${escapePdf('Client IRA Onboarding & Consultation Record | Status: ELIGIBLE')}) Tj`);
  contentLines.push('ET');

  // Timestamp and Recipient info in top banner
  contentLines.push('BT');
  contentLines.push('/F1 9 Tf');
  contentLines.push('0.8 0.8 0.8 rg');
  contentLines.push('40 716 Td');
  contentLines.push(`(${escapePdf(`Generated: ${new Date().toUTCString()} | Destination WhatsApp: 09076042815`)}) Tj`);
  contentLines.push('ET');

  // Prepare key-value rows
  const fullName = `${data.firstName || 'Drake'} ${data.lastName || 'Hampton'}`.trim();
  const iraLabel = IRA_MAP[data.iraAmount] || data.iraAmount || 'Less than $100K';
  const focusList = (data.focusAreas && data.focusAreas.length > 0)
    ? data.focusAreas.map(f => FOCUS_MAP[f] || f).join(', ')
    : 'Investments, Retirement planning';
  const advisorStatus = data.hasHadAdvisor === 'yes' ? 'Yes, has worked with an advisor' : 'No previous advisor';
  const concernList = (data.concerns && data.concerns.length > 0)
    ? data.concerns.map(c => c === 'other' && data.otherConcern ? `Other: ${data.otherConcern}` : CONCERN_MAP[c] || c).join(', ')
    : "I'm not sure my investments are right";
  const householdList = (data.household && data.household.length > 0)
    ? data.household.join(', ')
    : 'Individual';
  const incomeLabel = INCOME_MAP[data.householdIncome] || data.householdIncome || '$500K - $999K';
  const bookingInfo = `${data.bookingDate || 'Upcoming date'} at ${data.bookingTime || '2:30pm'} (GMT+1)`;

  const rows = [
    { section: '1. CLIENT CONTACT INFORMATION' },
    { label: 'Client Full Name', value: fullName },
    { label: 'Email Address', value: data.email || 'N/A' },
    { label: 'Phone Number', value: data.phone || 'N/A' },
    { label: 'SMS Notification Consent', value: data.smsConsent !== false ? 'Yes (Opted In)' : 'No' },

    { section: '2. FINANCIAL & IRA PROFILE' },
    { label: 'IRA Investable Assets', value: iraLabel },
    { label: 'Annual Household Income', value: incomeLabel },
    { label: 'Primary Focus Areas', value: focusList },
    { label: 'Prior Advisor Experience', value: advisorStatus },

    { section: '3. TEAM BRIEFING & PRIORITIES' },
    { label: 'Key Concerns / Priorities', value: concernList },
    { label: 'Household Structure', value: householdList },

    { section: '4. SCHEDULED CONSULTATION' },
    { label: 'Consultation Appointment', value: bookingInfo },
    { label: 'Meeting Format', value: '30-Minute Video Call with RangeRange Specialist' },
    { label: 'Target WhatsApp', value: '09076042815 (+234 907 604 2815)' },
  ];

  let y = 675;

  rows.forEach(item => {
    if (item.section) {
      y -= 6;
      // Section header background
      contentLines.push('0.93 0.95 0.98 rg');
      contentLines.push(`40 ${y - 4} 532 18 re f`);

      contentLines.push('BT');
      contentLines.push('/F2 10 Tf');
      contentLines.push('0.15 0.25 0.45 rg');
      contentLines.push(`46 ${y + 1} Td`);
      contentLines.push(`(${escapePdf(item.section)}) Tj`);
      contentLines.push('ET');
      y -= 22;
    } else {
      // Row Label
      contentLines.push('BT');
      contentLines.push('/F2 10 Tf');
      contentLines.push('0.3 0.35 0.4 rg');
      contentLines.push(`46 ${y} Td`);
      contentLines.push(`(${escapePdf(item.label || '')}:) Tj`);
      contentLines.push('ET');

      // Row Value
      contentLines.push('BT');
      contentLines.push('/F1 10.5 Tf');
      contentLines.push('0.05 0.05 0.08 rg');
      contentLines.push(`210 ${y} Td`);
      contentLines.push(`(${escapePdf(item.value || 'N/A')}) Tj`);
      contentLines.push('ET');

      // Divider line
      contentLines.push('0.9 0.9 0.92 RG');
      contentLines.push('0.5 w');
      contentLines.push(`40 ${y - 5} m 572 ${y - 5} l S`);

      y -= 22;
    }
  });

  // Footer Disclaimer
  contentLines.push('BT');
  contentLines.push('/F1 8 Tf');
  contentLines.push('0.5 0.5 0.55 rg');
  contentLines.push('40 32 Td');
  contentLines.push(`(${escapePdf('RangeRange Advisory, LLC | Confidential Lead Record for 09076042815 | All Rights Reserved')}) Tj`);
  contentLines.push('ET');

  const streamContent = contentLines.join('\n');
  const streamLength = Buffer.byteLength(streamContent);

  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`,
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`,
    `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`,
  ];

  let offset = 0;
  const offsets: number[] = [];
  let pdf = `%PDF-1.4\n`;
  offset = Buffer.byteLength(pdf);

  objects.forEach(obj => {
    offsets.push(offset);
    pdf += obj + '\n';
    offset = Buffer.byteLength(pdf);
  });

  const xrefOffset = offset;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(off => {
    pdf += String(off).padStart(10, '0') + ` 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf);
}
