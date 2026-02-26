# Virtual Executive - Technical Specifications

## Project Structure

```
vx-build/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── cmo/
│   │   │   │   ├── page.tsx (CMO landing)
│   │   │   │   └── [function]/
│   │   │   │       └── page.tsx (Dynamic wizard)
│   │   │   ├── cfo/
│   │   │   │   ├── page.tsx (CFO landing)
│   │   │   │   └── [function]/
│   │   │   │       └── page.tsx (Dynamic wizard)
│   │   │   └── layout.tsx (Protected layout)
│   │   ├── page.tsx (Root redirect)
│   │   ├── layout.tsx (Root layout)
│   │   └── globals.css
│   ├── components/
│   │   ├── wizard/
│   │   │   ├── wizard-container.tsx
│   │   │   ├── step-company-context.tsx
│   │   │   ├── step-data-ingestion.tsx
│   │   │   ├── step-focus-areas.tsx
│   │   │   ├── step-analysis-results.tsx
│   │   │   └── step-action-items.tsx
│   │   ├── layout/
│   │   │   └── app-shell.tsx
│   │   └── ui/ (pre-existing)
│   ├── contexts/
│   │   └── company-context.tsx
│   └── lib/
│       └── utils.ts
├── IMPLEMENTATION_SUMMARY.md
└── TECH_SPECS.md (this file)
```

## Component API Reference

### WizardContainer Props
```typescript
interface WizardContainerProps {
  steps: WizardStep[];           // Array of step definitions
  currentStep: number;            // 0-indexed current step
  onNext: () => void;             // Next button handler
  onBack: () => void;             // Back button handler
  onComplete: () => void;         // Complete button handler
  children: React.ReactNode;      // Step content
  isProcessing?: boolean;         // Show loading spinner
  canProceed?: boolean;           // Enable/disable Next button
  title: string;                  // Wizard title
  subtitle?: string;              // Optional subtitle
  onSaveDraft?: () => void;      // Optional draft save
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}
```

### StepCompanyContext Props
```typescript
interface CompanyContextData {
  companyId: string;
  companyName: string;
  industry: string;
  primaryGoal: string;
  monthlyBudget: string;              // ZAR amount
  targetGeography: string;
  additionalContext: string;
}

interface StepCompanyContextProps {
  data: CompanyContextData;
  onDataChange: (data: CompanyContextData) => void;
  companyProfile?: {
    name: string;
    industry: string;
    website?: string;
    logo?: string;
  };
}
```

### StepDataIngestion Props
```typescript
interface DataFile {
  id: string;
  name: string;
  type: 'csv' | 'xlsx' | 'pdf' | 'screenshot' | 'mcp';
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  error?: string;
  preview?: Array<{ [key: string]: string }>;
}

interface StepDataIngestionProps {
  data: {
    files: DataFile[];
    mcpConnections: Array<{ id: string; name: string; connected: boolean }>;
    manualMetrics: { [key: string]: string };
  };
  onDataChange: (data: any) => void;
  functionType?: string;
}
```

### StepFocusAreas Props
```typescript
interface FocusArea {
  id: string;
  title: string;
  description: string;
  selected: boolean;
}

interface StepFocusAreasProps {
  focusAreas: FocusArea[];
  onFocusAreasChange: (areas: FocusArea[]) => void;
  additionalFocus: string;
  onAdditionalFocusChange: (focus: string) => void;
}
```

### StepAnalysisResults Props
```typescript
interface AnalysisResult {
  executiveSummary: string;
  healthScore: number;
  healthStatus: 'red' | 'amber' | 'green';
  keyFindings: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  detailedAnalysis: Array<{
    title: string;
    content: string;
    chart?: {
      type: 'bar' | 'line' | 'pie';
      data: any[];
    };
  }>;
  recommendations: Recommendation[];
  actionItems: ActionItem[];
}

interface StepAnalysisResultsProps {
  analysis?: AnalysisResult;
  isLoading?: boolean;
  onDownloadPDF?: () => void;
  onShare?: () => void;
  onRunAnother?: () => void;
}
```

### StepActionItems Props
```typescript
interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: 'low' | 'medium' | 'high';
  suggestedDueDate: string;
  assignedTo?: string;
  selected: boolean;
  isMCPEligible?: boolean;
}

interface StepActionItemsProps {
  actionItems: ActionItem[];
  onActionItemsChange: (items: ActionItem[]) => void;
  onCreateSelected: () => void;
  isCreating?: boolean;
  teamMembers?: Array<{ id: string; name: string; email: string }>;
}
```

## Styling System

### Color Palette
```css
--background: 0 0% 0%;           /* #000000 */
--foreground: 0 0% 100%;         /* #FFFFFF */
--card: 0 0% 7%;                 /* #121212 */
--card-foreground: 0 0% 100%;    /* #FFFFFF */
--muted: 0 0% 20%;               /* #333333 */
--muted-foreground: 0 0% 60%;    /* #999999 */
--accent: 45 93% 47%;            /* #F59E0B (Amber/Gold) */
--border: 0 0% 15%;              /* #262626 */
--input: 0 0% 15%;               /* #262626 */
--ring: 45 93% 47%;              /* #F59E0B */
```

### Responsive Breakpoints
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## Function Categories & Count

