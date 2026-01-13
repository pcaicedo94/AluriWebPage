# Aluri Platform - AI Coding Agent Instructions

## Project Architecture

This is a **hybrid Next.js 15 + static HTML** financial platform connecting property owners (propietarios) with investors (inversionistas) through real estate-backed loans.

### Dual Rendering Strategy
- **Static HTML pages** (`/public/*.html`): Landing pages for inversionistas, propietarios, nosotros - uses Tailwind CDN and vanilla JS
- **Next.js App Router** (`/src/app`): Authenticated dashboards, login flows, server actions - uses TypeScript, React Server Components

**Critical**: Root redirects to `/index.html` (see [next.config.js](next.config.js#L14-L19)) to serve static landing page. New marketing pages go in `/public`, authenticated features in `/src/app`.

## Authentication & Security

### Server-First Architecture (NO client-side auth)
- **Always use Server Actions** for auth operations - see [src/app/login/actions.ts](src/app/login/actions.ts)
- Auth client lives in [src/utils/supabase/server.ts](src/utils/supabase/server.ts) using `@supabase/ssr`
- Login flow: Server Action → Role verification from `profiles` table → RBAC redirect to role-specific dashboard

### Role-Based Access Control (RBAC)
```typescript
// ALWAYS verify role from database, never trust client metadata
const { data: profile } = await supabase.from('profiles').select('role').single()
if (profile.role !== expectedRole) {
  await supabase.auth.signOut()
  return { error: 'Access denied' }
}
```

**Two user types**: `inversionista` (investor), `propietario` (property owner). Each has separate login pages and dashboards. Database schema in [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md#L48-L93).

## Key Patterns & Conventions

### Static HTML Navigation
Uses custom client-side routing with `data-page` attributes:
```html
<a class="nav-link" href="#" data-page="inversionistas">Inversionistas</a>
```
JavaScript intercepts clicks and loads pages without full reload - see [public/index.html](public/index.html#L368).

### Form Handling
- **Static pages**: EmailJS integration (requires manual config - see [EMAIL_SETUP_INSTRUCTIONS.md](EMAIL_SETUP_INSTRUCTIONS.md))
- **Next.js pages**: Server Actions with `'use server'` directive, validated on server side

### Styling
- **Static pages**: Tailwind CDN with inline config in `<script>` tag
- **Next.js pages**: Compiled Tailwind from [tailwind.config.ts](tailwind.config.ts)
- Brand colors: `primary: #3be3cf`, dark mode support on investor pages

## Development Workflows

### Local Development
```bash
npm run dev  # Starts Next.js on localhost:3000
```
**Note**: Static HTML pages require EmailJS keys to test contact forms. Placeholders: `YOUR_PUBLIC_KEY`, `YOUR_SERVICE_ID`, `YOUR_TEMPLATE_ID` in inversionistas.html and propietarios.html.

### Environment Setup
Required in `.env.local` (never commit):
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Requirements
Supabase backend with:
- `profiles` table with RLS policies (user can only see own profile)
- `investments` table (referenced in [dashboard/inversionista/page.tsx](src/app/dashboard/inversionista/page.tsx#L23-L31))
- `properties` table (joined in investment queries)

Full SQL schema in [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md#L48-L93).

## Code Organization

### When to Use Server Components
- Dashboard pages that fetch user-specific data
- Login pages (wrap form actions, display errors)
- Any page requiring authentication checks

### When to Add 'use client'
- Forms with React state (`useState`, `useTransition`)
- Interactive calculators (existing in static HTML, migrate pattern if needed)
- Client-side routing logic

### File Placement Rules
- Public marketing content → `/public/*.html`
- Auth-protected features → `/src/app/dashboard/{role}/`
- Shared auth logic → `/src/app/login/actions.ts` (Server Actions only)
- Supabase utilities → `/src/utils/supabase/`

## Testing Auth Flows

1. Create test users in Supabase with `profiles.role` set to `inversionista` or `propietario`
2. Test login at `/login/inversionista` or `/login/propietario`
3. Verify redirect to correct dashboard
4. Confirm RLS prevents cross-role data access (investor shouldn't see owner data)

## Common Pitfalls

❌ **DON'T** use client-side Supabase for authentication (breaks SSR, insecure)
✅ **DO** use Server Actions with `createClient()` from `server.ts`

❌ **DON'T** add new static pages to Next.js `/src/app` (breaks hybrid architecture)
✅ **DO** add marketing pages to `/public/` with `.html` extension

❌ **DON'T** trust `user.user_metadata.role` for access control
✅ **DO** query `profiles` table for role verification

❌ **DON'T** forget to `revalidatePath('/', 'layout')` after auth state changes
✅ **DO** revalidate before redirects to clear cached auth state

## Deployment (Vercel)

Configuration in [vercel.json](vercel.json) - auto-detected as Next.js project. Static pages served alongside dynamic routes.

---

**Quick Reference**: See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed auth setup, [README_QUICK_START.md](README_QUICK_START.md) for EmailJS configuration.
