-- Add polo_director to enum (separate transaction)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'polo_director';