# 🚀 Migration Guide: Static HTML → Next.js 14 + Supabase

## ✅ What We've Built

### 1. **Secure Authentication System**
- ✅ Supabase SSR (Server-Side Rendering) Auth
- ✅ Role-Based Access Control (RBAC)
- ✅ Server Actions (no client-side auth calls)
- ✅ Cookie-based session management

### 2. **Files Created**

```
src/
├── utils/
│   └── supabase/
│       └── server.ts              # Server-side Supabase client
├── app/
│   └── login/
│       ├── actions.ts             # Server Actions for login
│       └── inversionista/
│           └── page.tsx           # Investor login page
```

---

## 🔧 Setup Instructions

### Step 1: Create Supabase Project

1. Go to [Supabase](https://app.supabase.com)
2. Create a new project
3. Get your credentials from Settings → API

### Step 2: Set Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 3: Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('inversionista', 'propietario', 'admin');

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'propietario')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 4: Install Dependencies

```bash
npm install @supabase/ssr @supabase/supabase-js
npm install -D @types/node
```

### Step 5: Configure Next.js

Update your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'], // Add your image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
```

### Step 6: Create Middleware (Optional but Recommended)

Create `middleware.ts` in the root:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 🎯 How the Login Flow Works

### 1. User Submits Form
```tsx
// Client Component (page.tsx)
<form action={handleSubmit}>
  <input name="email" />
  <input name="password" />
  <button type="submit">Ingresar</button>
</form>
```

### 2. Server Action Processes Login
```typescript
// Server Action (actions.ts)
export async function login(formData: FormData, expectedRole: 'inversionista') {
  // 1. Authenticate with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({...})
  
  // 2. Verify user role from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()
  
  // 3. Enforce RBAC - sign out if wrong role
  if (profile.role !== expectedRole) {
    await supabase.auth.signOut()
    return { error: 'Acceso no autorizado' }
  }
  
  // 4. Redirect to appropriate dashboard
  redirect('/dashboard/inversionista')
}
```

### 3. Security Features

✅ **Server-Side Only** - No auth secrets exposed to client
✅ **Role Verification** - Checks database role before access
✅ **Automatic Logout** - Signs out if role doesn't match
✅ **Cookie-Based Sessions** - HTTPOnly cookies prevent XSS
✅ **Type Safety** - Full TypeScript coverage

---

## 📋 Next Steps

### 1. Create Property Owner Login
Copy and modify for propietarios:
```bash
src/app/login/propietario/page.tsx
```

### 2. Create Dashboards
```bash
src/app/dashboard/inversionista/page.tsx
src/app/dashboard/propietario/page.tsx
```

### 3. Add Password Reset Flow
```bash
src/app/login/inversionista/forgot-password/page.tsx
src/app/auth/reset-password/page.tsx
```

### 4. Add Registration Forms
Extend the forms on inversionistas.html and propietarios.html

---

## 🔒 Security Best Practices

✅ **Environment Variables** - Never commit `.env.local`
✅ **Row Level Security** - Always enable RLS on all tables
✅ **Server Actions** - Use for all auth/data mutations
✅ **Input Validation** - Validate all form inputs
✅ **Error Handling** - Don't leak sensitive info in errors
✅ **Rate Limiting** - Use Supabase's built-in rate limiting

---

## 🐛 Troubleshooting

### "Invalid API key"
Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct

### "Failed to fetch"
Verify `NEXT_PUBLIC_SUPABASE_URL` is correct

### "Role not found"
Ensure the user has a profile with a role in the `profiles` table

### Images not loading
Add image domains to `next.config.js`

---

## 📚 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side-rendering)

---

Need help? Check the inline comments in the code or refer to the official documentation.
