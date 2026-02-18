-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Table: User
create table public."User" (
    id uuid primary key default gen_random_uuid(),
    "externalId" text unique not null,
    email text unique not null,
    name text,
    "imageUrl" text,
    "isSubscribed" boolean default false,
    "subscriptionExpiresAt" timestamp with time zone,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now()
);

-- Table: Payment
create table public."Payment" (
    id uuid primary key default gen_random_uuid(),
    "abacateBillingId" text unique not null,
    status text not null, -- PENDING, PAID, CANCELLED
    amount integer not null, -- in cents
    "userId" uuid not null references public."User"(id) on delete cascade,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now()
);

-- RLS Policies (Optional but recommended)
alter table public."User" enable row level security;
alter table public."Payment" enable row level security;

-- Allow users to read their own data
create policy "Users can read own data" 
    on public."User" 
    for select 
    using (auth.uid()::text = "externalId");

-- Policies for Payments can be added similarly if needed by frontend
