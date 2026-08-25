# AGENTS.md

> Architectural and Domain Guide for AI Coding Agents and LLMs working on `wechselmodell-rechner`.

---

## 1. Project Overview & Mission

`wechselmodell-rechner` is a high-precision, deterministic TypeScript calculation engine and React single-page application for computing child support in a **symmetrical 50:50 alternating custody model** (_paritätisches Wechselmodell_) under German family law.

All calculations strictly adhere to statutory provisions (**§ 1606 Abs. 3 S. 1 BGB**, **§ 1612b BGB**) and binding Federal Court of Justice precedents (**BGH XII ZB 565/15**, **BGH XII ZB 599/13**, **BGH XII ZB 45/15**, **BGH XII ZB 601/13**) based on the **Düsseldorfer Tabelle 2026**.

- **Tech Stack:** React 19.2, TypeScript 6 (Strict Mode), Vite 8.2, Oxlint, Stylelint, HTMLHint, Prettier, Husky, Lint-Staged, Vitest 4.1 (Happy-DOM).
- **CI/CD & Maintenance:** Continuous Integration (`.github/workflows/ci.yml`), GitHub Pages Deployment (`.github/workflows/publish.yml`), Scheduled maintenance updates (`.github/workflows/scheduled-npm-update.yml`), Dependabot Auto-Merge (`.github/workflows/dependabot-auto-merge.yml`), and Dependabot config (`.github/dependabot.yml`).

---

## 2. Domain & Mathematical Invariants

When editing or extending the calculation engines, you **MUST NEVER VIOLATE** the following statutory and mathematical invariants:

### A. Income Harmonization & Deductions (`src/calculator/incomeEngine.ts`)

- **Annual Basis Conversion**: To account for annual bonuses, variable dividends, 13th/14th salaries, and tax refunds, annual amounts are normalized to monthly amounts via $\text{Annual} / 12$.
- **Occupational Expenses (_Berufsbedingte Aufwendungen_)**:
  - If employed with flat rate: $5\%$ of net income, clamped between **$50\ €$ (min)** and **$150\ €$ (max)** (Düsseldorfer Tabelle Anm. A.3).
  - If custom proof: exact annualized/monthly verified amount.
  - If unemployed: $0\ €$.
- **Private Retirement Provision (_Zusätzliche Altersvorsorge_)**:
  - Strictly capped at **$4\ \%$ of gross income** (**BGH XII ZR 149/01**).
- **Adjusted Net Income ($N_{\text{adj}}$)**:
  $$N_{\text{adj}} = N_{\text{net}} + \text{Wohnvorteil} - (\text{Berufsaufwand} + \text{Vorsorge}_{\text{max } 4\%} + \text{Schulden} + \text{Sonstige Abzüge})$$

### B. The 7-Step Wechselmodell Calculation (`src/calculator/custodyEngine.ts`)

1. **Combined Income & Table Tier Determination**:
   - $N_{\text{comb}} = N_{\text{adj}, A} + N_{\text{adj}, B}$.
   - Evaluated against the 15 income tiers of the Düsseldorfer Tabelle 2026 to obtain $B_{\text{tab}}$ per child age group.
2. **Liability Incomes & Quotas ($Q_A, Q_B$)**:
   - Adequate retention rate: $SB_{\text{ang}} = 1.750\ €$.
   - $H_A = \max(0, N_{\text{adj}, A} - 1.750\ €)$ and $H_B = \max(0, N_{\text{adj}, B} - 1.750\ €)$.
   - $Q_A = H_A / (H_A + H_B)$ and $Q_B = H_B / (H_A + H_B)$.
   - _Mangelfall fallback_: If $H_{\text{total}} = 0$, evaluate against necessary retention ($SB_{\text{notw}} = 1.450\ €$ employed / $1.200\ €$ unemployed).
