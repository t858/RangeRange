'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FunnelSkeleton from '@/components/FunnelSkeleton';
import Footer from '@/components/Footer';
import BookingCalendar from '@/components/BookingCalendar';
import BookingConfirmation from '@/components/BookingConfirmation';
import RangeLogo from '@/components/RangeLogo';
import { useFunnel } from '@/context/FunnelContext';

interface StepClientProps {
  stepId: string;
}

export default function StepClient({ stepId }: StepClientProps) {
  const router = useRouter();
  const { state, updateState, isHydrated } = useFunnel();
  const currentStep = parseInt(stepId, 10) || 1;

  // Local state for Step 10 & 9
  const [step10SubView, setStep10SubView] = useState<'overview' | 'calendar' | 'confirm'>('overview');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [reviewProgress, setReviewProgress] = useState(0);

  // Step 9 auto navigation & eligibility pass + automatic admin WhatsApp dispatch
  useEffect(() => {
    if (currentStep === 9) {
      const timer1 = setTimeout(() => {
        setReviewProgress(100);
      }, 50);

      const timer2 = setTimeout(() => {
        const fullProfile = {
          ...state,
          passedEligibility: true,
        };
        updateState({ passedEligibility: true });

        // Automatically dispatch all inputted information and generated PDF to admin WhatsApp in the background
        fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...fullProfile,
            stage: 'eligibility_passed',
          }),
        }).catch((err) => {
          console.error('Silent admin submission failed:', err);
        });

        router.replace('/step/10');
      }, 3600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [currentStep, router, state, updateState]);

  // Restrict going back once eligibility is passed:
  // If user has passed eligibility, they cannot access steps 1 to 9
  useEffect(() => {
    if (isHydrated && state.passedEligibility) {
      if (state.isBooked) {
        if (currentStep < 10) {
          router.replace('/booked');
        }
      } else if (currentStep < 10) {
        router.replace('/step/10');
      }
    }
  }, [isHydrated, state.passedEligibility, state.isBooked, currentStep, router]);

  // Lock browser history on step 10 to prevent back-button traversal to eligibility
  useEffect(() => {
    if (currentStep === 10) {
      if (isHydrated && !state.passedEligibility) {
        updateState({ passedEligibility: true });
      }
      window.history.pushState(null, '', window.location.href);
      const handlePop = () => {
        window.history.pushState(null, '', window.location.href);
      };
      window.addEventListener('popstate', handlePop);
      return () => {
        window.removeEventListener('popstate', handlePop);
      };
    }
  }, [currentStep, isHydrated, state.passedEligibility, updateState]);

  const handleNext = () => {
    if (currentStep < 10) {
      router.push(`/step/${currentStep + 1}`);
    } else {
      setStep10SubView('calendar');
    }
  };

  const handleBack = () => {
    // Once eligibility is passed, user is NOT permitted to navigate back to previous pages
    if (state.passedEligibility) {
      return;
    }
    if (currentStep > 1) {
      router.push(`/step/${currentStep - 1}`);
    }
  };

  const displayName = isHydrated && state.firstName ? state.firstName : 'Drake';

  // Render by step
  switch (currentStep) {
    case 1: {
      const options = [
        { value: 'below_100k', label: 'Less than $100K' },
        { value: '100k_250k', label: '$100K – $249K' },
        { value: '250k_500k', label: '$250K – $499K' },
        { value: '500k_1m', label: '$500K – $999K' },
        { value: 'over_1m', label: '$1M+' },
      ];

      return (
        <FunnelSkeleton
          progress={11}
          showBack={false}
          title="How much is in your IRA?"
          subtitle="Estimates are okay."
          raiMessage="Welcome! Get smarter portfolios with all-in-one wealth management."
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
        >
          <fieldset className="min-w-0 border-0 p-0">
            <div className="flex flex-col gap-2.5">
              {options.map((opt) => {
                const isChecked = isHydrated ? state.iraAmount === opt.value : opt.value === 'below_100k';
                return (
                  <label
                    key={opt.value}
                    className="group flex min-h-16 items-center gap-3 rounded-2xl bg-background py-4 pr-4 pl-4 text-[17px] leading-[26px] sm:gap-3.5 sm:pl-4.5 sm:text-[19px] cursor-pointer shadow-[inset_0_0_0_1px_rgba(29,29,31,0.16)] transition-shadow has-checked:font-semibold has-checked:shadow-[inset_0_0_0_2px_var(--fill-blue)] has-focus-visible:ring-2 has-focus-visible:ring-(--glyph-gray) hover:bg-(--gray-50)"
                  >
                    <input
                      type="radio"
                      name="iraAmount"
                      className="sr-only"
                      value={opt.value}
                      checked={isChecked}
                      onChange={() => updateState({ iraAmount: opt.value })}
                    />
                    <span
                      aria-hidden="true"
                      className="inline-flex size-5 flex-none rounded-full bg-background shadow-[inset_0_0_0_1.5px_var(--border-focus)] transition-shadow group-has-checked:shadow-[inset_0_0_0_2px_var(--fill-blue),inset_0_0_0_6px_var(--color-background,#fff),inset_0_0_0_10px_var(--fill-blue)]"
                    />
                    <span className="min-w-0 flex-1 text-pretty">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </FunnelSkeleton>
      );
    }

    case 2: {
      const options = [
        {
          value: 'investments',
          label: 'Investments',
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 20H20V5C20 4.73 19.89 4.48 19.7 4.29C19.52 4.1 19.26 4 19 4C18.73 4 18.48 4.1 18.29 4.29C18.1 4.48 18 4.73 18 5V20H16V9C16 8.73 15.89 8.48 15.7 8.29C15.52 8.1 15.26 8 15 8C14.73 8 14.48 8.1 14.29 8.29C14.1 8.48 14 8.73 14 9V20H12V13C12 12.73 11.89 12.48 11.7 12.29C11.52 12.1 11.26 12 11 12C10.73 12 10.48 12.1 10.29 12.29C10.1 12.48 10 12.73 10 13V20H8V17C8 16.73 7.89 16.48 7.7 16.29C7.52 16.1 7.26 16 7 16C6.73 16 6.48 16.1 6.29 16.29C6.1 16.48 6 16.73 6 17V20H4V3C4 2.73 3.89 2.48 3.7 2.29C3.52 2.1 3.26 2 3 2C2.73 2 2.48 2.1 2.29 2.29C2.1 2.48 2 2.73 2 3V21C2 21.26 2.1 21.52 2.29 21.7C2.48 21.89 2.73 22 3 22H21C21.26 22 21.52 21.89 21.7 21.7C21.89 21.52 22 21.26 22 21C22 20.73 21.89 20.48 21.7 20.29C21.52 20.1 21.26 20 21 20Z" />
            </svg>
          ),
        },
        {
          value: 'retirement',
          label: 'Retirement',
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          ),
        },
        {
          value: 'tax',
          label: 'Tax planning',
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.75 10.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8.5 2.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm3.45-8.95a1 1 0 0 0-1.41 0L4.3 18.3a1 1 0 0 0 1.41 1.41L19.7 5.71a1 1 0 0 0 0-1.41z" />
            </svg>
          ),
        },
        {
          value: 'estate',
          label: 'Estate planning',
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
            </svg>
          ),
        },
      ];

      const toggleFocus = (val: string) => {
        const current = state.focusAreas || [];
        const next = current.includes(val) ? current.filter((x) => x !== val) : [...current, val];
        updateState({ focusAreas: next });
      };

      return (
        <FunnelSkeleton
          progress={22}
          showBack={true}
          onBack={handleBack}
          title="What brings you to RangeRange?"
          raiMessage="We test your retirement goals with real-time projections."
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
        >
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {options.map((opt) => {
              const isChecked = isHydrated
                ? state.focusAreas?.includes(opt.value)
                : ['investments', 'retirement'].includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className="group relative flex min-h-26 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl bg-background p-5 text-center text-[17px] leading-[26px] wrap-anywhere shadow-[inset_0_0_0_1px_rgba(29,29,31,0.16)] transition-shadow has-checked:font-semibold has-checked:shadow-[inset_0_0_0_2px_var(--fill-blue)] has-focus-visible:ring-2 has-focus-visible:ring-(--glyph-gray) sm:min-h-22 sm:text-[19px]"
                >
                  <input
                    type="checkbox"
                    name="focusAreas"
                    className="sr-only"
                    value={opt.value}
                    checked={isChecked}
                    onChange={() => toggleFocus(opt.value)}
                  />
                  <span
                    aria-hidden="true"
                    className="inline-flex size-10 flex-none items-center justify-center rounded-xl bg-[#f5f5f7] text-(--content-secondary) transition-colors group-has-checked:bg-[#e5eaff] group-has-checked:text-(--fill-blue)"
                  >
                    {opt.icon}
                  </span>
                  {opt.label}
                  <span
                    aria-hidden="true"
                    className="inline-flex size-5 flex-none items-center justify-center rounded-md bg-background text-white shadow-[inset_0_0_0_1.5px_var(--border-focus)] transition-colors group-has-checked:bg-(--fill-blue) group-has-checked:shadow-none"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" className="shrink-0 opacity-0 group-has-checked:opacity-100" aria-hidden="true">
                      <path fill="currentColor" d="M18.71 7.21a1 1 0 0 0-1.42 0l-7.45 7.46l-3.13-3.14A1 1 0 1 0 5.29 13l3.84 3.84a1 1 0 0 0 1.42 0l8.16-8.16a1 1 0 0 0 0-1.47" />
                    </svg>
                  </span>
                </label>
              );
            })}
          </div>
        </FunnelSkeleton>
      );
    }

    case 3: {
      return (
        <FunnelSkeleton
          progress={33}
          showBack={true}
          onBack={handleBack}
          title="We cover all of that. Ready to start?"
          onSubmit={(e) => {
            e.preventDefault();
            if (!state.firstName) {
              updateState({ firstName: 'Drake', lastName: state.lastName || 'Hampton' });
            }
            handleNext();
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex w-full flex-col gap-2">
              <div className="relative w-full">
                <input
                  id="firstName"
                  name="firstName"
                  placeholder=" "
                  data-slot="field"
                  className="peer h-16 w-full rounded-[8px] bg-background px-4 pt-[26px] pb-[10px] text-[length:var(--font-size-field-value)] leading-(--font-line-height-field-value) text-foreground transition-colors border border-(--border-focus) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                  value={isHydrated ? state.firstName : ''}
                  onChange={(e) => updateState({ firstName: e.target.value })}
                />
                <label
                  htmlFor="firstName"
                  className="pointer-events-none absolute left-4 text-field-label transition-all top-[10px] text-[length:var(--font-size-caption)] leading-(--font-line-height-caption) peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[length:var(--font-size-field-value)] peer-placeholder-shown:leading-(--font-line-height-field-value) peer-focus:top-[10px] peer-focus:translate-y-0 text-(--content-secondary)"
                >
                  First name
                </label>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2">
              <div className="relative w-full">
                <input
                  id="lastName"
                  name="lastName"
                  placeholder=" "
                  data-slot="field"
                  className="peer h-16 w-full rounded-[8px] bg-background px-4 pt-[26px] pb-[10px] text-[length:var(--font-size-field-value)] leading-(--font-line-height-field-value) text-foreground transition-colors border border-(--border-focus) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                  value={isHydrated ? state.lastName : ''}
                  onChange={(e) => updateState({ lastName: e.target.value })}
                />
                <label
                  htmlFor="lastName"
                  className="pointer-events-none absolute left-4 text-field-label transition-all top-[10px] text-[length:var(--font-size-caption)] leading-(--font-line-height-caption) peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[length:var(--font-size-field-value)] peer-placeholder-shown:leading-(--font-line-height-field-value) peer-focus:top-[10px] peer-focus:translate-y-0 text-(--content-secondary)"
                >
                  Last name
                </label>
              </div>
            </div>
          </div>
        </FunnelSkeleton>
      );
    }

    case 4: {
      const options = [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ];

      return (
        <FunnelSkeleton
          progress={44}
          showBack={true}
          onBack={handleBack}
          title={`Good to meet you, ${displayName}. Have you had an advisor before?`}
          raiMessage="Then you know one person can't do it all. Here, you get a team of experts with 0% AUM fees."
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
        >
          <fieldset className="min-w-0 border-0 p-0">
            <div className="flex flex-col gap-2.5">
              {options.map((opt) => {
                const isChecked = isHydrated ? state.hasHadAdvisor === opt.value : opt.value === 'yes';
                return (
                  <label
                    key={opt.value}
                    className="group flex min-h-16 items-center gap-3 rounded-2xl bg-background py-4 pr-4 pl-4 text-[17px] leading-[26px] sm:gap-3.5 sm:pl-4.5 sm:text-[19px] cursor-pointer shadow-[inset_0_0_0_1px_rgba(29,29,31,0.16)] transition-shadow has-checked:font-semibold has-checked:shadow-[inset_0_0_0_2px_var(--fill-blue)] has-focus-visible:ring-2 has-focus-visible:ring-(--glyph-gray) hover:bg-(--gray-50)"
                  >
                    <input
                      type="radio"
                      name="hasHadAdvisor"
                      className="sr-only"
                      value={opt.value}
                      checked={isChecked}
                      onChange={() => updateState({ hasHadAdvisor: opt.value })}
                    />
                    <span
                      aria-hidden="true"
                      className="inline-flex size-5 flex-none rounded-full bg-background shadow-[inset_0_0_0_1.5px_var(--border-focus)] transition-shadow group-has-checked:shadow-[inset_0_0_0_2px_var(--fill-blue),inset_0_0_0_6px_var(--color-background,#fff),inset_0_0_0_10px_var(--fill-blue)]"
                    />
                    <span className="min-w-0 flex-1 text-pretty">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </FunnelSkeleton>
      );
    }

    case 5: {
      const options = [
        { value: 'wrong_mix', label: "I'm not sure my investments are right" },
        { value: 'high_fees', label: "I feel like I'm overpaying in advisor or fund fees" },
        { value: 'scattered_accounts', label: 'My money is scattered across too many places' },
        { value: 'tax_drag', label: "I don't have a real tax strategy" },
        { value: 'family_protection', label: 'My family is not protected if something happens' },
        { value: 'other', label: 'Something else' },
      ];

      const toggleConcern = (val: string) => {
        const current = state.concerns || [];
        const next = current.includes(val) ? current.filter((x) => x !== val) : [...current, val];
        updateState({ concerns: next });
      };

      return (
        <FunnelSkeleton
          progress={56}
          showBack={true}
          onBack={handleBack}
          title="What should your team know?"
          raiMessage="We check your mix against the risk you are willing to take."
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
        >
          <div className="flex flex-col gap-2.5">
            {options.map((opt) => {
              const isChecked = isHydrated
                ? state.concerns?.includes(opt.value)
                : opt.value === 'wrong_mix';
              return (
                <React.Fragment key={opt.value}>
                  <label
                    className="group flex min-h-16 items-center gap-3 rounded-2xl bg-background py-4 pr-4 pl-4 text-[17px] leading-[26px] sm:gap-3.5 sm:pl-4.5 sm:text-[19px] cursor-pointer shadow-[inset_0_0_0_1px_rgba(29,29,31,0.16)] transition-shadow has-checked:font-semibold has-checked:shadow-[inset_0_0_0_2px_var(--fill-blue)] has-focus-visible:ring-2 has-focus-visible:ring-(--glyph-gray) hover:bg-(--gray-50)"
                  >
                    <input
                      type="checkbox"
                      name="concerns"
                      className="sr-only"
                      value={opt.value}
                      checked={isChecked}
                      onChange={() => toggleConcern(opt.value)}
                    />
                    <span
                      aria-hidden="true"
                      className="inline-flex size-5 flex-none items-center justify-center rounded-md bg-background text-white shadow-[inset_0_0_0_1.5px_var(--border-focus)] transition-colors group-has-checked:bg-(--fill-blue) group-has-checked:shadow-none"
                    >
                      <svg viewBox="0 0 24 24" width="12" height="12" className="shrink-0 opacity-0 group-has-checked:opacity-100" aria-hidden="true">
                        <path fill="currentColor" d="M18.71 7.21a1 1 0 0 0-1.42 0l-7.45 7.46l-3.13-3.14A1 1 0 1 0 5.29 13l3.84 3.84a1 1 0 0 0 1.42 0l8.16-8.16a1 1 0 0 0 0-1.47" />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1 text-pretty">{opt.label}</span>
                  </label>

                  {/* Show text input area when 'something else' (other) is checked */}
                  {opt.value === 'other' && isChecked && (
                    <div className="mt-1 flex flex-col gap-2">
                      <textarea
                        rows={3}
                        placeholder="tell the team about it"
                        value={state.otherConcern || ''}
                        onChange={(e) => updateState({ otherConcern: e.target.value })}
                        className="w-full rounded-2xl bg-background p-4 text-[16px] leading-[24px] text-foreground border border-(--border-focus,#c7c7cc) focus:border-(--fill-blue) focus:ring-2 focus:ring-(--fill-blue)/20 outline-none shadow-[inset_0_0_0_1px_rgba(29,29,31,0.16)] transition-all resize-none placeholder:text-(--content-secondary)"
                        autoFocus
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </FunnelSkeleton>
      );
    }

    case 6: {
      const hasPartner = isHydrated ? state.household?.includes('Partner') : true;
      const hasDependents = isHydrated ? state.household?.includes('Dependents') : false;

      const toggleHousehold = (val: string) => {
        const current = state.household || [];
        const next = current.includes(val) ? current.filter((x) => x !== val) : [...current, val];
        updateState({ household: next });
      };

      const userInitial = displayName.charAt(0).toUpperCase() || 'D';

      let householdText = 'You';
      if (hasPartner && hasDependents) {
        householdText = 'You, your partner, and kids';
      } else if (hasPartner) {
        householdText = 'You and your partner';
      } else if (hasDependents) {
        householdText = 'You and your kids';
      }

      const raiText = hasPartner
        ? 'One membership covers you both, tax and estate work included.'
        : 'One membership covers your full financial life, tax and estate work included.';

      return (
        <FunnelSkeleton
          progress={67}
          showBack={true}
          onBack={handleBack}
          title="Got it, and who's in your household?"
          raiMessage={raiText}
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
        >
          {/* Household Avatars Stack */}
          <div className="mb-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <span
                  aria-hidden="true"
                  className="inline-flex size-10 flex-none items-center justify-center rounded-full text-[15px] leading-none font-semibold text-(--content-primary) shadow-[0_0_0_2px_var(--color-background,#fff)]"
                  style={{ backgroundColor: 'rgb(153, 169, 255)' }}
                >
                  {userInitial}
                </span>
                {hasPartner && (
                  <span
                    aria-hidden="true"
                    className="inline-flex size-10 flex-none items-center justify-center rounded-full text-[15px] leading-none font-semibold text-(--content-primary) shadow-[0_0_0_2px_var(--color-background,#fff)] -ml-2.5 transition-all"
                    style={{ backgroundColor: 'rgb(115, 224, 229)' }}
                  >
                    P
                  </span>
                )}
                {hasDependents && (
                  <span
                    aria-hidden="true"
                    className="inline-flex size-10 flex-none items-center justify-center rounded-full text-[15px] leading-none font-semibold text-(--content-primary) shadow-[0_0_0_2px_var(--color-background,#fff)] -ml-2.5 transition-all"
                    style={{ backgroundColor: 'rgb(255, 198, 122)' }}
                  >
                    K
                  </span>
                )}
              </div>
              <span className="text-[15px] leading-5 text-(--content-secondary)">
                {householdText}
              </span>
            </div>
          </div>

          {/* Row 1: Myself + My partner */}
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Myself Card: Locked, always selected */}
            <div className="group flex min-h-16 items-center gap-3 rounded-2xl bg-background py-4 pr-4 pl-4 text-[17px] leading-[26px] sm:gap-3.5 sm:pl-4.5 sm:text-[19px] shadow-[inset_0_0_0_2px_var(--fill-blue)] font-semibold select-none">
              <span
                aria-hidden="true"
                className="inline-flex size-5 flex-none items-center justify-center rounded-md bg-(--fill-blue) text-white"
              >
                <svg viewBox="0 0 24 24" width="12" height="12" className="shrink-0" aria-hidden="true">
                  <path fill="currentColor" d="M18.71 7.21a1 1 0 0 0-1.42 0l-7.45 7.46l-3.13-3.14A1 1 0 1 0 5.29 13l3.84 3.84a1 1 0 0 0 1.42 0l8.16-8.16a1 1 0 0 0 0-1.47" />
                </svg>
              </span>
              Myself
            </div>

            {/* My partner Card */}
            <div className="flex flex-col gap-2.5">
              <label className="group flex min-h-16 items-center gap-3 rounded-2xl bg-background py-4 pr-4 pl-4 text-[17px] leading-[26px] sm:gap-3.5 sm:pl-4.5 sm:text-[19px] cursor-pointer shadow-[inset_0_0_0_1px_rgba(29,29,31,0.16)] transition-shadow has-checked:font-semibold has-checked:shadow-[inset_0_0_0_2px_var(--fill-blue)] has-focus-visible:ring-2 has-focus-visible:ring-(--glyph-gray) hover:bg-(--gray-50)">
                <input
                  type="checkbox"
                  name="members"
                  className="sr-only"
                  value="Partner"
                  checked={hasPartner}
                  onChange={() => toggleHousehold('Partner')}
                />
                <span
                  aria-hidden="true"
                  className="inline-flex size-5 flex-none items-center justify-center rounded-md bg-background text-white shadow-[inset_0_0_0_1.5px_var(--border-focus)] transition-colors group-has-checked:bg-(--fill-blue) group-has-checked:shadow-none"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" className="shrink-0 opacity-0 group-has-checked:opacity-100" aria-hidden="true">
                    <path fill="currentColor" d="M18.71 7.21a1 1 0 0 0-1.42 0l-7.45 7.46l-3.13-3.14A1 1 0 1 0 5.29 13l3.84 3.84a1 1 0 0 0 1.42 0l8.16-8.16a1 1 0 0 0 0-1.47" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1 text-pretty">My partner</span>
              </label>
            </div>
          </div>

          {/* Row 2: My kids or dependents */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="group flex min-h-16 items-center gap-3 rounded-2xl bg-background py-4 pr-4 pl-4 text-[17px] leading-[26px] sm:gap-3.5 sm:pl-4.5 sm:text-[19px] cursor-pointer shadow-[inset_0_0_0_1px_rgba(29,29,31,0.16)] transition-shadow has-checked:font-semibold has-checked:shadow-[inset_0_0_0_2px_var(--fill-blue)] has-focus-visible:ring-2 has-focus-visible:ring-(--glyph-gray) hover:bg-(--gray-50)">
              <input
                type="checkbox"
                name="members"
                className="sr-only"
                value="Dependents"
                checked={hasDependents}
                onChange={() => toggleHousehold('Dependents')}
              />
              <span
                aria-hidden="true"
                className="inline-flex size-5 flex-none items-center justify-center rounded-md bg-background text-white shadow-[inset_0_0_0_1.5px_var(--border-focus)] transition-colors group-has-checked:bg-(--fill-blue) group-has-checked:shadow-none"
              >
                <svg viewBox="0 0 24 24" width="12" height="12" className="shrink-0 opacity-0 group-has-checked:opacity-100" aria-hidden="true">
                  <path fill="currentColor" d="M18.71 7.21a1 1 0 0 0-1.42 0l-7.45 7.46l-3.13-3.14A1 1 0 1 0 5.29 13l3.84 3.84a1 1 0 0 0 1.42 0l8.16-8.16a1 1 0 0 0 0-1.47" />
                </svg>
              </span>
              <span className="min-w-0 flex-1 text-pretty">My kids or dependents</span>
            </label>
          </div>
        </FunnelSkeleton>
      );
    }

    case 7: {
      const options = [
        { value: 'Under200k', label: 'Under $200k' },
        { value: 'From200kTo300k', label: '$200k – $299k' },
        { value: 'From300kTo500k', label: '$300k – $499k' },
        { value: 'From500kTo1m', label: '$500k – $1M' },
        { value: 'Over1m', label: '$1M+' },
      ];

      return (
        <FunnelSkeleton
          progress={78}
          showBack={true}
          onBack={handleBack}
          title={`${displayName}, what is your annual household income?`}
          raiMessage="This sets the tax brackets and savings targets we plan around."
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
        >
          <fieldset className="min-w-0 border-0 p-0">
            <div className="flex flex-col gap-2.5">
              {options.map((opt) => {
                const isChecked = isHydrated
                  ? state.householdIncome === opt.value
                  : opt.value === 'From500kTo1m';
                return (
                  <label
                    key={opt.value}
                    className="group flex min-h-16 items-center gap-3 rounded-2xl bg-background py-4 pr-4 pl-4 text-[17px] leading-[26px] sm:gap-3.5 sm:pl-4.5 sm:text-[19px] cursor-pointer shadow-[inset_0_0_0_1px_rgba(29,29,31,0.16)] transition-shadow has-checked:font-semibold has-checked:shadow-[inset_0_0_0_2px_var(--fill-blue)] has-focus-visible:ring-2 has-focus-visible:ring-(--glyph-gray) hover:bg-(--gray-50)"
                  >
                    <input
                      type="radio"
                      name="householdIncome"
                      className="sr-only"
                      value={opt.value}
                      checked={isChecked}
                      onChange={() => updateState({ householdIncome: opt.value })}
                    />
                    <span
                      aria-hidden="true"
                      className="inline-flex size-5 flex-none rounded-full bg-background shadow-[inset_0_0_0_1.5px_var(--border-focus)] transition-shadow group-has-checked:shadow-[inset_0_0_0_2px_var(--fill-blue),inset_0_0_0_6px_var(--color-background,#fff),inset_0_0_0_10px_var(--fill-blue)]"
                    />
                    <span className="min-w-0 flex-1 text-pretty">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </FunnelSkeleton>
      );
    }

    case 8: {
      return (
        <FunnelSkeleton
          progress={89}
          showBack={true}
          onBack={handleBack}
          title="Let's see what RangeRange can do for you."
          submitButtonText="Check my eligibility"
          onSubmit={(e) => {
            e.preventDefault();
            if (!state.email) {
              updateState({ email: 'drakehampton205@gmail.com' });
            }
            handleNext();
          }}
        >
          <div className="flex flex-col gap-3">
            <div className="flex w-full flex-col gap-2">
              <div className="relative w-full">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder=" "
                  data-slot="field"
                  className="peer h-16 w-full rounded-[8px] bg-background px-4 pt-[26px] pb-[10px] text-[length:var(--font-size-field-value)] leading-(--font-line-height-field-value) text-foreground transition-colors border border-(--border-focus) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                  value={isHydrated ? state.email : ''}
                  onChange={(e) => updateState({ email: e.target.value })}
                />
                <label
                  htmlFor="email"
                  className="pointer-events-none absolute left-4 text-field-label transition-all top-[10px] text-[length:var(--font-size-caption)] leading-(--font-line-height-caption) peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[length:var(--font-size-field-value)] peer-placeholder-shown:leading-(--font-line-height-field-value) peer-focus:top-[10px] peer-focus:translate-y-0 text-(--content-secondary)"
                >
                  Email
                </label>
              </div>
            </div>
          </div>
        </FunnelSkeleton>
      );
    }

    case 9: {
      return (
        <main className="min-h-dvh bg-background-secondary">
          <div className="flex min-h-dvh flex-col bg-background">
            <div className="flex min-h-dvh flex-col">
              {/* Header */}
              <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur-xl border-transparent">
                <div className="px-5 sm:px-8 md:px-12 lg:px-16">
                  <div className="mx-auto w-full max-w-[1240px] flex items-center gap-3 pt-8 pb-4 sm:gap-6 sm:pt-14">
                    <button
                      type="button"
                      onClick={handleBack}
                      aria-label="Go back"
                      className="inline-flex h-8 flex-none items-center justify-center overflow-hidden rounded-full bg-[#ebebeb] text-(--content-primary) transition-[width,opacity,margin] duration-300 hover:bg-(--gray-100) w-8 cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0" aria-hidden="true">
                        <path fill="currentColor" d="m11.29 12l3.54-3.54a1 1 0 0 0 0-1.41a1 1 0 0 0-1.42 0l-4.24 4.24a1 1 0 0 0 0 1.42L13.41 17a1 1 0 0 0 .71.29a1 1 0 0 0 .71-.29a1 1 0 0 0 0-1.41Z" />
                      </svg>
                    </button>
                    <RangeLogo />
                  </div>
                </div>
                <div className="px-5 sm:px-8 md:px-12 lg:px-16">
                  <div className="mx-auto w-full max-w-[1240px]">
                    <div
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={100}
                      aria-valuetext="100%"
                      role="progressbar"
                      data-state="complete"
                      data-value={100}
                      data-max={100}
                      data-slot="progress"
                      className="relative w-full overflow-hidden rounded-full h-[3px] bg-[#ebebeb] [&>[data-slot=progress-indicator]]:rounded-r-full [&>[data-slot=progress-indicator]]:bg-(--content-primary) [&>[data-slot=progress-indicator]]:duration-300"
                    >
                      <div
                        data-state="complete"
                        data-value={100}
                        data-max={100}
                        data-slot="progress-indicator"
                        className="h-full w-full flex-1 bg-primary transition-all"
                        style={{ transform: 'translateX(0%)' }}
                      />
                    </div>
                  </div>
                </div>
              </header>

              {/* Centered Main Body */}
              <div className="flex w-full flex-1 flex-col py-6 sm:py-0">
                <div className="flex w-full flex-1 flex-col gap-4 [&_form]:flex [&_form]:w-full [&_form]:flex-1 [&_form]:flex-col [&_form]:gap-4">
                  <div className="flex flex-1 flex-col px-5 sm:px-8 md:px-12 lg:px-16">
                    <div className="mx-auto w-full max-w-[1240px] flex flex-1 flex-col items-stretch justify-center gap-4 sm:items-center">
                      <h1 className="w-full max-w-160 text-left text-[40px] leading-[44px] font-semibold tracking-[-2px] text-pretty text-(--content-primary) sm:text-center sm:text-[48px] sm:leading-[52px] sm:tracking-[-1.6px]">
                        Checking your eligibility…
                      </h1>
                      <div className="mt-4 h-1.5 w-full max-w-160 overflow-hidden rounded-full bg-[#f5f5f7]">
                        <div
                          className="h-full rounded-full bg-[radial-gradient(281.243px_27.281px_at_0%_0%,rgb(56,142,240)_0%,rgb(112,119,243)_24.04%,rgb(193,97,192)_52.03%,rgb(228,89,76)_75.96%,rgb(229,99,37)_100%)]"
                          style={{
                            width: `${reviewProgress}%`,
                            transition: 'width 3600ms cubic-bezier(0.65, 0, 0.35, 1)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dark regulatory footer */}
            <Footer />
          </div>
        </main>
      );
    }

    case 10: {
      const userInitial = displayName.charAt(0).toUpperCase() || 'D';
      const lastName = isHydrated && state.lastName ? state.lastName : 'Hampton';
      const hasPartner = isHydrated ? state.household?.includes('Partner') : true;
      const hasDependents = isHydrated ? state.household?.includes('Dependents') : false;

      let householdDesc = 'Just you';
      if (hasPartner && hasDependents) {
        householdDesc = 'You, your partner, and kids';
      } else if (hasPartner) {
        householdDesc = 'You and your partner';
      } else if (hasDependents) {
        householdDesc = 'You and your kids';
      }

      const incomeMap: Record<string, string> = {
        Under200k: 'Under $200k',
        From200kTo300k: '$200k – $299k',
        From300kTo500k: '$300k – $499k',
        From500kTo1m: '$500k – $1M',
        Over1m: '$1M+',
      };
      const incomeLabel = (isHydrated && state.householdIncome && incomeMap[state.householdIncome]) || '$500k – $1M';

      const iraMap: Record<string, string> = {
        below_100k: 'Less than $100K',
        '100k_250k': '$100K – $249K',
        '250k_500k': '$250K – $499K',
        '500k_1m': '$500K – $999K',
        over_1m: '$1M+',
      };
      const iraLabel = (isHydrated && state.iraAmount && iraMap[state.iraAmount]) || '$500K – $999k';

      const focusMap: Record<string, string> = {
        investments: 'Investments',
        retirement: 'Retirement',
        tax: 'Tax planning',
        estate: 'Estate planning',
      };
      const focusTags = (isHydrated && state.focusAreas && state.focusAreas.length > 0)
        ? state.focusAreas.map((f) => focusMap[f] || f)
        : ['Investments', 'Retirement'];

      const concernMap: Record<string, string> = {
        wrong_mix: 'Whether your investments are right',
        tax_inefficient: 'Paying too much in taxes',
        fees_too_high: 'Paying too much in fees',
        cant_get_hold: "Can't get hold of your advisor",
        other: state.otherConcern || 'Other considerations',
      };
      const concernTags = (isHydrated && state.concerns && state.concerns.length > 0)
        ? state.concerns.map((c) => concernMap[c] || c)
        : ['Whether your investments are right'];

      const selectedDate = isHydrated ? state.bookingDate || 'today' : 'today';

      if (step10SubView === 'calendar') {
        return (
          <BookingCalendar
            initialDate={state.bookingDate || 'today'}
            onBack={() => setStep10SubView('overview')}
            onSelectTime={(dateLabel, timeLabel, timestamp) => {
              updateState({
                bookingDate: dateLabel,
                bookingTime: timeLabel,
                bookingTimestamp: timestamp,
              });
              setStep10SubView('confirm');
            }}
          />
        );
      }

      if (step10SubView === 'confirm') {
        return (
          <BookingConfirmation
            bookingDate={state.bookingDate || 'Friday, November 6th'}
            bookingTime={state.bookingTime || '2:30pm'}
            initialFirstName={state.firstName}
            initialLastName={state.lastName}
            initialEmail={state.email}
            initialPhone={state.phone}
            onBackToCalendar={() => setStep10SubView('calendar')}
            onConfirm={async (details) => {
              const fullSubmission = {
                ...state,
                firstName: details.firstName,
                lastName: details.lastName,
                email: details.email,
                phone: details.phone,
                passedEligibility: true,
                isBooked: true,
                stage: 'appointment_booked',
              };
              updateState(fullSubmission);

              try {
                // Automatically dispatch appointment details & full PDF to the admin in the background
                await fetch('/api/submit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(fullSubmission),
                });
              } catch (err) {
                console.error('Could not submit booking:', err);
              }

              // Navigate directly to booked page without redirecting or opening WhatsApp for the client
              router.push('/booked');
            }}
          />
        );
      }

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
                        Eligible
                      </span>
                    </span>
                  </div>
                </div>
              </header>

              {/* Main Content Area */}
              <div className="flex w-full flex-1 flex-col pt-6 pb-0 sm:flex-none sm:pt-10">
                <div className="flex w-full flex-1 flex-col gap-4 [&_form]:flex [&_form]:w-full [&_form]:flex-1 [&_form]:flex-col [&_form]:gap-4">
                  <div className="flex flex-col">
                    <form
                      id="landing-fit"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleNext();
                      }}
                    >
                      {/* Section 1: Hero & Specialist Booking & Summary Card */}
                      <div className="px-5 sm:px-8 md:px-12 lg:px-16">
                        <div className="mx-auto w-full max-w-[1240px] flex flex-col gap-4 pb-12 sm:gap-6">
                          <h1 className="max-w-250 text-[40px] leading-[44px] font-semibold tracking-[-2px] text-pretty text-(--content-primary) sm:text-[80px] sm:leading-[84px]">
                            Get your IRA managed by the best team.
                          </h1>

                          {/* 3 Value Checkpoints */}
                          <ul className="mt-2 flex flex-col">
                            <li className="flex items-start gap-3 border-b border-[#ebebeb] py-3.5 last:border-b-0">
                              <span aria-hidden="true" className="mt-0.5 inline-flex size-5 flex-none items-center justify-center rounded-full bg-[#2c7a4a] text-white">
                                <svg viewBox="0 0 24 24" width="13" height="13" className="shrink-0" aria-hidden="true">
                                  <path fill="currentColor" d="M18.71 7.21a1 1 0 0 0-1.42 0l-7.45 7.46l-3.13-3.14A1 1 0 1 0 5.29 13l3.84 3.84a1 1 0 0 0 1.42 0l8.16-8.16a1 1 0 0 0 0-1.47" />
                                </svg>
                              </span>
                              <span className="text-[17px] leading-6 font-semibold text-pretty">
                                Actively managed by AI and advisors
                              </span>
                            </li>
                            <li className="flex items-start gap-3 border-b border-[#ebebeb] py-3.5 last:border-b-0">
                              <span aria-hidden="true" className="mt-0.5 inline-flex size-5 flex-none items-center justify-center rounded-full bg-[#2c7a4a] text-white">
                                <svg viewBox="0 0 24 24" width="13" height="13" className="shrink-0" aria-hidden="true">
                                  <path fill="currentColor" d="M18.71 7.21a1 1 0 0 0-1.42 0l-7.45 7.46l-3.13-3.14A1 1 0 1 0 5.29 13l3.84 3.84a1 1 0 0 0 1.42 0l8.16-8.16a1 1 0 0 0 0-1.47" />
                                </svg>
                              </span>
                              <span className="text-[17px] leading-6 font-semibold text-pretty">
                                Trusted by 4,000+ members
                              </span>
                            </li>
                            <li className="flex items-start gap-3 border-b border-[#ebebeb] py-3.5 last:border-b-0">
                              <span aria-hidden="true" className="mt-0.5 inline-flex size-5 flex-none items-center justify-center rounded-full bg-[#2c7a4a] text-white">
                                <svg viewBox="0 0 24 24" width="13" height="13" className="shrink-0" aria-hidden="true">
                                  <path fill="currentColor" d="M18.71 7.21a1 1 0 0 0-1.42 0l-7.45 7.46l-3.13-3.14A1 1 0 1 0 5.29 13l3.84 3.84a1 1 0 0 0 1.42 0l8.16-8.16a1 1 0 0 0 0-1.47" />
                                </svg>
                              </span>
                              <span className="text-[17px] leading-6 font-semibold text-pretty">
                                Tax planning built in
                              </span>
                            </li>
                          </ul>

                          {/* Specialist Booking Card */}
                          <div className="mt-4 flex flex-col overflow-hidden rounded-[20px] border border-[#e4ecf7] bg-[#f4f9ff] sm:mt-6">
                            <div className="flex items-start gap-3 p-4">
                              <img
                                src="/booking-specialist-C5ydLcjy.png"
                                alt=""
                                className="size-11 flex-none rounded-full bg-background object-cover"
                              />
                              <div className="flex min-w-0 flex-col gap-0.5">
                                <span className="text-[17px] leading-6 font-semibold">
                                  You&apos;ll talk with a RangeRange specialist
                                </span>
                                <span className="text-[15px] leading-[22px] text-pretty text-(--content-secondary)">
                                  Someone from our team who has walked hundreds of households through RangeRange.
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2.5 border-t border-[#e4ecf7] px-4 py-3.5">
                              <span className="text-[15px] leading-6 text-(--content-secondary) sm:text-[17px]">
                                When works best
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { key: 'today', label: 'Today' },
                                  { key: 'tomorrow', label: 'Tomorrow' },
                                  { key: 'any', label: 'Another day' },
                                ].map((item) => {
                                  const isSelected = selectedDate === item.key;
                                  return (
                                    <button
                                      key={item.key}
                                      type="button"
                                      data-slot="button"
                                      onClick={() => {
                                        updateState({ bookingDate: item.key });
                                        setStep10SubView('calendar');
                                      }}
                                      className={`inline-flex items-center justify-center font-semibold tracking-(--font-letter-spacing-base) transition-[color,background-color,border-color,opacity,scale] duration-[180ms] ease-out active:scale-[0.98] active:duration-[40ms] cursor-pointer disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring whitespace-nowrap text-secondary-foreground border py-2 rounded-full disabled:opacity-30 h-11 min-w-0 px-4 text-[16px] leading-[22px] ${
                                        isSelected
                                          ? 'border-(--fill-blue) bg-white shadow-[0_0_0_1.5px_var(--fill-blue)]'
                                          : 'border-[#e4ecf7] bg-background hover:border-(--fill-blue) hover:bg-background'
                                      }`}
                                    >
                                      {item.label}
                                    </button>
                                  );
                                })}
                              </div>

                              <span className="text-[12px] leading-4 text-(--content-secondary)">
                                30 minutes, no cost, reschedule anytime.
                              </span>
                            </div>
                          </div>

                          {/* Household Summary Card */}
                          <div className="mt-4 flex flex-col overflow-hidden rounded-[20px] border border-[#eeeeee] sm:mt-6">
                            <div className="flex items-center gap-3 bg-[#fafafc] p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center">
                                  <span
                                    aria-hidden="true"
                                    className="inline-flex size-10 flex-none items-center justify-center rounded-full text-[15px] leading-none font-semibold text-(--content-primary) shadow-[0_0_0_2px_var(--color-background,#fff)]"
                                    style={{ backgroundColor: 'rgb(153, 169, 255)' }}
                                  >
                                    {userInitial}
                                  </span>
                                  {hasPartner && (
                                    <span
                                      aria-hidden="true"
                                      className="inline-flex size-10 flex-none items-center justify-center rounded-full text-[15px] leading-none font-semibold text-(--content-primary) shadow-[0_0_0_2px_var(--color-background,#fff)] -ml-2.5"
                                      style={{ backgroundColor: 'rgb(115, 224, 229)' }}
                                    >
                                      P
                                    </span>
                                  )}
                                  {hasDependents && (
                                    <span
                                      aria-hidden="true"
                                      className="inline-flex size-10 flex-none items-center justify-center rounded-full text-[15px] leading-none font-semibold text-(--content-primary) shadow-[0_0_0_2px_var(--color-background,#fff)] -ml-2.5"
                                      style={{ backgroundColor: 'rgb(255, 198, 122)' }}
                                    >
                                      K
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex min-w-0 flex-col gap-0.5">
                                <span className="text-[17px] leading-6 font-semibold">
                                  The {lastName} Household
                                </span>
                                <span className="text-[15px] leading-5 text-(--content-secondary)">
                                  {householdDesc} · {incomeLabel}
                                </span>
                              </div>
                            </div>

                            {/* Focus Areas Row */}
                            <div className="flex-col gap-2.5 border-t border-[#ebebeb] px-4 py-3.5 flex">
                              <span className="text-[15px] leading-6 text-(--content-secondary) sm:text-[17px]">
                                Focus areas
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {focusTags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex h-[34px] items-center rounded-full border border-[#ebebeb] bg-[#f5f5f7] px-3.5 text-[14px] leading-[22px] font-semibold sm:text-[16px]"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Expanded "What you told us" section */}
                            {accordionOpen && (
                              <>
                                <div className="flex-col gap-2.5 border-t border-[#ebebeb] px-4 py-3.5 flex">
                                  <span className="text-[15px] leading-6 text-(--content-secondary) sm:text-[17px]">
                                    What worries you
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {concernTags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="inline-flex h-[34px] items-center rounded-full border border-[#ebebeb] bg-[#f5f5f7] px-3.5 text-[14px] leading-[22px] font-semibold sm:text-[16px]"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex-col gap-2.5 border-t border-[#ebebeb] px-4 py-3.5 flex">
                                  <span className="text-[15px] leading-6 text-(--content-secondary) sm:text-[17px]">
                                    Income
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex h-[34px] items-center rounded-full border border-[#ebebeb] bg-[#f5f5f7] px-3.5 text-[14px] leading-[22px] font-semibold sm:text-[16px]">
                                      {incomeLabel}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex-col gap-2.5 border-t border-[#ebebeb] px-4 py-3.5 flex">
                                  <span className="text-[15px] leading-6 text-(--content-secondary) sm:text-[17px]">
                                    Investable assets
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex h-[34px] items-center rounded-full border border-[#ebebeb] bg-[#f5f5f7] px-3.5 text-[14px] leading-[22px] font-semibold sm:text-[16px]">
                                      {iraLabel}
                                    </span>
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Accordion Toggle Button */}
                            <button
                              type="button"
                              aria-expanded={accordionOpen}
                              onClick={() => setAccordionOpen(!accordionOpen)}
                              className="flex w-full cursor-pointer items-center gap-2 border-t border-[#ebebeb] px-4 py-3.5 text-left text-[15px] leading-6 font-semibold text-(--content-secondary) transition-colors hover:text-(--content-primary) sm:text-[17px]"
                            >
                              <span className="min-w-0 flex-1">
                                {accordionOpen ? 'Hide what you told us' : 'See what you told us'}
                              </span>
                              <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                className={`shrink-0 transition-transform duration-200 ${accordionOpen ? 'rotate-180' : ''}`}
                                aria-hidden="true"
                              >
                                <path fill="currentColor" d="M17 9.17a1 1 0 0 0-1.41 0L12 12.71L8.46 9.17a1 1 0 0 0-1.41 0a1 1 0 0 0 0 1.42l4.24 4.24a1 1 0 0 0 1.42 0L17 10.59a1 1 0 0 0 0-1.42" />
                              </svg>
                            </button>
                          </div>

                          {/* Desktop CTA Button */}
                          <div className="mt-4 hidden sm:mt-6 sm:block">
                            <div className="flex flex-col gap-2.5">
                              <button
                                data-slot="button"
                                className="inline-flex items-center justify-center transition-[color,background-color,border-color,opacity,scale] duration-[180ms] ease-out active:scale-[0.98] active:duration-[40ms] cursor-pointer disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring whitespace-nowrap text-inverse-foreground hover:opacity-90 min-w-[104px] py-4 rounded-full w-full disabled:opacity-30 h-[60px] bg-(--fill-blue) px-7 text-[16px] leading-6 font-semibold tracking-[-0.1px] disabled:bg-[#ebebeb] disabled:text-[#86868b] sm:h-14 sm:w-auto sm:min-w-0 sm:self-start sm:text-[17px]"
                                type="submit"
                              >
                                Book my complimentary video call
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: What to expect on your Video Call (Light Blue #f4f9ff) */}
                      <div className="bg-[#f4f9ff] px-5 sm:px-8 md:px-12 lg:px-16">
                        <div className="mx-auto w-full max-w-[1240px] flex flex-col gap-6 py-6 sm:gap-10 sm:py-16">
                          <div className="flex flex-col gap-4 sm:gap-6">
                            <h2 className="text-[30px] leading-9 tracking-[-0.8px] font-semibold text-(--content-primary) sm:text-[48px] sm:leading-[52px] sm:tracking-[-1.6px]">
                              What to expect on your Video Call.
                            </h2>
                            <p className="text-body-semi-bold max-w-160 text-pretty text-(--content-secondary) sm:text-[21px] sm:leading-[28px]">
                              Free thirty minutes with a RangeRange specialist.
                            </p>
                          </div>
                          <div className="flex max-w-160 flex-col gap-6">
                            <div className="flex items-start gap-3.5">
                              <span aria-hidden="true" className="mt-0.5 inline-flex size-6 flex-none items-center justify-center rounded-full bg-(--fill-green) text-white">
                                <svg viewBox="0 0 24 24" width="15" height="15" className="shrink-0" aria-hidden="true">
                                  <path fill="currentColor" d="M18.71 7.21a1 1 0 0 0-1.42 0l-7.45 7.46l-3.13-3.14A1 1 0 1 0 5.29 13l3.84 3.84a1 1 0 0 0 1.42 0l8.16-8.16a1 1 0 0 0 0-1.47" />
                                </svg>
                              </span>
                              <div className="flex min-w-0 flex-col gap-1">
                                <span className="text-[19px] leading-[26px] font-semibold text-pretty sm:text-[21px] sm:leading-[28px]">
                                  Meet our team
                                </span>
                                <span className="text-body-reduced text-pretty text-(--content-secondary)">
                                  Someone who will learn about your situation and answer your questions.
                                </span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3.5">
                              <span aria-hidden="true" className="mt-0.5 inline-flex size-6 flex-none items-center justify-center rounded-full bg-(--fill-green) text-white">
                                <svg viewBox="0 0 24 24" width="15" height="15" className="shrink-0" aria-hidden="true">
                                  <path fill="currentColor" d="M18.71 7.21a1 1 0 0 0-1.42 0l-7.45 7.46l-3.13-3.14A1 1 0 1 0 5.29 13l3.84 3.84a1 1 0 0 0 1.42 0l8.16-8.16a1 1 0 0 0 0-1.47" />
                                </svg>
                              </span>
                              <div className="flex min-w-0 flex-col gap-1">
                                <span className="text-[19px] leading-[26px] font-semibold text-pretty sm:text-[21px] sm:leading-[28px]">
                                  Learn how RangeRange works
                                </span>
                                <span className="text-body-reduced text-pretty text-(--content-secondary)">
                                  A live screen share of the platform.
                                </span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3.5">
                              <span aria-hidden="true" className="mt-0.5 inline-flex size-6 flex-none items-center justify-center rounded-full bg-(--fill-green) text-white">
                                <svg viewBox="0 0 24 24" width="15" height="15" className="shrink-0" aria-hidden="true">
                                  <path fill="currentColor" d="M18.71 7.21a1 1 0 0 0-1.42 0l-7.45 7.46l-3.13-3.14A1 1 0 1 0 5.29 13l3.84 3.84a1 1 0 0 0 1.42 0l8.16-8.16a1 1 0 0 0 0-1.47" />
                                </svg>
                              </span>
                              <div className="flex min-w-0 flex-col gap-1">
                                <span className="text-[19px] leading-[26px] font-semibold text-pretty sm:text-[21px] sm:leading-[28px]">
                                  Get your questions answered
                                </span>
                                <span className="text-body-reduced text-pretty text-(--content-secondary)">
                                  Membership, pricing, managed accounts, and what happens after the call.
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: A team of experts, not a single generalist */}
                      <div className="px-5 sm:px-8 md:px-12 lg:px-16">
                        <div className="mx-auto w-full max-w-[1240px] flex flex-col gap-6 py-6 sm:gap-12 sm:py-16">
                          <h2 className="max-w-250 text-[30px] leading-9 tracking-[-0.8px] font-semibold text-(--content-primary) sm:text-[48px] sm:leading-[52px] sm:tracking-[-1.6px]">
                            A team of experts, not a single generalist.
                          </h2>
                          <div className="flex flex-wrap items-center gap-5">
                            <div className="relative flex items-start">
                              <span
                                aria-hidden="true"
                                className="size-16 sm:size-18 shadow-[inset_0_0_0_3px_var(--color-background,#fff)] text-[28px] sm:text-[32px] relative z-10 inline-flex flex-none items-center justify-center rounded-full bg-linear-[144.542deg,#388df0_-22.17%,#938cf4_12.05%,#b668e4_50.28%,#e15562_85.17%,#e56325_117.37%] leading-[1.125] font-semibold tracking-[-0.015em] text-white"
                              >
                                Rai
                              </span>
                              <img
                                src="/planner-2-BKpnVQEJ.webp"
                                alt=""
                                className="size-16 sm:size-18 -ml-4 shadow-[inset_0_0_0_3px_var(--color-background,#fff)] flex-none rounded-full bg-(--gray-50) object-cover"
                              />
                              <img
                                src="/429dc20b4887ed74269caef47347f76485b3bd60.webp"
                                alt=""
                                className="size-16 sm:size-18 -ml-4 shadow-[inset_0_0_0_3px_var(--color-background,#fff)] flex-none rounded-full bg-(--gray-50) object-cover"
                              />
                              <img
                                src="/adfa906f00c5e1ca9ea4921848393131fbc7c252.webp"
                                alt=""
                                className="size-16 sm:size-18 -ml-4 shadow-[inset_0_0_0_3px_var(--color-background,#fff)] flex-none rounded-full bg-(--gray-50) object-cover"
                              />
                            </div>
                            <span className="min-w-0 flex-[1_1_200px] text-[19px] leading-[26px] font-semibold text-pretty text-(--content-secondary) sm:text-[21px] sm:leading-[28px]">
                              Your dedicated RangeRange team.
                            </span>
                          </div>
                          <div className="flex flex-col gap-4 sm:gap-6">
                            <div className="flex flex-col gap-1.5 rounded-[20px] border border-[#eeeeee] bg-background p-5">
                              <span className="text-[19px] leading-[26px] font-semibold">
                                The right expert for each area
                              </span>
                              <span className="text-body-reduced text-(--content-secondary)">
                                As a member, a tax question goes to a tax pro and a portfolio question to an investment expert.
                              </span>
                            </div>
                            <div className="flex flex-col gap-1.5 rounded-[20px] border border-[#eeeeee] bg-background p-5">
                              <span className="text-[19px] leading-[26px] font-semibold">
                                One membership, every part of the picture
                              </span>
                              <span className="text-body-reduced text-(--content-secondary)">
                                Investments, tax, retirement, equity comp, and estate in one plan.
                              </span>
                            </div>
                            <div className="flex flex-col gap-1.5 rounded-[20px] border border-[#eeeeee] bg-background p-5">
                              <span className="text-[19px] leading-[26px] font-semibold">
                                We manage it, not just plan it
                              </span>
                              <span className="text-body-reduced text-(--content-secondary)">
                                Open a managed account to let RangeRange implement the strategies your team builds.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Join the 0% AUM club (Light Yellow #fffdeb) */}
                      <div className="bg-[#fffdeb] px-5 sm:px-8 md:px-12 lg:px-16">
                        <div className="mx-auto w-full max-w-[1240px] flex flex-wrap items-center gap-6 py-10 sm:gap-20 sm:py-24">
                          <div className="flex min-w-0 flex-1 basis-[480px] flex-col gap-4 sm:gap-6">
                            <h2 className="text-[30px] leading-9 tracking-[-0.8px] font-semibold text-(--content-primary) sm:text-[48px] sm:leading-[52px] sm:tracking-[-1.6px]">
                              Join the 0% AUM club.
                            </h2>
                            <p className="text-body-semi-bold max-w-160 text-pretty text-(--content-secondary) sm:text-[21px] sm:leading-[28px]">
                              4,000+ households trust RangeRange with over $1 billion, all on a flat membership fee.
                            </p>
                          </div>
                          <div className="flex min-w-0 flex-1 basis-[360px] flex-col gap-4 rounded-[20px] border border-[#ebebeb] bg-background p-5 sm:p-8">
                            <span className="text-[15px] leading-6 font-semibold text-(--content-secondary) sm:text-[17px]">
                              RangeRange as of August 2026
                            </span>
                            <div className="flex items-baseline justify-between gap-4 border-t border-[#ebebeb] pt-3">
                              <span className="text-[15px] leading-6 font-semibold sm:text-[17px]">Households</span>
                              <span className="flex-none text-[28px] leading-[36px] font-semibold tracking-[-0.8px]">4,000+</span>
                            </div>
                            <div className="flex items-baseline justify-between gap-4 border-t border-[#ebebeb] pt-3">
                              <span className="text-[15px] leading-6 font-semibold sm:text-[17px]">Invested assets</span>
                              <span className="flex-none text-[28px] leading-[36px] font-semibold tracking-[-0.8px]">$1B+</span>
                            </div>
                            <div className="flex items-baseline justify-between gap-4 border-t border-[#ebebeb] pt-3">
                              <span className="text-[15px] leading-6 font-semibold sm:text-[17px]">AUM fees</span>
                              <span className="flex-none text-[28px] leading-[36px] font-semibold tracking-[-0.8px] text-[#2c7a4a]">0%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 5: What to know about Range */}
                      <div className="px-5 sm:px-8 md:px-12 lg:px-16">
                        <div className="mx-auto w-full max-w-[1240px] flex flex-col gap-3 py-6 sm:py-16">
                          <h2 className="text-[30px] leading-9 tracking-[-0.8px] font-semibold text-(--content-primary) sm:text-[48px] sm:leading-[52px] sm:tracking-[-1.6px]">
                            What to know about RangeRange.
                          </h2>
                          <p className="text-body-semi-bold max-w-160 text-pretty text-(--content-secondary) sm:text-[21px] sm:leading-[28px]">
                            A few things worth knowing before you talk to us.
                          </p>
                          <div className="mt-2 flex flex-col">
                            <div className="flex flex-wrap items-baseline gap-3 border-t border-[#ececec] py-3">
                              <span className="w-[110px] flex-none text-[15px] leading-6 font-semibold sm:w-40 sm:text-[17px]">
                                Fiduciary
                              </span>
                              <span className="min-w-[200px] flex-1 text-[15px] leading-6 text-pretty text-(--content-secondary) sm:text-[17px]">
                                We work for your best interest. RangeRange is a Registered Investment Advisor.
                              </span>
                            </div>
                            <div className="flex flex-wrap items-baseline gap-3 border-t border-[#ececec] py-3">
                              <span className="w-[110px] flex-none text-[15px] leading-6 font-semibold sm:w-40 sm:text-[17px]">
                                Flat fee
                              </span>
                              <span className="min-w-[200px] flex-1 text-[15px] leading-6 text-pretty text-(--content-secondary) sm:text-[17px]">
                                One membership price, never a percentage of your assets.
                              </span>
                            </div>
                            <div className="flex flex-wrap items-baseline gap-3 border-t border-[#ececec] py-3">
                              <span className="w-[110px] flex-none text-[15px] leading-6 font-semibold sm:w-40 sm:text-[17px]">
                                Full picture
                              </span>
                              <span className="min-w-[200px] flex-1 text-[15px] leading-6 text-pretty text-(--content-secondary) sm:text-[17px]">
                                Investments, taxes, retirement, and estate in one plan.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sticky Mobile CTA Button */}
                      <div className="sticky bottom-0 z-10 border-t border-[#ebebeb] bg-background px-5 pt-3 pb-4 sm:hidden">
                        <div className="flex flex-col gap-2.5">
                          <button
                            data-slot="button"
                            className="inline-flex items-center justify-center transition-[color,background-color,border-color,opacity,scale] duration-[180ms] ease-out active:scale-[0.98] active:duration-[40ms] cursor-pointer disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring whitespace-nowrap text-inverse-foreground hover:opacity-90 min-w-[104px] py-4 rounded-full w-full disabled:opacity-30 h-[60px] bg-(--fill-blue) px-7 text-[16px] leading-6 font-semibold tracking-[-0.1px] disabled:bg-[#ebebeb] disabled:text-[#86868b] sm:h-14 sm:w-auto sm:min-w-0 sm:self-start sm:text-[17px]"
                            type="submit"
                          >
                            Book my complimentary video call
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Dark regulatory footer */}
              <Footer />
            </div>
          </div>
        </main>
      );
    }

    default:
      return null;
  }
}
