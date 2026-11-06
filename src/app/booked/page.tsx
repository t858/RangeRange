'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFunnel } from '@/context/FunnelContext';
import Footer from '@/components/Footer';
import RangeLogo from '@/components/RangeLogo';

export default function BookedPage() {
  const router = useRouter();
  const { state, updateState, isHydrated } = useFunnel();
  const displayName = isHydrated && state.firstName ? state.firstName : 'Drake';
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  // Check if booked appointment day has arrived and passed:
  // When the appointment day has arrived and passed, the page returns back to Step 10 so the user can pick a new time
  useEffect(() => {
    if (!isHydrated) return;

    const checkAppointmentExpiry = () => {
      const now = Date.now();
      let appointmentExpiry = state.bookingTimestamp;

      // If timestamp is not directly saved, parse the bookingDate string
      if (!appointmentExpiry && state.bookingDate) {
        // e.g. "Friday, November 6th" or "Monday, November 9th"
        const cleanDateStr = state.bookingDate.replace(/(st|nd|rd|th)/g, '');
        const currentYear = new Date().getFullYear();
        const parsed = Date.parse(`${cleanDateStr} ${currentYear} 23:59:59`);
        if (!isNaN(parsed)) {
          appointmentExpiry = parsed;
        }
      }

      if (appointmentExpiry && now > appointmentExpiry) {
        console.log('Booked appointment day has passed. Returning back to Step 10...');
        // Reset booking confirmation status so user can reschedule on step 10
        updateState({
          isBooked: false,
          bookingDate: '',
          bookingTime: '',
          bookingTimestamp: undefined,
        });
        router.replace('/step/10');
      }
    };

    checkAppointmentExpiry();
    const interval = setInterval(checkAppointmentExpiry, 30000); // Check periodically
    return () => clearInterval(interval);
  }, [isHydrated, state.bookingTimestamp, state.bookingDate, updateState, router]);

  // Lock browser history so user cannot navigate backward into the funnel
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePop = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePop);
    return () => {
      window.removeEventListener('popstate', handlePop);
    };
  }, []);

  const sources = [
    'Facebook',
    'Instagram',
    'Google',
    'LinkedIn',
    'ChatGPT or other AI',
  ];

  const demos = [
    {
      title: 'Accounts & Cash Flow',
      img: '/product-demo-accounts-and-cash-flow-BsO0H04s.jpg',
      video: '/accounts-and-cash-flow.mp4',
    },
    {
      title: 'Retirement Scenario Planning',
      img: '/product-demo-retirement-scenario-planning-I8oNtfac.jpg',
      video: '/retirement-scenario-planning.mp4',
    },
    {
      title: 'Tax Loss Harvesting',
      img: '/product-demo-tax-loss-harvesting-O5SqJieW.jpg',
      video: '/tax-loss-harvesting.mp4',
    },
    {
      title: 'Meet Your Team',
      img: '/product-demo-meet-your-team-hQr0I630.jpg',
      video: '/meet-your-team.mp4',
    },
  ];

  return (
    <main className="min-h-dvh bg-background-secondary">
      <div className="flex min-h-dvh flex-col bg-background">
        <div className="flex min-h-dvh flex-col sm:min-h-[max(52.5rem,calc(100dvh-10rem))]">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur-xl border-black/10">
            <div className="px-5 sm:px-8 md:px-12 lg:px-16">
              <div className="mx-auto w-full max-w-[1240px] flex items-center gap-3 pt-8 pb-4 sm:gap-6 sm:pt-14">
                <RangeLogo />
                <span className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 sm:h-9 sm:px-[18px] bg-[#e6f4ea]">
                  <svg viewBox="0 0 24 24" width="14" height="14" className="shrink-0 text-[#2c7a4a]" aria-hidden="true">
                    <path fill="currentColor" d="M18.71 7.21a1 1 0 0 0-1.42 0l-7.45 7.46l-3.13-3.14A1 1 0 1 0 5.29 13l3.84 3.84a1 1 0 0 0 1.42 0l8.16-8.16a1 1 0 0 0 0-1.47" />
                  </svg>
                  <span className="text-[12px] leading-4 font-semibold tracking-[0.02em] uppercase sm:text-[14px] sm:leading-5 text-[#2c7a4a]">
                    Call booked
                  </span>
                </span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex w-full flex-1 flex-col pt-6 pb-0 sm:flex-none sm:pt-10">
            <div className="flex w-full flex-1 flex-col gap-4 [&_form]:flex [&_form]:w-full [&_form]:flex-1 [&_form]:flex-col [&_form]:gap-4">
              <div className="px-5 sm:px-8 md:px-12 lg:px-16">
                <div className="mx-auto w-full max-w-[1240px]">
                  <div className="flex max-w-160 flex-col gap-4 pb-8">
                    <h1 className="text-[36px] sm:text-[48px] leading-[44px] sm:leading-[52px] font-semibold tracking-[-1.6px] text-foreground text-pretty">
                      You&apos;re all set, {displayName}.
                    </h1>
                    <p className="text-[17px] sm:text-[19px] text-muted-foreground mb-1 text-pretty">
                      <span className="font-semibold text-(--content-primary)">
                        Your call is booked for {state.bookingDate && state.bookingDate !== 'today' && state.bookingDate !== 'tomorrow' && state.bookingDate !== 'any' ? state.bookingDate : 'Friday, November 6th'} at {state.bookingTime || '2:30pm'}.
                      </span>{' '}
                      We&apos;ve emailed you the details and a link to join at{' '}
                      <span className="font-semibold text-(--content-primary)">
                        {state.email || 'drakehampton205@gmail.com'}
                      </span>
                      .
                    </p>

                    {/* How'd you hear about us? survey */}
                    <section className="flex flex-col gap-3 rounded-[12px] border border-border bg-background-secondary px-4 py-4 mt-2">
                      <h2 className="text-[15px] font-semibold text-foreground">
                        How&apos;d you hear about us?
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {sources.map((s) => (
                          <button
                            key={s}
                            type="button"
                            data-slot="button"
                            onClick={() => setSelectedSource(s)}
                            className={`inline-flex items-center justify-center font-semibold rounded-full min-w-[72px] h-10 px-4 text-[14px] leading-5 transition-all cursor-pointer ${
                              selectedSource === s
                                ? 'bg-[#1d1d1f] text-white shadow-none'
                                : 'bg-transparent text-(--content-primary) shadow-[inset_0_0_0_1px_#ebebeb] hover:bg-[#fafafc]'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      {selectedSource && (
                        <p className="text-xs text-[#2c7a4a] font-medium mt-1">
                          ✓ Thanks for letting us know!
                        </p>
                      )}
                    </section>

                    {/* Get to know RangeRange / Rai Chat & Calendar links */}
                    <section className="mt-6 mb-4 flex flex-col gap-3">
                      <h2 className="text-[17px] font-semibold">Get to know RangeRange</h2>
                      <div className="flex flex-col gap-2.5">
                        <a
                          href="https://calendar.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-16 w-full cursor-pointer items-center gap-3.5 rounded-[16px] border border-[#ebebeb] bg-background px-3.5 py-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:bg-[#fafafc]"
                        >
                          <span className="inline-flex size-10 flex-none items-center justify-center rounded-[12px] bg-[#f5f5f7] text-(--content-primary)">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                              <path d="M19 4h-1V2a1 1 0 0 0-2 0v2H8V2a1 1 0 0 0-2 0v2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm1 17a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9h16zm0-11H4V7a1 1 0 0 1 1-1h1v1a1 1 0 0 0 2 0V6h8v1a1 1 0 0 0 2 0V6h1a1 1 0 0 1 1 1z" />
                            </svg>
                          </span>
                          <span className="text-base font-semibold text-foreground flex-1">
                            Add to Google Calendar
                          </span>
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-[#86868b]">
                            <path d="m14.83 11.29l-4.24-4.24a1 1 0 0 0-1.42 0a1 1 0 0 0 0 1.41L12.71 12l-3.54 3.54a1 1 0 0 0 0 1.41a1 1 0 0 0 .71.29a1 1 0 0 0 .71-.29l4.24-4.24a1 1 0 0 0 0-1.42" />
                          </svg>
                        </a>

                        <a
                          href="data:text/calendar;charset=utf-8,BEGIN%3AVCALENDAR%0D%0AVERSION%3A2.0%0D%0ABEGIN%3AVEVENT%0D%0ASUMMARY%3ARangeRange%20Overview%0D%0ADESCRIPTION%3AYour%20call%20with%20RangeRange%0D%0AEND%3AVEVENT%0D%0AEND%3AVCALENDAR"
                          download="rangerange-call.ics"
                          className="flex min-h-16 w-full cursor-pointer items-center gap-3.5 rounded-[16px] border border-[#ebebeb] bg-background px-3.5 py-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:bg-[#fafafc]"
                        >
                          <span className="inline-flex size-10 flex-none items-center justify-center rounded-[12px] bg-[#f5f5f7] text-(--content-primary)">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                              <path d="M19 4h-1V2a1 1 0 0 0-2 0v2H8V2a1 1 0 0 0-2 0v2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm1 17a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9h16zm0-11H4V7a1 1 0 0 1 1-1h1v1a1 1 0 0 0 2 0V6h8v1a1 1 0 0 0 2 0V6h1a1 1 0 0 1 1 1z" />
                            </svg>
                          </span>
                          <span className="text-base font-semibold text-foreground flex-1">
                            Add to Apple Calendar
                          </span>
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-[#86868b]">
                            <path d="m14.83 11.29l-4.24-4.24a1 1 0 0 0-1.42 0a1 1 0 0 0 0 1.41L12.71 12l-3.54 3.54a1 1 0 0 0 0 1.41a1 1 0 0 0 .71.29a1 1 0 0 0 .71-.29l4.24-4.24a1 1 0 0 0 0-1.42" />
                          </svg>
                        </a>

                        <div className="flex min-h-16 w-full cursor-pointer items-center gap-3.5 rounded-[16px] border border-[#ebebeb] bg-background px-3.5 py-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:bg-[#fafafc]">
                          <span className="inline-flex size-10 flex-none items-center justify-center bg-linear-[135deg,#5b7cf5_0%,#9a6ae0_35%,#c05fb0_60%,#e0505a_85%,#e8604a_100%] font-semibold tracking-[-0.3px] text-white rounded-[12px] text-[13px]">
                            Rai
                          </span>
                          <span className="text-base font-semibold text-foreground flex-1">
                            Chat with Rai
                          </span>
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-[#86868b]">
                            <path d="m14.83 11.29l-4.24-4.24a1 1 0 0 0-1.42 0a1 1 0 0 0 0 1.41L12.71 12l-3.54 3.54a1 1 0 0 0 0 1.41a1 1 0 0 0 .71.29a1 1 0 0 0 .71-.29l4.24-4.24a1 1 0 0 0 0-1.42" />
                          </svg>
                        </div>
                      </div>
                    </section>

                    {/* Product Demos */}
                    <div className="mt-4 flex flex-col gap-3">
                      <h2 className="text-[17px] font-semibold">Explore what RangeRange does</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {demos.map((d) => (
                          <div
                            key={d.title}
                            className="rounded-2xl border border-[#ebebeb] overflow-hidden bg-background shadow-sm flex flex-col"
                          >
                            <img
                              src={d.img}
                              alt={d.title}
                              className="w-full h-36 object-cover bg-gray-50"
                            />
                            <div className="p-3.5 flex items-center justify-between">
                              <span className="text-[14px] font-semibold text-(--content-primary)">{d.title}</span>
                              <span className="text-xs text-(--fill-blue) font-semibold">Preview &rarr;</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky CTA */}
              <div className="sticky bottom-0 z-10 border-t border-[#ebebeb] bg-background/95 px-5 pt-3 pb-4 backdrop-blur-xl sm:px-8 md:px-12 lg:px-16">
                <div className="mx-auto w-full max-w-[1240px]">
                  <a
                    href="https://www.range.com"
                    target="_blank"
                    rel="noreferrer noopener"
                    data-slot="button"
                    className="inline-flex items-center justify-center font-semibold transition-all duration-[180ms] ease-out active:scale-[0.98] cursor-pointer whitespace-nowrap text-inverse-foreground hover:opacity-90 min-w-[104px] px-6 py-4 rounded-full h-[60px] w-full bg-(--fill-blue) text-[16px] leading-6 sm:h-14 sm:w-auto sm:px-7 sm:text-[17px]"
                  >
                    Create your account
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}
