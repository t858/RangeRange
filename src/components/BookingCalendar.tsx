'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Footer from './Footer';
import RangeLogo from './RangeLogo';

interface BookingCalendarProps {
  initialDate?: string; // 'today' | 'tomorrow' | 'any' | formatted string
  onSelectTime: (dateLabel: string, timeLabel: string, timestamp?: number) => void;
  onBack: () => void;
}

export default function BookingCalendar({
  initialDate = 'today',
  onSelectTime,
  onBack,
}: BookingCalendarProps) {
  // Base date
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  // Navigation state (0 = current month)
  const [monthOffset, setMonthOffset] = useState<number>(0);

  // Month being viewed
  const viewDate = useMemo(() => {
    return new Date(currentYear, currentMonth + monthOffset, 1);
  }, [currentYear, currentMonth, monthOffset]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Selected date state
  const defaultSelectedDay = useMemo(() => {
    if (initialDate === 'tomorrow') {
      const tomorrow = new Date(currentYear, currentMonth, currentDay + 1);
      return { year: tomorrow.getFullYear(), month: tomorrow.getMonth(), day: tomorrow.getDate() };
    }
    if (initialDate === 'any') {
      // Find upcoming Monday or next weekday
      const nextDay = new Date(currentYear, currentMonth, currentDay + 3);
      return { year: nextDay.getFullYear(), month: nextDay.getMonth(), day: nextDay.getDate() };
    }
    // today
    return { year: currentYear, month: currentMonth, day: currentDay };
  }, [initialDate, currentYear, currentMonth, currentDay]);

  const [selectedDate, setSelectedDate] = useState(defaultSelectedDay);

  // Formatted date string for the right column: e.g. "Monday, November 9"
  const formattedSelectedDate = useMemo(() => {
    const d = new Date(selectedDate.year, selectedDate.month, selectedDate.day);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDate]);

  // Generate 7-column calendar matrix with identical structure to react-day-picker
  const weeks = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // Sunday = 0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const weeksList: Array<
      Array<{
        isOutside: boolean;
        dayNum: number;
        dateStr: string;
        isDisabled: boolean;
        isToday: boolean;
        isSelected: boolean;
        ariaLabel: string;
      }>
    > = [];

    let currentWeek: Array<{
      isOutside: boolean;
      dayNum: number;
      dateStr: string;
      isDisabled: boolean;
      isToday: boolean;
      isSelected: boolean;
      ariaLabel: string;
    }> = [];

    const todayStart = new Date(currentYear, currentMonth, currentDay).getTime();

    // Leading empty cells for previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({
        isOutside: true,
        dayNum: 0,
        dateStr: '',
        isDisabled: true,
        isToday: false,
        isSelected: false,
        ariaLabel: '',
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(viewYear, viewMonth, d);
      const isPast = cellDate.getTime() < todayStart;
      const isToday =
        viewYear === currentYear && viewMonth === currentMonth && d === currentDay;
      const isSelected =
        viewYear === selectedDate.year &&
        viewMonth === selectedDate.month &&
        d === selectedDate.day;

      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const weekdayName = cellDate.toLocaleDateString('en-US', { weekday: 'long' });
      const monthLabel = cellDate.toLocaleDateString('en-US', { month: 'long' });

      // Suffix (1st, 2nd, 3rd, 4th...)
      const suffix =
        d % 10 === 1 && d !== 11
          ? 'st'
          : d % 10 === 2 && d !== 12
          ? 'nd'
          : d % 10 === 3 && d !== 13
          ? 'rd'
          : 'th';

      const ariaLabel = isToday
        ? `Today, ${weekdayName}, ${monthLabel} ${d}${suffix}, ${viewYear}`
        : isSelected
        ? `${weekdayName}, ${monthLabel} ${d}${suffix}, ${viewYear}, selected`
        : `${weekdayName}, ${monthLabel} ${d}${suffix}, ${viewYear}`;

      currentWeek.push({
        isOutside: false,
        dayNum: d,
        dateStr,
        isDisabled: isPast,
        isToday,
        isSelected,
        ariaLabel,
      });

      if (currentWeek.length === 7) {
        weeksList.push(currentWeek);
        currentWeek = [];
      }
    }

    // Trailing cells to fill the last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          isOutside: true,
          dayNum: 0,
          dateStr: '',
          isDisabled: true,
          isToday: false,
          isSelected: false,
          ariaLabel: '',
        });
      }
      weeksList.push(currentWeek);
    }

    return weeksList;
  }, [viewYear, viewMonth, currentYear, currentMonth, currentDay, selectedDate]);

  // Range time slots from original page
  const timeSlots = [
    '2:30pm', '2:45pm', '3:00pm', '3:15pm',
    '3:30pm', '3:45pm', '4:00pm', '4:15pm',
    '4:30pm', '4:45pm', '5:00pm', '5:15pm',
    '5:30pm', '5:45pm', '6:00pm', '6:15pm',
    '6:30pm', '6:45pm', '7:00pm', '7:15pm',
    '7:30pm', '7:45pm', '8:00pm', '8:15pm',
    '8:30pm', '8:45pm', '9:00pm', '9:15pm',
    '9:30pm', '9:45pm', '10:00pm', '10:15pm',
    '10:30pm', '10:45pm', '11:00pm', '11:15pm',
    '11:30pm',
  ];

  return (
    <main className="min-h-dvh bg-background-secondary">
      <div className="flex min-h-dvh flex-col bg-background">
        <div className="flex min-h-dvh flex-col sm:min-h-[max(52.5rem,calc(100dvh-10rem))]">
          {/* Header matching original Range design */}
          <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur-xl border-black/10">
            <div className="px-5 sm:px-8 md:px-12 lg:px-16">
              <div className="mx-auto w-full max-w-[1240px] flex items-center gap-3 pt-8 pb-4 sm:gap-6 sm:pt-14">
                <button
                  type="button"
                  onClick={onBack}
                  title="Back to overview"
                  className="inline-flex size-9 items-center justify-center rounded-full border border-[#ebebeb] text-(--content-primary) hover:bg-[#f5f5f7] transition-colors cursor-pointer mr-1"
                  aria-label="Back to overview"
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
                  {/* Headline & Subtitle */}
                  <h1 className="text-headline-reduced-large text-foreground text-pretty sm:text-headline-large">
                    Let&apos;s get your call scheduled with RangeRange.
                  </h1>
                  <p className="text-label-large text-muted-foreground">
                    Select a date and time.
                  </p>

                  {/* Calendar & Times Card - 1:1 original markup */}
                  <div className="flex flex-col overflow-hidden rounded-[20px] border border-[#ebebeb] md:flex-row bg-background">
                    {/* Left Column: Calendar */}
                    <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
                      <div
                        data-slot="calendar"
                        className="w-fit rdp-root group/calendar bg-background [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent rtl:**:[.rdp-button\_next>svg]:rotate-180 rtl:**:[.rdp-button\_previous>svg]:rotate-180 mx-auto p-0 [--cell-size:--spacing(10)]"
                        lang="en-US"
                        data-mode="single"
                        data-required="true"
                        style={{ ['--cell-size' as string]: '2.5rem' }}
                      >
                        <div className="relative flex flex-col gap-4 md:flex-row rdp-months">
                          {/* Navigation Bar */}
                          <nav className="absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1 rdp-nav" aria-label="Navigation bar">
                            <button
                              type="button"
                              onClick={() => setMonthOffset((m) => Math.max(0, m - 1))}
                              disabled={monthOffset === 0}
                              className="inline-flex items-center justify-center font-semibold tracking-(--font-letter-spacing-base) transition-[color,background-color,border-color,opacity,scale] duration-[180ms] ease-out active:scale-[0.98] active:duration-[40ms] cursor-pointer disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring whitespace-nowrap bg-transparent text-foreground hover:bg-background-secondary rounded-[8px] text-[length:var(--font-size-4)] leading-(--font-line-height-4) size-(--cell-size) min-w-0 p-0 select-none aria-disabled:opacity-50 rdp-button_previous"
                              aria-label="Go to the Previous Month"
                            >
                              <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" className="size-4 rdp-chevron">
                                <path fill="currentColor" d="m11.29 12l3.54-3.54a1 1 0 0 0 0-1.41a1 1 0 0 0-1.42 0l-4.24 4.24a1 1 0 0 0 0 1.42L13.41 17a1 1 0 0 0 .71.29a1 1 0 0 0 .71-.29a1 1 0 0 0 0-1.41Z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setMonthOffset((m) => m + 1)}
                              className="inline-flex items-center justify-center font-semibold tracking-(--font-letter-spacing-base) transition-[color,background-color,border-color,opacity,scale] duration-[180ms] ease-out active:scale-[0.98] active:duration-[40ms] cursor-pointer disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring whitespace-nowrap bg-transparent text-foreground hover:bg-background-secondary rounded-[8px] text-[length:var(--font-size-4)] leading-(--font-line-height-4) size-(--cell-size) min-w-0 p-0 select-none aria-disabled:opacity-50 rdp-button_next"
                              aria-label="Go to the Next Month"
                            >
                              <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" className="size-4 rdp-chevron">
                                <path fill="currentColor" d="m14.83 11.29l-4.24-4.24a1 1 0 0 0-1.42 0a1 1 0 0 0 0 1.41L12.71 12l-3.54 3.54a1 1 0 0 0 0 1.41a1 1 0 0 0 .71.29a1 1 0 0 0 .71-.29l4.24-4.24a1 1 0 0 0 0-1.42" />
                              </svg>
                            </button>
                          </nav>

                          {/* Month Table */}
                          <div className="flex w-full flex-col gap-4 rdp-month">
                            <div className="flex h-(--cell-size) w-full items-center justify-center px-(--cell-size) rdp-month_caption">
                              <span className="font-medium select-none text-sm rdp-caption_label" role="status" aria-live="polite">
                                {monthName}
                              </span>
                            </div>
                            <table role="grid" aria-multiselectable="false" aria-label={monthName} className="w-full border-collapse rdp-month_grid">
                              <thead aria-hidden="true">
                                <tr className="flex rdp-weekdays">
                                  <th aria-label="Sunday" className="flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none rdp-weekday" scope="col">Su</th>
                                  <th aria-label="Monday" className="flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none rdp-weekday" scope="col">Mo</th>
                                  <th aria-label="Tuesday" className="flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none rdp-weekday" scope="col">Tu</th>
                                  <th aria-label="Wednesday" className="flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none rdp-weekday" scope="col">We</th>
                                  <th aria-label="Thursday" className="flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none rdp-weekday" scope="col">Th</th>
                                  <th aria-label="Friday" className="flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none rdp-weekday" scope="col">Fr</th>
                                  <th aria-label="Saturday" className="flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none rdp-weekday" scope="col">Sa</th>
                                </tr>
                              </thead>
                              <tbody className="rdp-weeks">
                                {weeks.map((week, wIdx) => (
                                  <tr key={`week-${wIdx}`} className="mt-2 flex w-full rdp-week">
                                    {week.map((cell, cIdx) => {
                                      if (cell.isOutside) {
                                        return (
                                          <td
                                            key={`cell-out-${wIdx}-${cIdx}`}
                                            className="group/day relative aspect-square h-full w-full p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-md [&:first-child[data-selected=true]_button]:rounded-l-md rdp-day text-muted-foreground opacity-50 rdp-disabled invisible rdp-hidden text-muted-foreground aria-selected:text-muted-foreground rdp-outside"
                                            role="gridcell"
                                            data-disabled="true"
                                            data-hidden="true"
                                            data-outside="true"
                                          />
                                        );
                                      }

                                      if (cell.isDisabled) {
                                        return (
                                          <td
                                            key={`cell-${cell.dateStr}`}
                                            className={`group/day relative aspect-square h-full w-full p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-md [&:first-child[data-selected=true]_button]:rounded-l-md rdp-day text-muted-foreground opacity-50 rdp-disabled ${
                                              cell.isToday ? 'rounded-md bg-accent text-accent-foreground data-[selected=true]:rounded-none rdp-today' : ''
                                            }`}
                                            role="gridcell"
                                            data-day={cell.dateStr}
                                            data-disabled="true"
                                            data-today={cell.isToday ? 'true' : undefined}
                                          >
                                            <button
                                              data-slot="button"
                                              disabled
                                              className="items-center justify-center tracking-(--font-letter-spacing-base) transition-[color,background-color,border-color,opacity,scale] duration-[180ms] ease-out active:scale-[0.98] active:duration-[40ms] cursor-pointer disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring whitespace-nowrap bg-transparent text-foreground hover:bg-background-secondary rounded-[4px] text-[length:var(--font-size-3)] disabled:opacity-30 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col p-0 gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground [&>span]:text-xs [&>span]:opacity-70 rdp-day rdp-day_button"
                                              data-day={cell.dateStr}
                                              type="button"
                                              tabIndex={-1}
                                              aria-label={cell.ariaLabel}
                                            >
                                              {cell.dayNum}
                                            </button>
                                          </td>
                                        );
                                      }

                                      if (cell.isSelected) {
                                        return (
                                          <td
                                            key={`cell-${cell.dateStr}`}
                                            className="group/day relative aspect-square h-full w-full p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-md [&:first-child[data-selected=true]_button]:rounded-l-md rdp-day rdp-selected"
                                            role="gridcell"
                                            aria-selected="true"
                                            data-day={cell.dateStr}
                                            data-selected="true"
                                          >
                                            <button
                                              data-slot="button"
                                              data-selected-single="true"
                                              className="items-center justify-center tracking-(--font-letter-spacing-base) transition-[color,background-color,border-color,opacity,scale] duration-[180ms] ease-out active:scale-[0.98] active:duration-[40ms] cursor-pointer disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring whitespace-nowrap bg-transparent text-foreground hover:bg-background-secondary rounded-[4px] text-[length:var(--font-size-3)] disabled:opacity-30 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col p-0 gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground [&>span]:text-xs [&>span]:opacity-70 rdp-day rdp-day_button"
                                              data-day={cell.dateStr}
                                              type="button"
                                              tabIndex={0}
                                              aria-label={cell.ariaLabel}
                                              onClick={() => setSelectedDate({ year: viewYear, month: viewMonth, day: cell.dayNum })}
                                            >
                                              {cell.dayNum}
                                            </button>
                                          </td>
                                        );
                                      }

                                      // Regular selectable day
                                      return (
                                        <td
                                          key={`cell-${cell.dateStr}`}
                                          className={`group/day relative aspect-square h-full w-full p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-md [&:first-child[data-selected=true]_button]:rounded-l-md rdp-day ${
                                            cell.isToday ? 'rounded-md bg-accent text-accent-foreground data-[selected=true]:rounded-none rdp-today' : ''
                                          }`}
                                          role="gridcell"
                                          data-day={cell.dateStr}
                                          data-today={cell.isToday ? 'true' : undefined}
                                        >
                                          <button
                                            data-slot="button"
                                            className="items-center justify-center tracking-(--font-letter-spacing-base) transition-[color,background-color,border-color,opacity,scale] duration-[180ms] ease-out active:scale-[0.98] active:duration-[40ms] cursor-pointer disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring whitespace-nowrap bg-transparent text-foreground hover:bg-background-secondary rounded-[4px] text-[length:var(--font-size-3)] disabled:opacity-30 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col p-0 gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground [&>span]:text-xs [&>span]:opacity-70 rdp-day rdp-day_button"
                                            data-day={cell.dateStr}
                                            type="button"
                                            tabIndex={-1}
                                            aria-label={cell.ariaLabel}
                                            onClick={() => setSelectedDate({ year: viewYear, month: viewMonth, day: cell.dayNum })}
                                          >
                                            {cell.dayNum}
                                          </button>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Timezone & Contact Note */}
                      <p className="text-caption text-muted-foreground">Time zone: GMT+1</p>
                      <p className="text-caption text-muted-foreground border-t border-[#ebebeb] pt-3">
                        Don&apos;t see a time that works? Contact us at{' '}
                        <a href="mailto:membership@rangerange.com" className="text-(--fill-blue) underline">
                          membership@rangerange.com
                        </a>
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="mx-3 border-b border-[#ebebeb] md:mx-0 md:my-3 md:border-r md:border-b-0" />

                    {/* Right Column: Time Slots */}
                    <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-body-semi-bold">{formattedSelectedDate}</p>
                        <p className="text-caption text-muted-foreground">Duration: 30 min</p>
                      </div>

                      <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            data-slot="button"
                            onClick={() => {
                              const d = new Date(selectedDate.year, selectedDate.month, selectedDate.day, 23, 59, 59);
                              onSelectTime(formattedSelectedDate, slot, d.getTime());
                            }}
                            className="inline-flex items-center font-semibold tracking-(--font-letter-spacing-base) transition-[color,background-color,border-color,opacity,scale] duration-[180ms] ease-out active:scale-[0.98] active:duration-[40ms] cursor-pointer disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring whitespace-nowrap bg-secondary text-secondary-foreground border border-border hover:bg-background-secondary min-w-[104px] text-[length:var(--font-size-4)] leading-(--font-line-height-4) w-full h-auto justify-between rounded-[12px] px-4 py-3 disabled:opacity-100"
                            type="button"
                          >
                            <span className="text-body-semi-bold text-foreground">{slot}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
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
