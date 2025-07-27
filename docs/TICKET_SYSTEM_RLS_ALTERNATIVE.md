# Alternative RLS Policy for Tickets

If you prefer not to use the service role key approach, you can modify the RLS policy to be more permissive for ticket creation.

## Option 1: Disable RLS for Tickets Table

```sql
-- Disable Row Level Security for the tickets table
ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;
```

## Option 2: Create More Permissive Policy

```sql
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow users to create tickets" ON public.tickets;

-- Create a more permissive policy that allows any authenticated user to create tickets
CREATE POLICY "Allow ticket creation" 
ON public.tickets FOR INSERT 
WITH CHECK (true);

-- Keep the read policy restrictive to show users only their own tickets
CREATE POLICY "Users can read their own tickets" 
ON public.tickets FOR SELECT 
USING (created_by = auth.email() OR auth.role() = 'service_role');

-- Allow users to update their own tickets
CREATE POLICY "Users can update their own tickets" 
ON public.tickets FOR UPDATE 
USING (created_by = auth.email() OR auth.role() = 'service_role');
```

## Option 3: Use JWT Verification in API

If you want to maintain security without service role, you can verify the JWT token in the API route:

```javascript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient({ cookies })
  
  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Use user.email for created_by field
  // ... rest of your code
}
```

**Recommendation**: Use the service role key approach as it's the most secure and straightforward solution. 