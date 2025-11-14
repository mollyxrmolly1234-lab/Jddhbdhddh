# DATA4ME Design Guidelines

## Design Approach
**Reference-Based Fintech Approach** - Drawing from leading fintech platforms (Paystack, Flutterwave, Stripe) combined with Nigerian digital service aesthetics. Focus on trust, clarity, and transaction efficiency.

## Core Design Elements

### Typography System
- **Primary Font**: Inter or DM Sans (Google Fonts) - clean, professional, excellent readability
- **Hierarchy**:
  - Hero/Display: text-4xl to text-6xl, font-bold
  - Section Headers: text-3xl, font-semibold
  - Card Titles: text-xl, font-semibold
  - Body Text: text-base, font-normal
  - Metadata/Labels: text-sm, font-medium
  - Fine Print: text-xs

### Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, and 16
- Component padding: p-4 to p-6 (mobile), p-6 to p-8 (desktop)
- Section spacing: py-12 to py-16
- Card gaps: gap-4 to gap-6
- Form field spacing: space-y-4

**Container Strategy**:
- Max-width: max-w-7xl for main content
- Dashboard: max-w-screen-2xl for data tables
- Forms: max-w-md centered

### Component Library

#### Navigation
- **Main Header**: Sticky top navigation with logo, balance display, user menu
- **Dashboard Sidebar**: Collapsible navigation (mobile drawer, desktop persistent)
- **Breadcrumbs**: For multi-step processes (funding, data purchase)

#### Data Display
- **Pricing Cards**: Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) for data bundles
  - Network logo badge
  - Data amount (prominent, text-2xl font-bold)
  - Validity period
  - Price with NGN prefix
  - "Buy Now" CTA
  
- **Transaction Tables**: Striped rows, sortable columns, status badges
- **Balance Card**: Large, prominent display with quick action buttons
- **Stats Cards**: 2x2 grid showing referral count, total spent, account balance, pending rewards

#### Forms & Inputs
- **Input Fields**: Outlined style with floating labels
- **Amount Input**: Large, centered with NGN currency indicator
- **Phone Number Input**: Country code prefix (+234), formatted input
- **Network Selector**: Icon-based button group or dropdown with carrier logos

#### Interactive Elements
- **Primary Buttons**: Rounded-lg, px-6 py-3, font-semibold
- **Loading States**: Skeleton loaders for data bundles, spinner for transactions
- **Fake Account Generation Animation**: 
  - Centered modal overlay
  - Loading spinner with progress text
  - Smooth reveal of payment details card
  - Copy button for account number

#### Feedback Components
- **Toast Notifications**: Top-right positioned, auto-dismiss
- **Status Badges**: Pill-shaped (pending, confirmed, failed)
- **Progress Bar**: For referral tracking (X/50 referrals)
- **AI Chat Widget**: Bottom-right floating button, expandable chat panel

#### Admin Dashboard
- **Login Screen**: Centered card (max-w-sm) on full-screen backdrop
- **Payment Management**: 
  - Editable card for account details (account number, bank, account name)
  - Pending transactions list with approve/reject actions
  - Activity log timeline

### Page Structures

#### Landing Page (Public)
1. **Hero**: Bold headline "Affordable Data & Airtime for Nigerians", balance of text and visual, dual CTA (Sign Up/Login)
2. **Features Grid**: 3-column (icon, title, description) - Instant Delivery, AI Support, Referral Rewards
3. **Pricing Preview**: Showcase top 6 deals across networks
4. **Referral Section**: Explain earn 5k for 50 referrals with visual counter example
5. **Trust Indicators**: Transaction count, satisfied users, instant delivery badge
6. **Footer**: Quick links, social media, support contact

#### User Dashboard
- **Header**: Balance card with Fund Account and Quick Buy buttons
- **Main Grid**: 
  - Left: Recent transactions
  - Right: Quick actions (Buy Data, Buy Airtime, Referral Link)
- **Data Bundles Section**: Tabbed by network, filterable cards

#### Funding Flow
1. Amount input screen (enforce minimum 1000 NGN)
2. Fake loading animation (2-3 seconds)
3. Payment details display (account number, bank, account name) with copy functionality
4. "I've sent payment" confirmation button
5. Pending confirmation state

### Accessibility
- Clear visual hierarchy with consistent heading levels
- High contrast text on all backgrounds
- Form labels always visible (not placeholder-only)
- Keyboard navigation support
- Focus indicators on all interactive elements
- ARIA labels for icon-only buttons

### Mobile-First Considerations
- Bottom navigation for key actions on mobile
- Collapsible sections for long data bundle lists
- Swipeable cards for network selection
- Large tap targets (min 44x44px)
- Sticky "Fund Account" button on mobile dashboard

### Images
**No large hero image** - This is a utility-focused fintech app prioritizing functionality over visual storytelling.

**Small Strategic Images**:
- Network carrier logos (MTN, Glo, Airtel, 9mobile) throughout
- Icon illustrations for features section
- Avatar placeholder for user profile
- Success/confirmation illustration for completed transactions