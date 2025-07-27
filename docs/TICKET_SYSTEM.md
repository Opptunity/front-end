# Ticket Storage System

## Overview

The Single Staffing ticket system stores all ticket data persistently in **Supabase** (PostgreSQL database). This replaces the previous simulation-only approach with real data persistence.

## Database Schema

### `tickets` Table Structure

```sql
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  created_by TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  priority TEXT,
  
  -- Client Information
  client_name TEXT NOT NULL,
  client_company TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  
  -- Position Details
  position_title TEXT NOT NULL,
  department TEXT,
  seniority TEXT,
  contract_type TEXT,
  duration TEXT,
  start_date DATE,
  work_location TEXT,
  work_arrangement TEXT,
  
  -- Requirements (stored as JSON)
  required_skills JSONB,
  preferred_skills JSONB,
  experience TEXT,
  education TEXT,
  certifications TEXT,
  
  -- Project Details
  project_description TEXT,
  responsibilities TEXT,
  
  -- Budget & Terms
  budget_min DECIMAL,
  budget_max DECIMAL,
  currency TEXT DEFAULT 'USD',
  rate_type TEXT,
  
  -- Additional Information
  urgency TEXT,
  special_requirements TEXT,
  notes TEXT,
  
  -- Assignment tracking
  assigned_to TEXT, -- Delivery Manager assigned
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Create Ticket
- **Endpoint**: `POST /api/tickets`
- **Purpose**: Creates and stores a new ticket
- **Authentication**: Uses user email from auth context
- **Returns**: `{ success: true, ticketId: string, ticketNumber: string }`

### Get Tickets
- **Endpoint**: `GET /api/tickets`
- **Query Parameters**:
  - `created_by`: Filter by creator email
  - `status`: Filter by ticket status
- **Purpose**: Retrieves tickets for a user
- **Returns**: Array of ticket objects

## Ticket Workflow

1. **Account Manager** creates ticket via `/create-ticket` page
2. **Form data** is submitted to `/api/tickets` (POST)
3. **Ticket** is stored in Supabase `tickets` table
4. **Unique ticket number** is auto-generated (format: `TKT-{timestamp}-{random}`)
5. **Account Manager** can view tickets via `/my-tickets` page
6. **Delivery Manager** will access tickets through their portal

## Status Flow

```
pending → in-review → matched → placed → completed
                        ↓
                    cancelled
```

## Key Features

- ✅ **Persistent Storage**: All tickets stored in Supabase
- ✅ **Unique Ticket Numbers**: Auto-generated IDs
- ✅ **User Filtering**: Users see only their tickets
- ✅ **Status Tracking**: Complete workflow status management
- ✅ **Rich Data**: Comprehensive client and position details
- ✅ **JSON Fields**: Skills stored as arrays in JSONB
- ✅ **Security**: Row Level Security (RLS) policies
- ✅ **Indexing**: Optimized queries with proper indexes

## Security

The table uses Supabase Row Level Security with policies that:
- Allow users to create tickets
- Allow users to view and update their own tickets
- Allow service role full access
- Prevent unauthorized access

## Usage

### Creating a Ticket
Users fill out the 4-step form at `/create-ticket`, which stores all information including:
- Client contact details
- Position requirements
- Skills (required/preferred)
- Budget and timeline

### Viewing Tickets  
Users can view their tickets at `/my-tickets` with:
- Status filtering
- Summary statistics
- Real-time updates
- Detailed ticket information

This system provides the foundation for the complete Account Manager → Delivery Manager workflow. 