3. **Real Housing Additional Need (_Wohnmehrbedarf_, BGH XII ZB 565/15 Rn. 25)**:
   - Per-capita household division:
     $$\text{Actual Child Housing} = \frac{\text{Warm Rent}_A}{\text{Persons}_A} + \frac{\text{Warm Rent}_B}{\text{Persons}_B}$$
   - $20\%$ tabular housing deduction: $\text{Table Housing} = 0{,}20 \cdot B_{\text{tab}}$.
   - $\text{Wohnmehrbedarf} = \max(0, \text{Actual Child Housing} - \text{Table Housing})$.
   - Total Child Need: $B_{\text{ges}} = B_{\text{tab}} + \text{Wohnmehrbedarf} + \text{Other Surcharges}$.
4. **In-Kind Care Deduction (_Naturalunterhalt_, 50%)**:
   - Each parent provides $50\%$ of child needs in-kind at their household.
   - Primary cash support obligation:
     $$U_{\text{prim}, A} = \text{Anteil}_A - 0{,}5 \cdot B_{\text{ges}} = B_{\text{ges}} \cdot Q_A - 0{,}5 \cdot B_{\text{ges}}$$
5. **Quota-Based Direct Expense Reimbursement (BGH XII ZB 565/15 Rn. 28–30)**:
   - Cash expenditures for child items (Hort, school meals, clothes) $D_A, D_B$ are shared by liability quotas:
     $$\Delta D_A = Q_A \cdot D_B - Q_B \cdot D_A$$
6. **Kindergeld Equalization ($\Delta KG$, BGH XII ZB 45/15 & XII ZB 565/15 Rn. 32)**:
   - State Kindergeld ($250\ €$ or $259\ €$) is halved ($0{,}5 \cdot KG$).
   - If Parent A receives it from Familienkasse: $\Delta KG_A = + KG / 2$.
   - If Parent B receives it: $\Delta KG_A = - KG / 2$.
7. **Net Settlement (_Spitzabrechnung_, $Z_A$)**:
   $$Z_A = U_{\text{prim}, A} + \Delta D_A + \Delta KG_A \quad (Z_B = -Z_A)$$

---

## 3. Codebase Map & Key Modules

