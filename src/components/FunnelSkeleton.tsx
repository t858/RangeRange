'use client';

import React from 'react';
import Link from 'next/link';
import Footer from './Footer';
import RaiTypewriter from './RaiTypewriter';
import RangeLogo from './RangeLogo';

interface FunnelSkeletonProps {
  progress?: number;
  badge?: string;
  showBack?: boolean;
  onBack?: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  raiMessage?: string;
  submitButtonText?: string;
  isSubmitting?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
  children: React.ReactNode;
  hideContinueButton?: boolean;
  formId?: string;
}

export default function FunnelSkeleton({
  progress = 0,
  badge,
  showBack = false,
  onBack,
  title,
  subtitle,
  raiMessage,
  submitButtonText = 'Continue',
  isSubmitting = false,
  onSubmit,
  children,
  hideContinueButton = false,
  formId = 'funnel-form',
}: FunnelSkeletonProps) {
  const progressPercent = progress > 0 ? progress : 0;
  const progressTransform = progress > 0 ? `translateX(-${100 - progressPercent}%)` : 'translateX(-100%)';

  return (
    <main className="min-h-dvh bg-background-secondary">
      <div className="flex min-h-dvh flex-col bg-background">
        <div className="flex min-h-dvh flex-col sm:min-h-[max(52.5rem,calc(100dvh-10rem))]">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur-xl border-transparent">
            <div className="px-5 sm:px-8 md:px-12 lg:px-16">
              <div className="mx-auto w-full max-w-[1240px] flex items-center gap-3 pt-8 pb-4 sm:gap-6 sm:pt-14">
                {showBack && (
                  <button
                    type="button"
                    onClick={onBack || (() => window.history.back())}
                    aria-label="Go back"
                    className="inline-flex h-8 flex-none items-center justify-center overflow-hidden rounded-full bg-[#ebebeb] text-(--content-primary) transition-[width,opacity,margin] duration-300 hover:bg-(--gray-100) w-8 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0" aria-hidden="true">
                      <path fill="currentColor" d="m11.29 12l3.54-3.54a1 1 0 0 0 0-1.41a1 1 0 0 0-1.42 0l-4.24 4.24a1 1 0 0 0 0 1.42L13.41 17a1 1 0 0 0 .71.29a1 1 0 0 0 .71-.29a1 1 0 0 0 0-1.41Z" />
                    </svg>
                  </button>
                )}
                <RangeLogo />

                {badge && (
                  <span className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 sm:h-9 sm:px-[18px] bg-[#e6f4ea]">
                    <svg viewBox="0 0 24 24" width="14" height="14" className="shrink-0 text-[#2c7a4a]" aria-hidden="true">
                      <path fill="currentColor" d="M18.71 7.21a1 1 0 0 0-1.42 0l-7.45 7.46l-3.13-3.14A1 1 0 1 0 5.29 13l3.84 3.84a1 1 0 0 0 1.42 0l8.16-8.16a1 1 0 0 0 0-1.47"></path>
                    </svg>
                    <span className="text-[12px] leading-4 font-semibold tracking-[0.02em] uppercase sm:text-[14px] sm:leading-5 text-[#2c7a4a]">
                      {badge}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {progress > 0 && (
              <div className="px-5 sm:px-8 md:px-12 lg:px-16">
                <div className="mx-auto w-full max-w-[1240px]">
                  <div
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={progress}
                    aria-valuetext={`${progress}%`}
                    role="progressbar"
                    data-state="loading"
                    data-value={progress}
                    data-max={100}
                    data-slot="progress"
                    className="relative w-full overflow-hidden rounded-full h-[3px] bg-[#ebebeb] [&>[data-slot=progress-indicator]]:rounded-r-full [&>[data-slot=progress-indicator]]:bg-(--content-primary) [&>[data-slot=progress-indicator]]:duration-300"
                  >
                    <div
                      data-state="loading"
                      data-value={progress}
                      data-max={100}
                      data-slot="progress-indicator"
                      className="h-full w-full flex-1 bg-primary transition-all"
                      style={{ transform: progressTransform }}
                    />
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* Form Content Area */}
          <div className="flex w-full flex-1 flex-col pt-6 pb-0 sm:flex-none sm:pt-10 px-5 sm:px-8 md:px-12 lg:px-16 sm:pb-10">
            <div className="mx-auto w-full max-w-[1240px] flex flex-1 flex-col">
              <div className="flex w-full flex-1 flex-col gap-4 [&_form]:flex [&_form]:w-full [&_form]:flex-1 [&_form]:flex-col [&_form]:gap-4 max-w-160">
                {title && (
                  <h1 className="max-w-250 text-[40px] leading-[44px] font-semibold tracking-[-2px] text-pretty text-(--content-primary) sm:text-[48px] sm:leading-[52px] sm:tracking-[-1.6px]">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mb-2 max-w-160 text-[19px] leading-[26px] font-semibold text-pretty text-(--content-secondary) sm:text-[21px] sm:leading-[28px]">
                    {subtitle}
                  </p>
                )}

                <form
                  id={formId}
                  onSubmit={onSubmit || ((e) => e.preventDefault())}
                  className="flex w-full flex-1 flex-col gap-4"
                >
                  {children}

                  {/* Bottom Action Area with Rai card and Continue Button */}
                  {!hideContinueButton && (
                    <div className="sticky bottom-0 z-10 mt-auto -mx-5 flex flex-col gap-3 bg-background px-5 sm:static sm:mx-0 sm:mt-2 sm:gap-8 sm:bg-transparent sm:p-0 sm:shadow-none border-t border-[#ebebeb] pt-3 pb-4 sm:border-none">
                      {raiMessage && (
                        <div className="flex h-28 w-full items-center gap-3 rounded-2xl bg-[#efe5ff] p-4 sm:h-22">
                          <span
                            aria-hidden="true"
                            className="inline-flex flex-none items-center justify-center bg-linear-[135deg,#5b7cf5_0%,#9a6ae0_35%,#c05fb0_60%,#e0505a_85%,#e8604a_100%] font-semibold tracking-[-0.3px] text-white size-8 rounded-full text-[12px]"
                          >
                            Rai
                          </span>
                          <p className="m-0 min-w-0 text-[16px] leading-[26px] text-pretty text-(--content-primary) sm:text-[18px]">
                            <RaiTypewriter initialMessage={raiMessage} />
                          </p>
                        </div>
                      )}

                      <button
                        data-slot="button"
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center transition-[color,background-color,border-color,opacity,scale] duration-[180ms] ease-out active:scale-[0.98] active:duration-[40ms] cursor-pointer disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring whitespace-nowrap text-inverse-foreground hover:opacity-90 min-w-[104px] py-4 rounded-full w-full disabled:opacity-30 h-[60px] bg-(--fill-blue) px-7 text-[16px] leading-6 font-semibold tracking-[-0.1px] disabled:bg-[#ebebeb] disabled:text-[#86868b] sm:h-14 sm:w-auto sm:min-w-0 sm:self-start sm:text-[17px]"
                      >
                        {submitButtonText}
                      </button>
                    </div>
                  )}
                </form>
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
