'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface LeadSubmission {
  id: string;
  createdAt: string;
  updatedAt: string;
  stage: 'eligibility_passed' | 'appointment_booked';
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
  bookingDate?: string;
  bookingTime?: string;
  phone?: string;
  smsConsent?: boolean;
  pdfUrl?: string;
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
  retirement: 'Retirement',
  taxes: 'Tax planning',
  tax: 'Tax planning',
  estate: 'Estate planning',
};

const CONCERN_MAP: Record<string, string> = {
  wrong_mix: "Whether investments are right",
  high_fees: "Overpaying in fees",
  scattered_accounts: "Money scattered in too many places",
  tax_drag: "No tax strategy",
  family_protection: "Family not protected",
  other: "Other considerations",
};

const INCOME_MAP: Record<string, string> = {
  Under150k: 'Under $150K',
  From150kTo250k: '$150K - $249K',
  From250kTo500k: '$250K - $499K',
  From500kTo1m: '$500K - $999K',
  Over1m: '$1M+',
  Under200k: 'Under $200k',
  From200kTo300k: '$200k – $299k',
  From300kTo500k: '$300k – $499k',
};

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<LeadSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'booked' | 'eligible'>('all');
  const [search, setSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<LeadSubmission | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/submissions');
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = submissions.filter((sub) => {
    if (filter === 'booked' && sub.stage !== 'appointment_booked') return false;
    if (filter === 'eligible' && sub.stage !== 'eligibility_passed') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = `${sub.firstName || ''} ${sub.lastName || ''}`.toLowerCase();
      const email = (sub.email || '').toLowerCase();
      const phone = (sub.phone || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    }
    return true;
  });

  const bookedCount = submissions.filter(s => s.stage === 'appointment_booked').length;
  const eligibleCount = submissions.filter(s => s.stage === 'eligibility_passed').length;

  return (
    <div className="min-h-screen bg-[#0f1117] text-white antialiased flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-[#161922] sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold text-white shadow-lg shadow-blue-500/20">
              RR
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight">RangeRange Admin Portal</h1>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                  Live JSON Store
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Unlocked via 12 consecutive clicks on &quot;RangeRange&quot;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'animate-spin' : ''}>
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
              Refresh
            </button>
            <Link
              href="/step/1"
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              View Client Site &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-[#161922] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Submissions</span>
              <span className="size-2 rounded-full bg-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{submissions.length}</div>
            <div className="text-xs text-gray-400 mt-1">Saved in <code className="text-blue-400">data/submissions.json</code></div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Confirmed Appointments</span>
              <span className="size-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">{bookedCount}</div>
            <div className="text-xs text-emerald-400/70 mt-1">Video call scheduled with advisor</div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Pre-Eligibility Leads</span>
              <span className="size-2 rounded-full bg-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400">{eligibleCount}</div>
            <div className="text-xs text-amber-400/70 mt-1">Passed Step 9 eligibility evaluation</div>
          </div>

          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Target WhatsApp</span>
              <span className="size-2 rounded-full bg-indigo-400" />
            </div>
            <div className="text-xl font-bold text-indigo-300">09076042815</div>
            <div className="text-xs text-indigo-400/70 mt-1">International E.164: +234 907 604 2815</div>
          </div>
        </div>

        {/* Action Bar: Export JSON & Lead Generation shortcut */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161922] border border-white/10 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="size-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-sm">
              📊
            </span>
            <div>
              <div className="text-xs font-semibold text-white">JSON Storage File: <span className="text-blue-400 font-mono">data/submissions.json</span></div>
              <div className="text-[11px] text-gray-400">All submissions & appointments automatically sync here in real time.</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(submissions, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `RangeRange_Submissions_${Date.now()}.json`;
                a.click();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7l7-7zM5 18v2h14v-2H5z" />
              </svg>
              Export JSON
            </button>

            <button
              onClick={async () => {
                const sampleName = ['David', 'Olivia', 'Ethan', 'Chloe', 'Lucas'][Math.floor(Math.random() * 5)];
                const sampleLast = ['Bennett', 'Hayes', 'Cooper', 'Reynolds', 'Sinclair'][Math.floor(Math.random() * 5)];
                await fetch('/api/submit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    firstName: sampleName,
                    lastName: sampleLast,
                    email: `${sampleName.toLowerCase()}.${sampleLast.toLowerCase()}@example.com`,
                    phone: `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
                    iraAmount: '500k_1m',
                    focusAreas: ['investments', 'taxes'],
                    hasHadAdvisor: 'yes',
                    concerns: ['wrong_mix'],
                    household: ['Partner', 'Dependents'],
                    householdIncome: 'From300kTo500k',
                    bookingDate: 'Wednesday, November 11th',
                    bookingTime: '3:00pm',
                    stage: 'appointment_booked',
                  }),
                });
                fetchData();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
            >
              + Create Sample Lead
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5 bg-[#161922] border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              All Records ({submissions.length})
            </button>
            <button
              onClick={() => setFilter('booked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'booked' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Booked ({bookedCount})
            </button>
            <button
              onClick={() => setFilter('eligible')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'eligible' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Pre-Eligibility ({eligibleCount})
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submissions Table */}
        <div className="rounded-2xl border border-white/10 bg-[#161922] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-semibold">Status / Stage</th>
                  <th className="py-3.5 px-4 font-semibold">Client Name</th>
                  <th className="py-3.5 px-4 font-semibold">Contact (Email & Phone)</th>
                  <th className="py-3.5 px-4 font-semibold">Pre-Eligibility Inputs (IRA & Focus)</th>
                  <th className="py-3.5 px-4 font-semibold">Appointment Info</th>
                  <th className="py-3.5 px-4 font-semibold">Date Submitted</th>
                  <th className="py-3.5 px-4 font-semibold text-right">PDF File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      Loading data from submissions.json...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No submissions found. Submit an onboarding application to see it stored here.
                    </td>
                  </tr>
                ) : (
                  filtered.map((sub) => {
                    const fullName = `${sub.firstName || 'Client'} ${sub.lastName || ''}`.trim();
                    const iraLabel = sub.iraAmount ? (IRA_MAP[sub.iraAmount] || sub.iraAmount) : 'N/A';
                    const incomeLabel = sub.householdIncome ? (INCOME_MAP[sub.householdIncome] || sub.householdIncome) : 'N/A';
                    const focusFormatted = (sub.focusAreas || []).map(f => FOCUS_MAP[f] || f).join(', ') || 'N/A';
                    const concernsFormatted = (sub.concerns || []).map(c => CONCERN_MAP[c] || c).join(', ') || 'N/A';
                    const hasAppt = !!(sub.bookingDate && sub.bookingTime);

                    return (
                      <tr
                        key={sub.id}
                        onClick={() => setSelectedSubmission(sub)}
                        className="hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {sub.stage === 'appointment_booked' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                              <span className="size-1.5 rounded-full bg-emerald-400" />
                              Booked Call
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[11px] font-semibold text-amber-400">
                              <span className="size-1.5 rounded-full bg-amber-400" />
                              Passed Eligibility
                            </span>
                          )}
                        </td>

                        {/* Client Name */}
                        <td className="py-4 px-4 font-semibold text-white whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="flex size-7 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 font-bold text-xs">
                              {(sub.firstName || 'C').charAt(0).toUpperCase()}
                            </span>
                            <span>{fullName}</span>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-200 font-medium">{sub.email || '—'}</span>
                            <span className="text-gray-400 text-[11px]">{sub.phone || 'No phone yet'}</span>
                          </div>
                        </td>

                        {/* Pre-Eligibility Inputs */}
                        <td className="py-4 px-4 max-w-xs">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-400 text-[10px] uppercase">IRA:</span>
                              <span className="font-semibold text-blue-300">{iraLabel}</span>
                            </div>
                            <div className="text-[11px] text-gray-300 truncate" title={`Focus: ${focusFormatted} | Concerns: ${concernsFormatted}`}>
                              Focus: {focusFormatted}
                            </div>
                            <div className="text-[11px] text-gray-400 truncate">
                              Income: {incomeLabel}
                            </div>
                          </div>
                        </td>

                        {/* Appointment Info */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {hasAppt ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-emerald-400">{sub.bookingDate}</span>
                              <span className="text-gray-400 text-[11px]">{sub.bookingTime}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">Pending appointment</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-gray-400 whitespace-nowrap text-[11px]">
                          {new Date(sub.createdAt || Date.now()).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        {/* PDF Link */}
                        <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {sub.pdfUrl ? (
                            <a
                              href={sub.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-blue-400 hover:bg-white/10 hover:text-blue-300 transition-colors"
                            >
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                <path d="M19 9h-4V3H9v6H5l7 7l7-7zM5 18v2h14v-2H5z" />
                              </svg>
                              View PDF
                            </a>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Detail Slideover Modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-end p-4 sm:p-6"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="w-full max-w-xl h-full max-h-[90vh] bg-[#161922] border border-white/15 rounded-2xl p-6 overflow-y-auto flex flex-col gap-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                  Lead Submission Details
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {selectedSubmission.firstName} {selectedSubmission.lastName}
                </h2>
                <p className="text-xs text-gray-400">ID: {selectedSubmission.id}</p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="size-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Section 1: Pre-Eligibility Data */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-white/5 pb-1">
                Pre-Eligibility Data (Before Step 9)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                  <div className="text-gray-400 text-[11px]">IRA Investable Amount</div>
                  <div className="font-semibold text-white mt-0.5">
                    {IRA_MAP[selectedSubmission.iraAmount || ''] || selectedSubmission.iraAmount || 'N/A'}
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                  <div className="text-gray-400 text-[11px]">Household Income</div>
                  <div className="font-semibold text-white mt-0.5">
                    {INCOME_MAP[selectedSubmission.householdIncome || ''] || selectedSubmission.householdIncome || 'N/A'}
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                  <div className="text-gray-400 text-[11px]">Email Address</div>
                  <div className="font-semibold text-white mt-0.5">{selectedSubmission.email || 'N/A'}</div>
                </div>

                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                  <div className="text-gray-400 text-[11px]">Had Financial Advisor?</div>
                  <div className="font-semibold text-white mt-0.5">
                    {selectedSubmission.hasHadAdvisor === 'yes' ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5 text-xs">
                <div className="text-gray-400 text-[11px]">Focus Areas</div>
                <div className="font-semibold text-white mt-0.5">
                  {(selectedSubmission.focusAreas || []).map(f => FOCUS_MAP[f] || f).join(', ') || 'N/A'}
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5 text-xs">
                <div className="text-gray-400 text-[11px]">Key Concerns</div>
                <div className="font-semibold text-white mt-0.5">
                  {(selectedSubmission.concerns || []).map(c => CONCERN_MAP[c] || c).join(', ') || 'N/A'}
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5 text-xs">
                <div className="text-gray-400 text-[11px]">Household Composition</div>
                <div className="font-semibold text-white mt-0.5">
                  {(selectedSubmission.household || []).join(', ') || 'Individual'}
                </div>
              </div>
            </div>

            {/* Section 2: Appointment Data */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-white/5 pb-1">
                Appointment Information (Step 10 Booking)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/20 p-3">
                  <div className="text-emerald-400 text-[11px]">Scheduled Date</div>
                  <div className="font-semibold text-emerald-300 mt-0.5">
                    {selectedSubmission.bookingDate || 'Not booked yet'}
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/20 p-3">
                  <div className="text-emerald-400 text-[11px]">Scheduled Time</div>
                  <div className="font-semibold text-emerald-300 mt-0.5">
                    {selectedSubmission.bookingTime || 'Not booked yet'}
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                  <div className="text-gray-400 text-[11px]">Phone Number</div>
                  <div className="font-semibold text-white mt-0.5">
                    {selectedSubmission.phone || 'N/A'}
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                  <div className="text-gray-400 text-[11px]">SMS Consent</div>
                  <div className="font-semibold text-white mt-0.5">
                    {selectedSubmission.smsConsent !== false ? 'Opted In' : 'No'}
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Action */}
            {selectedSubmission.pdfUrl && (
              <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-400">Generated PDF document ready</span>
                <a
                  href={selectedSubmission.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors inline-flex items-center gap-2"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7l7-7zM5 18v2h14v-2H5z" />
                  </svg>
                  Open Official PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
