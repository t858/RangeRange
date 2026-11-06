'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Footer from './Footer';
import RangeLogo from './RangeLogo';

interface BookingConfirmationProps {
  bookingDate: string;
  bookingTime: string;
  initialFirstName: string;
  initialLastName: string;
  initialEmail: string;
  initialPhone: string;
  onBackToCalendar: () => void;
  onConfirm: (details: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => void;
}

export default function BookingConfirmation({
  bookingDate,
  bookingTime,
  initialFirstName,
  initialLastName,
  initialEmail,
  initialPhone,
  onBackToCalendar,
  onConfirm,
}: BookingConfirmationProps) {
  const [firstName, setFirstName] = useState(initialFirstName || 'Drake');
  const [lastName, setLastName] = useState(initialLastName || 'Hampton');
  const [email, setEmail] = useState(initialEmail || 'drakehampton205@gmail.com');
  const [phone, setPhone] = useState(initialPhone || '');
  const [smsConsent, setSmsConsent] = useState(true);

  // Simple US phone number formatting: (555) 555-5555
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    let formatted = raw;
    if (raw.length > 6) {
      formatted = `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6)}`;
    } else if (raw.length > 3) {
      formatted = `(${raw.slice(0, 3)}) ${raw.slice(3)}`;
    } else if (raw.length > 0) {
      formatted = `(${raw}`;
    }
    setPhone(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ firstName, lastName, email, phone });
  };

  return (
    <main className="min-h-dvh bg-background-secondary">
      <div className="flex min-h-dvh flex-col bg-background">
        <div className="flex min-h-dvh flex-col sm:min-h-[max(52.5rem,calc(100dvh-10rem))]">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur-xl border-black/10">
            <div className="px-5 sm:px-8 md:px-12 lg:px-16">
              <div className="mx-auto w-full max-w-[1240px] flex items-center gap-3 pt-8 pb-4 sm:gap-6 sm:pt-14">
                <button
                  type="button"
                  onClick={onBackToCalendar}
                  className="mr-2 inline-flex size-9 items-center justify-center rounded-full border border-[#ebebeb] text-(--content-primary) hover:bg-[#f5f5f7] transition-colors cursor-pointer"
                  aria-label="Back"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <RangeLogo />
                <span className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 sm:h-9 sm:px-[18px] bg-[#e6f4ea]">
                  <svg viewBox="0 0 24 24" width="14" height="14" className="shrink-0 text-[#2c7a4a]" aria-hidden="true">
                    <path fill="currentColor" d="M18.71 7.21a1 1 0 0 0-1.42 0l-7.45 7.46l-3.13-3.14A1 1 0 1 0 5.29 13l3.84 3.84a1 1 0 0 0 1.42 0l8.16-8.16a1 1 0 0 0 0-1.47" />
                  </svg>
                  <span className="text-[12px] leading-4 font-semibold tracking-[0.02em] uppercase sm:text-[14px] sm:leading-5 text-[#2c7a4a]">
                    Eligible
                  </span>
                </span>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex w-full flex-1 flex-col pt-6 pb-0 sm:flex-none sm:pt-10">
            <div className="flex w-full flex-1 flex-col gap-4 [&_form]:flex [&_form]:w-full [&_form]:flex-1 [&_form]:flex-col [&_form]:gap-4">
              <div className="px-5 sm:px-8 md:px-12 lg:px-16">
                <div className="mx-auto w-full max-w-[1240px] flex flex-col gap-4 pb-12 sm:gap-6">
                  <h1 className="text-headline-reduced-large text-foreground text-pretty sm:text-headline-large">
                    Confirm your information.
                  </h1>

                  <form onSubmit={handleSubmit} className="flex max-w-160 flex-col gap-6">
                    {/* Booking Card */}
                    <div className="flex items-center gap-4 rounded-[20px] border border-[#ebebeb] p-5 bg-background">
                      <span className="inline-flex size-16 flex-none items-center justify-center rounded-full bg-[#fff980] text-[#1d1d1f]">
                        <svg viewBox="0 0 24 24" width="32" height="32" className="shrink-0" aria-hidden="true">
                          <path fill="currentColor" d="M12 19a1 1 0 1 0-1-1a1 1 0 0 0 1 1m5 0a1 1 0 1 0-1-1a1 1 0 0 0 1 1m0-4a1 1 0 1 0-1-1a1 1 0 0 0 1 1m-5 0a1 1 0 1 0-1-1a1 1 0 0 0 1 1m7-12h-1V2a1 1 0 0 0-2 0v1H8V2a1 1 0 0 0-2 0v1H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m1 17a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9h16Zm0-11H4V6a1 1 0 0 1 1-1h1v1a1 1 0 0 0 2 0V5h8v1a1 1 0 0 0 2 0V5h1a1 1 0 0 1 1 1ZM7 15a1 1 0 1 0-1-1a1 1 0 0 0 1 1m0 4a1 1 0 1 0-1-1a1 1 0 0 0 1 1" />
                        </svg>
                      </span>
                      <div className="flex min-w-0 flex-col items-start gap-1">
                        <p className="text-body-semi-bold font-semibold text-foreground">Confirm your booking</p>
                        <p className="text-body text-foreground">{bookingDate} at {bookingTime} GMT+1</p>
                        <p className="text-caption text-muted-foreground">30 min · GMT+1</p>
                        <button
                          type="button"
                          onClick={onBackToCalendar}
                          className="inline-flex items-center text-(--fill-blue) hover:underline text-[15px] font-semibold cursor-pointer p-0 bg-transparent border-0"
                        >
                          Choose a different time
                        </button>
                      </div>
                    </div>

                    {/* Personal Information Form */}
                    <div className="flex flex-col gap-3">
                      <p className="text-body-semi-bold font-semibold text-foreground">Your information</p>

                      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                        {/* First Name */}
                        <div className="flex w-full flex-col gap-2">
                          <div className="relative w-full">
                            <input
                              id="confirm-first-name"
                              type="text"
                              required
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder=" "
                              className="peer h-16 w-full rounded-[8px] bg-background px-4 pt-[26px] pb-[10px] text-[length:var(--font-size-field-value)] leading-(--font-line-height-field-value) text-foreground transition-colors border border-(--border-focus) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            <label
                              htmlFor="confirm-first-name"
                              className="pointer-events-none absolute left-4 text-field-label transition-all top-[10px] text-[length:var(--font-size-caption)] leading-(--font-line-height-caption) peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[length:var(--font-size-field-value)] peer-placeholder-shown:leading-(--font-line-height-field-value) peer-focus:top-[10px] peer-focus:translate-y-0 peer-focus:text-[length:var(--font-size-caption)] peer-focus:leading-(--font-line-height-caption) text-muted-foreground"
                            >
                              First Name
                            </label>
                          </div>
                        </div>

                        {/* Last Name */}
                        <div className="flex w-full flex-col gap-2">
                          <div className="relative w-full">
                            <input
                              id="confirm-last-name"
                              type="text"
                              required
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder=" "
                              className="peer h-16 w-full rounded-[8px] bg-background px-4 pt-[26px] pb-[10px] text-[length:var(--font-size-field-value)] leading-(--font-line-height-field-value) text-foreground transition-colors border border-(--border-focus) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            <label
                              htmlFor="confirm-last-name"
                              className="pointer-events-none absolute left-4 text-field-label transition-all top-[10px] text-[length:var(--font-size-caption)] leading-(--font-line-height-caption) peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[length:var(--font-size-field-value)] peer-placeholder-shown:leading-(--font-line-height-field-value) peer-focus:top-[10px] peer-focus:translate-y-0 peer-focus:text-[length:var(--font-size-caption)] peer-focus:leading-(--font-line-height-caption) text-muted-foreground"
                            >
                              Last Name
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex w-full flex-col gap-2">
                        <div className="relative w-full">
                          <input
                            id="confirm-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder=" "
                            className="peer h-16 w-full rounded-[8px] bg-background px-4 pt-[26px] pb-[10px] text-[length:var(--font-size-field-value)] leading-(--font-line-height-field-value) text-foreground transition-colors border border-(--border-focus) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                          <label
                            htmlFor="confirm-email"
                            className="pointer-events-none absolute left-4 text-field-label transition-all top-[10px] text-[length:var(--font-size-caption)] leading-(--font-line-height-caption) peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[length:var(--font-size-field-value)] peer-placeholder-shown:leading-(--font-line-height-field-value) peer-focus:top-[10px] peer-focus:translate-y-0 peer-focus:text-[length:var(--font-size-caption)] peer-focus:leading-(--font-line-height-caption) text-muted-foreground"
                          >
                            Email
                          </label>
                        </div>
                      </div>

                      {/* Phone Number with US Flag */}
                      <div className="range-phone-field flex w-full flex-col gap-2">
                        <div className="relative w-full">
                          <div className="h-16 w-full rounded-[8px] bg-background px-4 pt-[26px] pb-[10px] text-[length:var(--font-size-field-value)] leading-(--font-line-height-field-value) text-foreground transition-colors border border-(--border-focus) focus-within:outline-none focus-within:ring-2 focus-within:ring-ring flex items-center">
                            <div className="inline-flex items-center gap-1.5 mr-2 shrink-0">
                              <img src="/US.svg" alt="United States" className="w-5 h-3.5 object-cover rounded-xs border border-black/10" />
                              <span className="text-sm text-muted-foreground">+1</span>
                            </div>
                            <input
                              type="tel"
                              id="confirm-phone"
                              required
                              placeholder="(555) 555-5555"
                              value={phone}
                              onChange={handlePhoneChange}
                              className="w-full border-0 bg-transparent p-0 text-inherit outline-none font-medium"
                            />
                          </div>
                          <label
                            htmlFor="confirm-phone"
                            className="pointer-events-none absolute top-[10px] left-4 text-field-label text-[length:var(--font-size-caption)] leading-(--font-line-height-caption) text-muted-foreground"
                          >
                            Phone Number
                          </label>
                        </div>
                      </div>

                      {/* SMS Updates Checkbox */}
                      <div className="flex flex-col gap-2 mt-1">
                        <label className="flex w-full cursor-pointer items-center gap-2.5 text-foreground select-none">
                          <input
                            type="checkbox"
                            checked={smsConsent}
                            onChange={(e) => setSmsConsent(e.target.checked)}
                            className="size-5 rounded border-gray-300 text-(--fill-blue) focus:ring-(--fill-blue) cursor-pointer"
                          />
                          <span className="text-sm text-foreground">
                            Text me updates about my consultation.
                          </span>
                        </label>
                      </div>

                      {/* CTA Submit Button */}
                      <div className="mt-4 flex flex-col gap-2.5">
                        <button
                          type="submit"
                          data-slot="button"
                          className="inline-flex items-center justify-center transition-[color,background-color,border-color,opacity,scale] duration-[180ms] ease-out active:scale-[0.98] active:duration-[40ms] cursor-pointer disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring whitespace-nowrap text-inverse-foreground hover:opacity-90 min-w-[104px] py-4 rounded-full w-full h-[60px] bg-(--fill-blue) px-7 text-[16px] leading-6 font-semibold tracking-[-0.1px] sm:h-14 sm:text-[17px]"
                        >
                          Confirm Booking
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Disclosures */}
          <Footer />
        </div>
      </div>
    </main>
  );
}