### CMO Module (40 functions)
- **Advertising & Paid Media**: 10
- **SEO & Organic**: 6
- **Content & Social**: 6
- **Brand & Strategy**: 8
- **Analytics & Reporting**: 6
- **Marketplace**: 4

### CFO Module (40 functions)
- **Core Financial Reporting**: 6
- **Planning & Forecasting**: 6
- **Cash & Treasury**: 6
- **Profitability & Costing**: 5
- **Strategic Finance**: 6
- **Compliance & Governance**: 5
- **Analytics & KPIs**: 5

## Data Flow

### Wizard State Lifecycle
```
Step 0 (Company Context)
  → Collect company info
  → Store in companyContext state
  ↓
Step 1 (Data Ingestion)
  → Upload files or connect MCP
  → Process and preview data
  → Store in dataFiles state
  ↓
Step 2 (Focus Areas)
  → Select analysis dimensions
  → Optional additional focus
  → Store in focusAreas state
  ↓
Step 3 (Analysis Results) [isProcessing = true]
  → Generate AI analysis
  → Display results with charts
  → Display action items preview
  ↓
Step 4 (Action Items)
  → Select which tasks to create
  → Edit task details
  → Assign to team members
  → Submit to create tasks
```

### File Upload Processing
```
User drops file
  ↓
Validate file type (CSV, XLSX, PDF, image)
  ↓
Create DataFile with status: 'uploading'
  ↓
Simulate upload (progress 0→100%)
  ↓
Update status to 'processing'
  ↓
Extract and parse file contents
  ↓
Generate preview table
  ↓
Update status to 'ready'
  ↓
Display in file list with preview
```

## Authentication Flow

### Login Flow
```
User lands on /login
  → Fill email and password
  → Click "Sign In"
  → Validate inputs
  → Store in localStorage
  → Redirect to /cmo
  ↓
Dashboard layout checks auth
  → If authenticated, show content
  → If not, redirect to /login
```

### Registration Flow
```
User clicks "Sign up"
  → Validate all fields
  → Validate password match
  → Require terms agreement
  → Select plan (Starter/Growth/Portfolio)
  → Submit
  → Store in localStorage
  → Redirect to /cmo
```

## URL Routes

### Public Routes
- `/` - Root (redirects based on auth)
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (Dashboard Layout)
- `/cmo` - CMO landing page
- `/cmo/[function-slug]` - CMO wizard for specific function
- `/cfo` - CFO landing page
- `/cfo/[function-slug]` - CFO wizard for specific function

Example URLs:
- `/cmo/google-ads-audit`
- `/cmo/facebook-ads-audit`
- `/cfo/pl-analysis`
- `/cfo/cash-runway`

## Component Hierarchy

```
RootLayout
  └─ SessionProvider
      └─ page.tsx (root redirect)

DashboardLayout (protected)
  ├─ CompanyProvider
  │   └─ AppShell
  │       ├─ Sidebar (responsive)
  │       ├─ TopBar
  │       └─ Main Content
  │           ├─ CMO pages
  │           │   ├─ page.tsx (listing)
  │           │   └─ [function]/page.tsx
  │           │       └─ WizardContainer
  │           │           ├─ StepCompanyContext
  │           │           ├─ StepDataIngestion
  │           │           ├─ StepFocusAreas
  │           │           ├─ StepAnalysisResults
  │           │           └─ StepActionItems
  │           └─ CFO pages (same structure)
```

## Key Features Matrix

| Feature | CMO | CFO | Notes |
|---------|-----|-----|-------|
| Wizard Flow (5 steps) | ✓ | ✓ | Standardized across both |
| Data Upload | ✓ | ✓ | CSV, XLSX, PDF, Screenshots |
| MCP Integration | ✓ | ✓ | Connected platforms |
| Health Score | ✓ | ✓ | Red/Amber/Green badges |
| Charts | ✓ | ✓ | Bar, Line, Pie via Recharts |
| PDF Export | ✓ | ✓ | Placeholder in results |
| Action Items | ✓ | ✓ | Task creation + assignment |
| Team Assignment | ✓ | ✓ | Dropdown selector |
| Responsive Design | ✓ | ✓ | Mobile-first approach |

## Performance Targets

- Page load: < 2s
- Wizard step transitions: < 300ms (with animation)
- File upload simulation: < 5s
- Analysis processing simulation: < 3s
- Responsive layout shifts: < 100ms

## Accessibility

- Semantic HTML (form, button, nav elements)
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast ratios > 4.5:1
- Focus indicators visible
- Mobile touch targets > 44x44px

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Dependencies

### Core
- Next.js 13+ (App Router)
- React 18+
- TypeScript

### UI/Styling
- Tailwind CSS 3+
- clsx + tailwind-merge
- Lucide React (icons)

### Charting
- Recharts 2+

### Forms
- Native HTML5 validation

### Auth
- next-auth (configured in project)

### Data
- localStorage (client-side state)

## Environment Variables

```
# Required for production
NEXT_PUBLIC_API_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
DATABASE_URL=
```

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Authentication provider set up
- [ ] Database migrations run
- [ ] API endpoints configured
- [ ] CORS settings configured
- [ ] Environment-specific URLs set
- [ ] Error logging configured
- [ ] Analytics configured
- [ ] SSL/TLS enabled
- [ ] Performance optimized
