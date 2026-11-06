'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LeadSubmission } from '@/lib/submissionsStore';

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
  wrong_mix: 'Whether investments are right',
  high_fees: 'Overpaying in fees',
  scattered_accounts: 'Money scattered in too many places',
  tax_drag: 'No tax strategy',
  family_protection: 'Family not protected',
  other: 'Other considerations',
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

interface Props {
  initialSubmissions: LeadSubmission[];
}

export default function AdminDashboardClient({ initialSubmissions }: Props) {
  const [submissions, setSubmissions] = useState<LeadSubmission[]>(initialSubmissions || []);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'booked' | 'eligible'>('all');
  const [search, setSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<LeadSubmission | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/submissions?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.submissions)) {
        setSubmissions(data.submissions);
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

  const filtered = (submissions || []).filter((sub) => {
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

  const bookedCount = (submissions || []).filter((s) => s.stage === 'appointment_booked').length;
  const eligibleCount = (submissions || []).filter((s) => s.stage === 'eligibility_passed').length;

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        color: '#000000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          padding: '16px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#000000',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              RR
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#000000' }}>
                  RangeRange Admin Portal
                </h1>
                <span
                  style={{
                    backgroundColor: '#dcfce7',
                    border: '1px solid #16a34a',
                    color: '#15803d',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: '9999px',
                  }}
                >
                  Live JSON Store
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#334155', fontWeight: 500 }}>
                Unlocked via 12 consecutive clicks on &quot;RangeRange&quot;
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={fetchData}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#000000',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="#000000"
                strokeWidth="2.5"
                style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
              Refresh Data
            </button>
            <Link
              href="/step/1"
              style={{
                borderRadius: '8px',
                backgroundColor: '#000000',
                color: '#ffffff',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              View Client Site &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main
        style={{
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '24px 20px',
          flex: 1,
          boxSizing: 'border-box',
        }}
      >
        {/* KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '2px solid #e2e8f0',
              borderRadius: '14px',
              padding: '18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Total Submissions
              </span>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
            </div>
            <div style={{ fontSize: '34px', fontWeight: 900, color: '#000000', marginTop: '6px' }}>
              {submissions.length}
            </div>
            <div style={{ fontSize: '12px', color: '#334155', marginTop: '4px', fontWeight: 600 }}>
              Saved in <code style={{ color: '#1d4ed8', fontWeight: 700 }}>data/submissions.json</code>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '2px solid #86efac',
              borderRadius: '14px',
              padding: '18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                Confirmed Appointments
              </span>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
            </div>
            <div style={{ fontSize: '34px', fontWeight: 900, color: '#14532d', marginTop: '6px' }}>
              {bookedCount}
            </div>
            <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px', fontWeight: 600 }}>
              Video call scheduled with advisor
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '2px solid #fde68a',
              borderRadius: '14px',
              padding: '18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
                Pre-Eligibility Leads
              </span>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#d97706' }} />
            </div>
            <div style={{ fontSize: '34px', fontWeight: 900, color: '#78350f', marginTop: '6px' }}>
              {eligibleCount}
            </div>
            <div style={{ fontSize: '12px', color: '#92400e', marginTop: '4px', fontWeight: 600 }}>
              Passed Step 9 eligibility evaluation
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>📁</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#000000' }}>
                Storage File: <span style={{ color: '#1d4ed8', fontFamily: 'monospace' }}>data/submissions.json</span>
              </div>
              <div style={{ fontSize: '12px', color: '#334155', fontWeight: 500 }}>
                All user inputs before eligibility and appointment bookings persist here in real time.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(submissions, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `RangeRange_Submissions_${Date.now()}.json`;
                a.click();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#000000',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Export JSON
            </button>

            <button
              onClick={async () => {
                const sampleName = ['David', 'Olivia', 'Ethan', 'Chloe', 'Lucas', 'Julian', 'Maya', 'Nolan', 'Zoe', 'Caleb'][Math.floor(Math.random() * 10)];
                const sampleLast = ['Bennett', 'Hayes', 'Cooper', 'Reynolds', 'Sinclair', 'Morrison', 'Keller', 'Patel', 'Lawson', 'Vaughn'][Math.floor(Math.random() * 10)];
                const randomSalt = Math.floor(1000 + Math.random() * 9000);
                await fetch('/api/submit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    firstName: sampleName,
                    lastName: sampleLast,
                    email: `${sampleName.toLowerCase()}.${sampleLast.toLowerCase()}.${randomSalt}@example.com`,
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#15803d',
                color: '#ffffff',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              + Create Sample Lead
            </button>
          </div>
        </div>

        {/* Filter and Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              backgroundColor: '#ffffff',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              padding: '4px',
              gap: '4px',
            }}
          >
            <button
              onClick={() => setFilter('all')}
              style={{
                border: 'none',
                borderRadius: '6px',
                padding: '7px 16px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: filter === 'all' ? '#000000' : 'transparent',
                color: filter === 'all' ? '#ffffff' : '#475569',
              }}
            >
              All Records ({submissions.length})
            </button>
            <button
              onClick={() => setFilter('booked')}
              style={{
                border: 'none',
                borderRadius: '6px',
                padding: '7px 16px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: filter === 'booked' ? '#15803d' : 'transparent',
                color: filter === 'booked' ? '#ffffff' : '#475569',
              }}
            >
              Booked ({bookedCount})
            </button>
            <button
              onClick={() => setFilter('eligible')}
              style={{
                border: 'none',
                borderRadius: '6px',
                padding: '7px 16px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: filter === 'eligible' ? '#b45309' : 'transparent',
                color: filter === 'eligible' ? '#ffffff' : '#475569',
              }}
            >
              Pre-Eligibility ({eligibleCount})
            </button>
          </div>

          <div>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '300px',
                borderRadius: '10px',
                border: '2px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#000000',
                padding: '9px 14px',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* High-Contrast Visible Table with Solid Black Text */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: '14px',
            overflowX: 'auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '13px',
              color: '#000000',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f1f5f9',
                  borderBottom: '2px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '12px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '14px 16px', color: '#000000' }}>Status</th>
                <th style={{ padding: '14px 16px', color: '#000000' }}>Client Name</th>
                <th style={{ padding: '14px 16px', color: '#000000' }}>Email & Phone</th>
                <th style={{ padding: '14px 16px', color: '#000000' }}>Pre-Eligibility Data</th>
                <th style={{ padding: '14px 16px', color: '#000000' }}>Appointment Slot</th>
                <th style={{ padding: '14px 16px', color: '#000000' }}>Date</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', color: '#000000' }}>Official PDF</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: '#000000', fontWeight: 700 }}>
                    No submissions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((sub, idx) => {
                  const fullName = `${sub.firstName || 'Client'} ${sub.lastName || ''}`.trim();
                  const iraLabel = sub.iraAmount ? IRA_MAP[sub.iraAmount] || sub.iraAmount : 'N/A';
                  const incomeLabel = sub.householdIncome ? INCOME_MAP[sub.householdIncome] || sub.householdIncome : 'N/A';
                  const focusFormatted = (sub.focusAreas || []).map((f) => FOCUS_MAP[f] || f).join(', ') || 'N/A';
                  const concernsFormatted = (sub.concerns || []).map((c) => CONCERN_MAP[c] || c).join(', ') || 'N/A';
                  const hasAppt = !!(sub.bookingDate && sub.bookingTime);

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSubmission(sub)}
                      style={{
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e2e8f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                      }}
                    >
                      {/* Status */}
                      <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                        {sub.stage === 'appointment_booked' ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: '#dcfce7',
                              border: '1.5px solid #16a34a',
                              color: '#14532d',
                              fontWeight: 900,
                              fontSize: '11px',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                            }}
                          >
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                backgroundColor: '#15803d',
                              }}
                            />
                            Booked Call
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: '#fef3c7',
                              border: '1.5px solid #d97706',
                              color: '#78350f',
                              fontWeight: 900,
                              fontSize: '11px',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                            }}
                          >
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                backgroundColor: '#b45309',
                              }}
                            />
                            Passed Eligibility
                          </span>
                        )}
                      </td>

                      {/* Client Name */}
                      <td style={{ padding: '16px', fontWeight: 800, color: '#000000', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#000000',
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {(sub.firstName || 'C').charAt(0).toUpperCase()}
                          </span>
                          <span style={{ color: '#000000', fontSize: '14px' }}>{fullName}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ color: '#000000', fontWeight: 800, fontSize: '13px' }}>
                            {sub.email || '—'}
                          </span>
                          <span style={{ color: '#334155', fontSize: '12px', fontWeight: 600 }}>
                            {sub.phone || 'No phone yet'}
                          </span>
                        </div>
                      </td>

                      {/* Pre-Eligibility Inputs */}
                      <td style={{ padding: '16px', maxWidth: '320px', color: '#000000' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div>
                            <span style={{ color: '#475569', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                              IRA:{' '}
                            </span>
                            <span style={{ color: '#1d4ed8', fontWeight: 900, fontSize: '13px' }}>{iraLabel}</span>
                          </div>
                          <div style={{ color: '#000000', fontSize: '12px', fontWeight: 600 }}>
                            <strong style={{ color: '#334155' }}>Focus:</strong> {focusFormatted}
                          </div>
                          <div style={{ color: '#334155', fontSize: '11px', fontWeight: 600 }}>
                            <strong>Income:</strong> {incomeLabel}
                          </div>
                        </div>
                      </td>

                      {/* Appointment Info */}
                      <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                        {hasAppt ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ color: '#15803d', fontWeight: 900, fontSize: '13px' }}>{sub.bookingDate}</span>
                            <span style={{ color: '#000000', fontSize: '12px', fontWeight: 700 }}>{sub.bookingTime}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#64748b', fontStyle: 'italic', fontWeight: 600 }}>Pending appointment</span>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '16px', color: '#000000', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {new Date(sub.createdAt || Date.now()).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        {new Date(sub.createdAt || Date.now()).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* PDF File */}
                      <td style={{ padding: '16px', textAlign: 'right', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                        {sub.pdfUrl ? (
                          <a
                            href={sub.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              borderRadius: '8px',
                              backgroundColor: '#000000',
                              color: '#ffffff',
                              padding: '7px 14px',
                              fontSize: '11px',
                              fontWeight: 800,
                              textDecoration: 'none',
                            }}
                          >
                            View PDF
                          </a>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Detail Slideover Modal */}
      {selectedSubmission && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '24px',
          }}
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              height: '90vh',
              backgroundColor: '#ffffff',
              border: '2px solid #cbd5e1',
              borderRadius: '16px',
              padding: '24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              color: '#000000',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: '16px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#1d4ed8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Submission Details
                </span>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#000000', margin: '4px 0 0 0' }}>
                  {selectedSubmission.firstName} {selectedSubmission.lastName}
                </h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                  ID: {selectedSubmission.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f1f5f9',
                  color: '#000000',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Pre-Eligibility section */}
            <div>
              <h3
                style={{
                  fontSize: '12px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  color: '#000000',
                  letterSpacing: '0.05em',
                  borderBottom: '2px solid #e2e8f0',
                  paddingBottom: '6px',
                  marginBottom: '12px',
                }}
              >
                Inputted Data (Steps 1–9)
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '13px',
                }}
              >
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ color: '#475569', fontSize: '11px', fontWeight: 800 }}>IRA Balance</div>
                  <div style={{ color: '#000000', fontWeight: 900, marginTop: '2px', fontSize: '14px' }}>
                    {selectedSubmission.iraAmount ? IRA_MAP[selectedSubmission.iraAmount] || selectedSubmission.iraAmount : 'N/A'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ color: '#475569', fontSize: '11px', fontWeight: 800 }}>Household Income</div>
                  <div style={{ color: '#000000', fontWeight: 900, marginTop: '2px', fontSize: '14px' }}>
                    {selectedSubmission.householdIncome ? INCOME_MAP[selectedSubmission.householdIncome] || selectedSubmission.householdIncome : 'N/A'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ color: '#475569', fontSize: '11px', fontWeight: 800 }}>Worked With Advisor?</div>
                  <div style={{ color: '#000000', fontWeight: 900, marginTop: '2px', fontSize: '14px' }}>
                    {selectedSubmission.hasHadAdvisor === 'yes' ? 'Yes, previously' : 'No'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ color: '#475569', fontSize: '11px', fontWeight: 800 }}>Household Composition</div>
                  <div style={{ color: '#000000', fontWeight: 900, marginTop: '2px', fontSize: '14px' }}>
                    {(selectedSubmission.household || []).join(', ') || 'Individual'}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ color: '#475569', fontSize: '11px', fontWeight: 800 }}>Focus Areas</div>
                  <div style={{ color: '#000000', fontWeight: 900, marginTop: '2px', fontSize: '14px' }}>
                    {(selectedSubmission.focusAreas || []).map((f) => FOCUS_MAP[f] || f).join(', ') || 'None selected'}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ color: '#475569', fontSize: '11px', fontWeight: 800 }}>Financial Concerns</div>
                  <div style={{ color: '#000000', fontWeight: 900, marginTop: '2px', fontSize: '14px' }}>
                    {(selectedSubmission.concerns || []).map((c) => CONCERN_MAP[c] || c).join(', ') || 'None specified'}
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment section */}
            <div>
              <h3
                style={{
                  fontSize: '12px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  color: '#000000',
                  letterSpacing: '0.05em',
                  borderBottom: '2px solid #e2e8f0',
                  paddingBottom: '6px',
                  marginBottom: '12px',
                }}
              >
                Appointment Information (Step 10)
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '13px',
                }}
              >
                <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ color: '#166534', fontSize: '11px', fontWeight: 800 }}>Booking Date</div>
                  <div style={{ color: '#14532d', fontWeight: 900, marginTop: '2px', fontSize: '14px' }}>
                    {selectedSubmission.bookingDate || 'Not booked yet'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ color: '#166534', fontSize: '11px', fontWeight: 800 }}>Booking Time</div>
                  <div style={{ color: '#14532d', fontWeight: 900, marginTop: '2px', fontSize: '14px' }}>
                    {selectedSubmission.bookingTime || 'Not booked yet'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ color: '#475569', fontSize: '11px', fontWeight: 800 }}>Phone Number</div>
                  <div style={{ color: '#000000', fontWeight: 900, marginTop: '2px', fontSize: '14px' }}>
                    {selectedSubmission.phone || 'N/A'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ color: '#475569', fontSize: '11px', fontWeight: 800 }}>SMS Consent</div>
                  <div style={{ color: '#000000', fontWeight: 900, marginTop: '2px', fontSize: '14px' }}>
                    {selectedSubmission.smsConsent !== false ? 'Yes (Opted In)' : 'No'}
                  </div>
                </div>
              </div>
            </div>

            {/* PDF CTA */}
            {selectedSubmission.pdfUrl && (
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: '16px',
                  borderTop: '2px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '12px', color: '#000000', fontWeight: 700 }}>Generated submission PDF document</span>
                <a
                  href={selectedSubmission.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    textDecoration: 'none',
                  }}
                >
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
