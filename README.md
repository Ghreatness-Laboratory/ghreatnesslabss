# GhreatnessLabs — Lagos Systems Studio

Digital systems studio for brands, products, and technological infrastructure engineered in Lagos, Nigeria.

## Supabase Database Setup

The complete PostgreSQL / Supabase SQL schema and seed data are stored in:

```
supabase/schema.sql
```

### Steps to run:
1. Open your Supabase project dashboard.
2. Go to **SQL Editor**.
3. Copy the contents of `supabase/schema.sql` and click **Run**.
4. Retrieve your Supabase Project URL and Anon API Key from **Project Settings -> API**.
5. Add them to your environment variables:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```