| Module Path                                                                                                                               | Responsibility                                                                             |
| :---------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| [`src/calculator/custodyEngine.ts`](file:///workspaces/wechselmodell-rechner/src/calculator/custodyEngine.ts)                             | Core 7-step Wechselmodell engine and audit trail generator.                                |
| [`src/calculator/incomeEngine.ts`](file:///workspaces/wechselmodell-rechner/src/calculator/incomeEngine.ts)                               | Adjusted net income engine (5% flat rate, 4% pension cap, debts).                          |
| [`src/calculator/betreuungsunterhaltEngine.ts`](file:///workspaces/wechselmodell-rechner/src/calculator/betreuungsunterhaltEngine.ts)     | § 1615l BGB childcare support engine for toddlers under 3 years.                           |
| [`src/calculator/rounding.ts`](file:///workspaces/wechselmodell-rechner/src/calculator/rounding.ts)                                       | Deterministic floating-point rounding helpers (`round2`, `round4`, `clamp`).               |
| [`src/config/dtTable2026.ts`](file:///workspaces/wechselmodell-rechner/src/config/dtTable2026.ts)                                         | Düsseldorfer Tabelle 2026 rate matrices and retention configurations.                      |
| [`src/config/scenarios.ts`](file:///workspaces/wechselmodell-rechner/src/config/scenarios.ts)                                             | Preset calculation scenarios (BGH standard, multi-child housing, Mangelfall, high-income). |
| [`src/config/legalConfig.ts`](file:///workspaces/wechselmodell-rechner/src/config/legalConfig.ts)                                         | Base64 contact obfuscation & CI/CD injection (`__LEGAL_CONFIG_B64__`).                     |
| [`src/components/Header.tsx`](file:///workspaces/wechselmodell-rechner/src/components/Header.tsx)                                         | Header with legal DT 2026 / BGH badges and popover disclaimer.                             |
| [`src/components/ActionBar.tsx`](file:///workspaces/wechselmodell-rechner/src/components/ActionBar.tsx)                                   | Preset selector, clipboard copy, print triggering, and state reset.                        |
| [`src/components/ParentInputCard.tsx`](file:///workspaces/wechselmodell-rechner/src/components/ParentInputCard.tsx)                       | Parent configuration card (income, rent, household persons, Eigenheim toggle).             |
| [`src/components/ChildrenInputCard.tsx`](file:///workspaces/wechselmodell-rechner/src/components/ChildrenInputCard.tsx)                   | Children management card with live Wohnmehrbedarf preview tile.                            |
| [`src/components/SettlementBanner.tsx`](file:///workspaces/wechselmodell-rechner/src/components/SettlementBanner.tsx)                     | Prominent result banner showing net monthly payment amount and transfer direction.         |
| [`src/components/CalculationSummary.tsx`](file:///workspaces/wechselmodell-rechner/src/components/CalculationSummary.tsx)                 | Summary metric tiles for combined income, DT tier, and liability quotas.                   |
| [`src/components/DetailsTable.tsx`](file:///workspaces/wechselmodell-rechner/src/components/DetailsTable.tsx)                             | Side-by-side tabular comparison of all income and calculation items.                       |
| [`src/components/AuditTrailList.tsx`](file:///workspaces/wechselmodell-rechner/src/components/AuditTrailList.tsx)                         | Step-by-step audit log with mathematical formulas and BGH paragraphs.                      |
| [`src/components/NumericInput.tsx`](file:///workspaces/wechselmodell-rechner/src/components/NumericInput.tsx)                             | Debounced, string-buffered number input (prevents 0-reset on backspace).                   |
| [`src/components/Tooltip.tsx`](file:///workspaces/wechselmodell-rechner/src/components/Tooltip.tsx)                                       | Accessible popover tooltip with `tabIndex={-1}` for clean keyboard tabbing.                |
| [`src/components/legal/LegalModal.tsx`](file:///workspaces/wechselmodell-rechner/src/components/legal/LegalModal.tsx)                     | Accessible modal dialog for Impressum and Datenschutzerklärung with deep linking.          |
| [`src/components/legal/ObfuscatedContact.tsx`](file:///workspaces/wechselmodell-rechner/src/components/legal/ObfuscatedContact.tsx)       | Click-to-reveal Base64 decoded contact display with scraper protection and copy button.    |
| [`src/components/legal/ImpressumContent.tsx`](file:///workspaces/wechselmodell-rechner/src/components/legal/ImpressumContent.tsx)         | Legal notice content according to § 5 DDG and § 18 Abs. 2 MStV.                            |
| [`src/components/legal/PrivacyPolicyContent.tsx`](file:///workspaces/wechselmodell-rechner/src/components/legal/PrivacyPolicyContent.tsx) | Privacy policy complying with DSGVO / GDPR for static GitHub Pages hosting.                |
| [`src/components/Footer.tsx`](file:///workspaces/wechselmodell-rechner/src/components/Footer.tsx)                                         | Application footer with legal links, RDG disclaimer, and license.                          |
| [`src/App.tsx`](file:///workspaces/wechselmodell-rechner/src/App.tsx)                                                                     | Main UI coordinator with scroll-free tabbed layout and legal modal deep linking.           |
| [`src/vite-env.d.ts`](file:///workspaces/wechselmodell-rechner/src/vite-env.d.ts)                                                         | Global declaration for `__LEGAL_CONFIG_B64__`.                                             |

---

## 4. Legal & Privacy Architecture

- **Spam Protection & Obfuscation:** Contact information (name, address, email, phone) is Base64-encoded at build-time (`__LEGAL_CONFIG_B64__` defined in [`vite.config.ts`](file:///workspaces/wechselmodell-rechner/vite.config.ts) via environment variables or fallback).
- **Interactive Reveal ([`ObfuscatedContact.tsx`](file:///workspaces/wechselmodell-rechner/src/components/legal/ObfuscatedContact.tsx)):** Contacts are only decoded into the DOM upon explicit user interaction ("Klicken zum Anzeigen"), with clipboard copy helpers and hidden honeypot spam traps.
- **Deep Linking:** Hash navigation (`#impressum` and `#datenschutz`) allows direct linking to modal tabs while keeping the app a single-page application without full page reloads.

---

## 5. Engineering Rules for Agents

1. **Repository Cleanliness & `dist/` Directory**:
   - **NEVER delete or empty `dist/`**. Always keep it generated via `npm run build`.
2. **Testing First**:
   - Always run `npm test` before concluding any turn.
   - All Vitest unit tests in `src/calculator/custodyEngine.test.ts`, `src/config/__tests__/legalConfig.test.ts`, and `src/components/legal/__tests__/legalComponents.test.tsx` must pass with 100% green status.
3. **No Regressions on Legal Formulas**:
   - Direct expenses must **always** be shared according to quotas ($Q_A \cdot D_B - Q_B \cdot D_A$). Never revert to 50:50 ($0{,}5 \cdot D$).
   - The 20% tabular housing credit must be applied before allocating real housing Mehrbedarf.
4. **UI/UX & Keyboard Navigation**:
   - Tooltip buttons must always have `tabIndex={-1}` so that form navigation via <kbd>Tab</kbd> flows smoothly through input fields.
   - Inputs must use `NumericInput` with local string buffering to prevent abrupt 0 resets during typing.
5. **Language & Documentation Standards (Deutsche Sprache)**:
   - **Kommentare und Dokumentation auf Deutsch**: Alle Quellcode-Kommentare, Docstrings, Typbeschreibungen, UI-Texte, Testbeschreibungen und Markdown-Dokumentationen müssen zwingend auf **Deutsch** verfasst sein (unter Verwendung der präzisen deutschen familienrechtlichen Fachterminologie).
   - Gesetzliche und richterliche Zitate folgen dem amtlichen Format (z. B. _§ 1606 Abs. 3 S. 1 BGB_, _§ 1612b BGB_, _BGH XII ZB 45/15_, _BGH XII ZB 565/15_, _Düsseldorfer Tabelle 2026_).
6. **CI/CD & Release Pipeline**:
   - Release check: `npm run release:check` (linting via Oxlint, Stylelint, HTMLHint + tests via Vitest + typecheck & build via `tsc -b && vite build` + audit via `npm audit`).
   - GitHub Actions workflow [`.github/workflows/publish.yml`](file:///workspaces/wechselmodell-rechner/.github/workflows/publish.yml) automates deployment to GitHub Pages.

---

## 6. Commands & Tooling

- **Development Server:** `npm run dev` (Vite 8 HMR)
- **Unit & Integration Tests:** `npm run test` / `npm run test:ci` (Vitest run) / `npm run test:watch`
- **Linting Suite:** `npm run lint` (`oxlint && stylelint "src/**/*.css" && htmlhint index.html`) / `npm run lint:fix` (auto-fix)
- **Code Formatting:** `npm run format` (Prettier write) / `npm run format:check` (Prettier verify)
- **Production Build:** `npm run build` (`tsc -b && vite build` — strict typecheck & rollup build)
- **Full Release Check:** `npm run release:check` (Lint + Tests + Build + Audit)
- **Bundle Analyzer:** `npm run analyze` (Build in analyze mode)
- **Dependency Audit:** `npm run audit` / `npm run audit:fix`
- **Clean Dist/Coverage:** `npm run clean` (`rm -rf dist coverage`)
- **Git Hooks:** Automatic pre-commit hook via Husky & Lint-Staged (`.husky/pre-commit`, `.lintstagedrc.js`)
- **Preview Bundle:** `npm run preview`
