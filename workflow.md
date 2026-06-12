# ConnectUs — Current Workflow & Optimization Roadmap

## 1. Current Application Workflow

This diagram illustrates the current Authentication, Onboarding, and Document Verification flow within the Next.js application.

```mermaid
flowchart TD
    %% Define styles
    classDef page fill:#f9f9f9,stroke:#333,stroke-width:1px
    classDef action fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    classDef check fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef server fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef ai fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px

    A[User visits '/'] ::: page --> B{Authenticated?} ::: check
    B -- No --> C[Landing Page] ::: page
    C --> D[Clicks 'Get Started'] ::: action
    D --> E[Login / Signup Page] ::: page
    E --> F[Supabase Auth] ::: server
    F --> A
    
    B -- Yes --> G{Onboarding Complete?} ::: check
    G -- Yes --> H[Dashboard '/dashboard'] ::: page
    
    G -- No --> I[Onboarding Flow '/onboarding'] ::: page
    I --> J[Identity Step] ::: page
    J --> K[Select Role: Student/Alumni] ::: action
    K --> L[Fill Name & University] ::: action
    L --> M[Upload Document] ::: action
    
    M --> N[Save file to Supabase Storage] ::: server
    N --> O[PATCH User Details via API] ::: server
    O --> P[POST to Gemini Verification API] ::: ai
    
    P --> Q{Gemini Decision} ::: check
    Q -- Approved --> R[Mark Verified & Enable Continue] ::: action
    Q -- Rejected --> S[Show Error & Block Continue] ::: action
    S --> M
    
    R --> T[Bio & Experience Steps] ::: page
    T --> U[POST Complete Onboarding] ::: server
    U --> H
```

### Workflow Summary
- **Landing & Auth**: We've separated the unauthenticated experience (marketing landing page) from the authenticated product (dashboard). Supabase handles the session management, and Next.js Edge Middleware intercepts routes to ensure unauthorized users cannot bypass the gates.
- **Onboarding Interception**: Even if a user logs in, the `layout.tsx` of the main application checks their `onboardingComplete` status. If false, they are trapped in the onboarding wizard until they provide necessary baseline data.
- **Instant AI Verification**: We employ Google's Gemini 1.5 Flash model directly during the first step of onboarding. Instead of manual administrative reviews or asynchronous checks, the document is securely uploaded to Supabase Storage, and a secure server-side API call is made to Gemini. The multimodal LLM processes the image/PDF against the user's claimed name and university. It blocks fraudulent uploads in real-time, ensuring bad actors cannot proceed.

---

## 2. Upstash Redis Integration Strategy

Upstash Redis is a serverless, low-latency data store. In a Next.js environment, it is incredibly powerful for operations that must be fast and shouldn't hit your primary SQL database (PostgreSQL via Prisma).

Here is exactly where an elite engineering team would implement Upstash Redis in ConnectUs:

### A. Rate Limiting (Crucial for AI and Auth)
You are using the Gemini API for document verification. If a malicious user spam-uploads files, they could exhaust your API quota or rack up an enormous bill.
- **Implementation**: Use `@upstash/ratelimit`. Apply a sliding window rate limit to the `/api/users/me/verify-document` endpoint (e.g., max 5 attempts per 10 minutes per IP/User ID).
- **Auth Limits**: Apply rate limits to the login and signup routes to prevent brute-force attacks.

### B. Caching Expensive Database Queries
Your dashboard (`/dashboard`) loads recommended alumni, upcoming events, and a global feed. Hitting PostgreSQL for these on every page load causes slow TTFB (Time to First Byte).
- **Implementation**: Cache the output of the `/api/alumni` (Recommended Alumni) and `/api/events` endpoints in Redis. 
- **Invalidation Strategy**: Set a short TTL (Time to Live) of 5-10 minutes, or trigger an invalidation when a new user registers or a new event is created.

### C. Real-Time Online Status & Presence
If you want to show a green dot when an Alumnus or Student is currently online (for instant messaging):
- **Implementation**: When a user connects or navigates the site, update a key in Redis: `setex user_online:{userId} 60 "true"`. This is far more efficient than writing to PostgreSQL every 60 seconds.

---

## 3. High-Performance Optimization Techniques

If the application is feeling sluggish, it's likely due to unoptimized database calls, waterfall data fetching, or large client-side bundles. Here is a senior-level optimization plan:

### 1. Eliminate Waterfall Data Fetching
Currently, the frontend might be waiting for the user profile, *then* fetching events, *then* fetching alumni.
- **Fix**: Use `Promise.all()` to fetch data simultaneously. In React Server Components (Next.js 14), you can fetch this data on the server in parallel before sending the HTML to the client, entirely eliminating client-side loading spinners.

### 2. Leverage Next.js Server Components (RSC)
Heavy components shouldn't be shipped to the browser.
- **Fix**: Shift your data-fetching to Server Components. For example, your Dashboard page should be a Server Component that fetches data directly via Prisma, completely bypassing the `/api/` fetch network layer. Pass the initial data to client components only when interactivity is needed.

### 3. Database Indexing (Prisma)
As your user table grows, filtering alumni by `role` or `university` will become a bottleneck.
- **Fix**: Add indexes to your `schema.prisma`.
  ```prisma
  @@index([role, university])
  @@index([gradYear])
  ```
  This turns a full table scan into an instant lookup.

### 4. Dynamic Imports (Lazy Loading)
If you add heavy libraries (like Chart.js for student finances, or rich text editors for messages):
- **Fix**: Use `next/dynamic`.
  ```tsx
  import dynamic from 'next/dynamic'
  const HeavyEditor = dynamic(() => import('@/components/Editor'), { ssr: false, loading: () => <Skeleton /> })
  ```

### 5. Image Optimization
User avatars and event covers can severely slow down initial paint times.
- **Fix**: Ensure you are using the Next.js `<Image />` component from `next/image` everywhere instead of standard `<img />` tags. This automatically converts images to WebP/AVIF, compresses them, and serves them from the Vercel Edge Network.

### 6. Optimistic UI Updates
When a user "likes" a post or sends a message, they shouldn't wait for the server response.
- **Fix**: Use `useOptimistic` (React 18) or React Query to instantly update the UI locally, and revert it seamlessly if the server call fails. This makes the app feel instantly responsive.
