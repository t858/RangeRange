# Range Onboarding Funnel (Next.js)

A high-performance Next.js implementation of Range's IRA onboarding funnel, built using the **Static Skeleton Pattern** and **Client-Side Hydration**.

---

## Architecture Overview

### 1. The "Static Skeleton" Pattern (SSG / SSR)
- Every route (`/step/1` through `/step/10` and `/booked`) pre-renders a pixel-perfect **static HTML skeleton** at build time using `generateStaticParams()`.
- **Zero Layout Shift (CLS = 0)**: The skeleton markup immediately renders the exact container geometry, header, progress indicator, typography, and regulatory footer.
- Delivers instantaneous **First Contentful Paint (FCP)** without content jumping.

### 2. Client-Side Hydration (`'use client'`)
- Replaces static placeholders with reactive client controls once the React bundle mounts.
- **Funnel Context & Local Persistence**: Maintains user answers (`iraAmount`, `focusAreas`, `firstName`, `lastName`, `hasHadAdvisor`, `concerns`, `household`, `householdIncome`, `email`, `appointmentTime`) across all steps and browser refreshes without hydration mismatches (`isHydrated` pattern).
- Dynamic name personalization carried through steps (e.g. *"Good to meet you, Drake"*).
- Animated progress matching in Step 9 with automatic timer navigation to Step 10.
- Interactive specialist booking and appointment confirmation with Google & Apple Calendar exports.

---

## Route & Step Map

| Folder Source | Next.js Route | Progress | Question / Headline | Interactive Trigger |
|---|---|---|---|---|
| `page1` | `/step/1` | 11% | How much is in your IRA? | Select radio option &rarr; Continue |
| `page2` | `/step/2` | 22% | What brings you to Range? | Toggle focus checkboxes &rarr; Continue |
| `page3` | `/step/3` | 33% | We cover all of that. Ready to start? | Enter first and last name &rarr; Continue |
| `page4` | `/step/4` | 44% | Good to meet you, {name}. Have you had an advisor? | Select Yes / No &rarr; Continue |
| `page5` | `/step/5` | 56% | What should your team know? | Toggle concerns &rarr; Continue |
| `page6` | `/step/6` | 67% | Got it, and who's in your household? | Toggle household members &rarr; Continue |
| `page7` | `/step/7` | 78% | {name}, what is your annual household income? | Select income tier &rarr; Continue |
| `page8` | `/step/8` | 89% | Let's see what Range can do for you. | Enter email &rarr; Check my eligibility |
| `page9` | `/step/9` | 100% | Checking your eligibility… | Animated gradient bar auto-navigates |
| `page10` | `/step/10` | Eligible | Get your IRA managed by the best team. | Select day, time slot, phone &rarr; Book call |
| `appointment set`| `/booked` | Call booked | You're all set, {name}. | Calendar export, survey, product demos |

---

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the funnel.

To build for production:

```bash
npm run build
npm run start
```
