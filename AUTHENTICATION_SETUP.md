# Authentication Setup Guide

This project uses Supabase for authentication. Follow these steps to set up authentication in your environment.

## Prerequisites

1. A Supabase project (create one at [supabase.com](https://supabase.com))
2. Node.js and npm installed

## Setup Instructions

### 1. Configure Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project:
- Go to [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Navigate to Settings → API
- Copy the Project URL and anon/public key

### 2. Enable Email/Password Authentication in Supabase

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Enable "Email" provider
4. Configure email templates if desired (optional)

### 3. Create Test User (Optional)

To create a test user for development:

1. Go to Authentication → Users in your Supabase dashboard
2. Click "Add User"
3. Enter an email and password
4. Click "Create User"

Or use the Supabase SQL Editor:

```sql
-- This will create a user via SQL (run in Supabase SQL Editor)
-- Note: Replace with your desired email and password
SELECT auth.sign_up(
  email := 'test@example.com',
  password := 'testpassword123'
);
```

## How It Works

### Authentication Flow

1. **Login**: Users enter their email and password on the `/login` page
2. **Session Storage**: Supabase automatically stores the session in local storage
3. **Persistence**: The session persists across page refreshes and browser restarts
4. **Protected Routes**: The `ProtectedRoute` component checks authentication status
5. **Auto-redirect**: Unauthenticated users are redirected to `/login`

### Key Components

- **`AuthProvider`** (`src/contexts/auth-context.tsx`)
  - Manages global authentication state
  - Listens for auth state changes
  - Provides `user`, `session`, `loading`, and `signOut` to all components

- **`LoginForm`** (`src/components/login-form.tsx`)
  - Handles email/password login
  - Displays loading states and error messages
  - Redirects to home page on successful login

- **`ProtectedRoute`** (`src/components/protected-route.tsx`)
  - Wraps pages that require authentication
  - Shows loading spinner while checking auth status
  - Redirects to login if user is not authenticated

### Usage in Your App

#### Accessing User Info

```tsx
import { useAuth } from '@/contexts/auth-context'

function MyComponent() {
  const { user, loading, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <p>Email: {user?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

#### Protecting a Page

```tsx
import { ProtectedRoute } from '@/components/protected-route'

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  )
}
```

## Session Management

Supabase handles session management automatically:

- Sessions are stored in browser local storage
- Sessions automatically refresh when they expire
- Sessions persist across browser tabs and windows
- Closing the browser does NOT log the user out

To manually clear sessions (for testing):
```javascript
// In browser console
localStorage.clear()
```

## Troubleshooting

### "Invalid login credentials" Error

- Verify the user exists in Supabase Authentication → Users
- Check that the password is correct
- Ensure email provider is enabled in Authentication → Providers

### Session Not Persisting

- Check that `NEXT_PUBLIC_` prefix is used in environment variable names
- Verify environment variables are loaded (restart dev server after adding .env.local)
- Clear browser cache and local storage

### Redirect Loop

- Check that the login page (`/login`) is not wrapped in `ProtectedRoute`
- Verify auth state is being properly initialized in `AuthProvider`

## Security Notes

- Never commit `.env.local` file to version control
- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose on the client side
- Supabase Row Level Security (RLS) policies should be used to protect data
- Consider implementing rate limiting for production environments

## Additional Features to Implement

- Password reset functionality
- Email verification
- Social login (Google, GitHub, etc.)
- Multi-factor authentication
- Role-based access control

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)

