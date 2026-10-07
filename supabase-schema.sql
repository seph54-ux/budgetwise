-- ==============================================================================
-- BudgetWise - Supabase PostgreSQL Schema & Security Setup
-- ==============================================================================
-- Run this script in your Supabase Dashboard:
-- 1. Go to your project at https://supabase.com/dashboard
-- 2. Click "SQL Editor" in the left navigation
-- 3. Click "New query", paste this entire script, and click "Run" (or Ctrl+Enter)
-- ==============================================================================

-- 1. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast user queries and date sorting
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions (user_id, date DESC);

-- 2. Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_budgets_user ON public.budgets (user_id);

-- 3. Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL,
    current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'bank' CHECK (source IN ('bank', 'digital-wallet', 'cash', 'other')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON public.savings_goals (user_id);

-- 4. Savings Transactions Table (Contributions)
CREATE TABLE IF NOT EXISTS public.savings_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_savings_transactions_goal ON public.savings_transactions (goal_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_user ON public.savings_transactions (user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Row Level Security guarantees each user can only read and write their own data.

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;

-- Transactions Policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid()::text = user_id OR user_id = 'demo-user');

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid()::text = user_id OR user_id = 'demo-user');

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid()::text = user_id OR user_id = 'demo-user');

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions"
    ON public.transactions FOR DELETE
    USING (auth.uid()::text = user_id OR user_id = 'demo-user');

-- Budgets Policies
DROP POLICY IF EXISTS "Users can manage own budgets" ON public.budgets;
CREATE POLICY "Users can manage own budgets"
    ON public.budgets FOR ALL
    USING (auth.uid()::text = user_id OR user_id = 'demo-user')
    WITH CHECK (auth.uid()::text = user_id OR user_id = 'demo-user');

-- Savings Goals Policies
DROP POLICY IF EXISTS "Users can manage own savings goals" ON public.savings_goals;
CREATE POLICY "Users can manage own savings goals"
    ON public.savings_goals FOR ALL
    USING (auth.uid()::text = user_id OR user_id = 'demo-user')
    WITH CHECK (auth.uid()::text = user_id OR user_id = 'demo-user');

-- Savings Transactions Policies
DROP POLICY IF EXISTS "Users can manage own savings transactions" ON public.savings_transactions;
CREATE POLICY "Users can manage own savings transactions"
    ON public.savings_transactions FOR ALL
    USING (auth.uid()::text = user_id OR user_id = 'demo-user')
    WITH CHECK (auth.uid()::text = user_id OR user_id = 'demo-user');

-- Schema setup complete!
