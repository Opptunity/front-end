# Delivery Manager Portal

## Overview

The Delivery Manager Portal is a comprehensive system for managing staffing requests and candidate placements within the single staffing workflow. It provides delivery managers with tools to review tickets, search candidates, and coordinate placements.

## Features

### 1. Ticket Queue Management (`/delivery-manager/tickets`)

- **View all incoming tickets** from Account Managers
- **Filter and search** tickets by status, priority, skills, company, etc.
- **Ticket details** including requirements, budget, timeline, and client information
- **Quick actions** to find candidates or view full ticket details
- **Status tracking** from new to completed

### 2. Candidate Matching (`/delivery-manager/tickets/[id]/candidates`)

- **AI-powered matching** based on skills, experience, location, and preferences
- **Match scoring** with detailed breakdown of compatibility factors
- **Filtering options** for availability, minimum match score
- **Candidate proposals** with placement tracking
- **Direct communication** via phone/email/LinkedIn

### 3. Profiler Directory (`/delivery-manager/profilers`)

- **Searchable candidate database** with advanced filtering
- **Detailed profiles** including skills, rates, availability, and experience
- **Availability tracking** with real-time status updates
- **Contact management** with quick communication options
- **Professional information** including portfolios, LinkedIn, and resumes

### 4. Placement Coordination

- **Create placements** linking candidates to tickets
- **Status management** from proposed through completion
- **Match scoring** algorithm for optimal candidate selection
- **Placement history** with full audit trail
- **Automated notifications** and status updates

## Database Schema

### Core Tables

#### `profilers`
- Candidate database with personal and professional information
- Skills stored as JSONB for flexible querying
- Availability status and work preferences
- Rate information and notice periods

#### `placements`
- Links tickets to profilers
- Status tracking throughout placement lifecycle
- Match scores and placement notes
- Interview scheduling and placement dates

#### `availability_calendar`
- Detailed availability tracking for profilers
- Date ranges with status (available, busy, blocked, vacation)
- Integration with placement scheduling

#### `placement_history`
- Audit trail for all placement status changes
- Notes and reasons for status updates
- User tracking for accountability

## API Endpoints

### Profilers API
- `GET /api/profilers` - List profilers with filtering
- `POST /api/profilers` - Create new profiler
- `GET /api/profilers/[id]` - Get profiler details
- `PUT /api/profilers/[id]` - Update profiler
- `DELETE /api/profilers/[id]` - Delete profiler
- `GET /api/profilers/match/[ticketId]` - Find matching candidates

### Placements API
- `GET /api/placements` - List placements with filtering
- `POST /api/placements` - Create new placement
- `GET /api/placements/[id]` - Get placement details
- `PUT /api/placements/[id]` - Update placement status
- `DELETE /api/placements/[id]` - Delete placement

## Matching Algorithm

The candidate matching system uses a sophisticated scoring algorithm:

### Base Score (70% weight)
- **Required skills match**: Essential skills from ticket requirements
- **Preferred skills match**: Nice-to-have skills for bonus points

### Bonus Factors (30% weight)
- **Location compatibility**: Geographic proximity or remote work alignment
- **Experience level match**: Seniority level alignment with requirements  
- **Work arrangement**: Remote, hybrid, or on-site preferences
- **Contract type**: Full-time, contract, or part-time availability

### Budget Compatibility
- Separate flag indicating if candidate rates fit within budget
- Allows for 20% over-budget tolerance
- Considers hourly/daily rates vs project budget

## Workflow Integration

### Account Manager → Delivery Manager Flow

1. **Account Manager** creates ticket with client requirements
2. **Ticket appears** in Delivery Manager queue automatically
3. **Delivery Manager** reviews ticket and uses candidate matching
4. **AI suggests** best candidates with match scores
5. **Delivery Manager** proposes candidates to client
6. **Status tracking** through interview, acceptance, and placement
7. **Completion** with placement history and outcome tracking

### Key Benefits

- **Automated matching** reduces manual candidate search time
- **Centralized database** of all available candidates
- **Real-time availability** prevents double-booking
- **Audit trail** ensures accountability and tracking
- **Integrated communication** streamlines candidate outreach
- **Performance metrics** for placement success rates

## Security & Access

- **Row Level Security (RLS)** policies protect data access
- **Service role authentication** for API operations
- **User-based tracking** for all actions and changes
- **Secure data handling** for sensitive candidate information

## Future Enhancements

- **Calendar integration** for interview scheduling
- **Email automation** for candidate communication
- **Performance analytics** dashboard
- **Client feedback** integration
- **Mobile app** for on-the-go access
- **AI-powered** candidate sourcing and recommendations 