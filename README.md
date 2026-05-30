# Medra

A telehealth platform connecting patients with doctors for virtual consultations. Patients can browse specialists, book appointments via AI symptom matching or manual search, manage their medical records, and join video consultations. Doctors manage their weekly availability, view patient records, and write consultation notes.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + Radix UI primitives
- **State Management:** Zustand
- **Server State:** TanStack Query v5
- **Forms:** React Hook Form + Zod
- **Real-time:** Socket.IO client
- **Fonts:** Geist Sans & Geist Mono

---

## Getting Started

### Prerequisites

- Node.js 18+
- A running instance of the Medra backend API

### Installation

```bash
git clone <repo-url>
cd telehealth-client
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Running the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
app/
├── login/              # Login page
├── signup/             # Registration page
├── onboarding/         # Role-specific onboarding (patient / doctor)
├── profile/            # Shared profile & account settings
├── notifications/      # Notification feed
├── patient/
│   ├── page.tsx        # Patient dashboard
│   ├── doctors/        # Doctor directory + AI symptom match + booking
│   ├── consultations/  # Consultation list & detail (reschedule, cancel, join)
│   └── records/        # Medical records (weight, height, conditions, history)
└── doctor/
    ├── page.tsx         # Doctor dashboard
    ├── availability/    # Weekly schedule editor
    ├── consultations/   # Consultation list & detail (notes, cancel, join)
    ├── patients/        # Per-patient record view
    └── portfolio/       # Specialization, bio, years of practice

components/
├── avatars/            # UserAvatar
├── cards/              # ConsultationCard, DoctorCard, StatCard
├── nav/                # AppNav, NotificationBell, PageHeader, Footer
├── providers/          # QueryClient, UserProvider, SocketProvider
├── selectors/          # BookingScheduleSelector
├── shells/             # AppShell, AuthShell
└── ui/                 # shadcn/ui primitives (button, dialog, tabs, etc.)
```

---

## Features

### Patients

- Browse doctors by name or specialization
- AI symptom match — describe symptoms to get specialist recommendations
- Book, reschedule, or cancel consultations
- Join video consultations via meeting link
- View and update medical records (weight, height, conditions, allergies, medications)
- Full consultation history with doctor notes

### Doctors

- Dashboard with today's schedule and stats
- Manage weekly recurring availability (per-day time windows)
- View upcoming, past, and cancelled consultations
- Write and save consultation notes
- View full patient records and consultation history
- Manage professional portfolio (specialization, bio, years of practice)

### Shared

- Real-time notifications via WebSocket
- Role-based routing (`PATIENT` / `DOCTOR`)
- Profile management (name, password, birthday, mobile, avatar)

---

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm start`     | Start production server  |
| `npm run lint`  | Run ESLint               |
