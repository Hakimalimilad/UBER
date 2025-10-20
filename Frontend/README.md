# Student Transport Platform - Frontend

A demo-ready frontend for a university student transportation platform built with Next.js, React, and Tailwind CSS.

## Features

- **Role-Based Dashboards**: Separate interfaces for Students, Drivers, and Admins.
- **Sidebar Navigation**: Collapsible sidebar with role-specific tabs.
- **Profile Management**: Update user profiles via Settings tab.
- **Ride Requests**: Students can request rides with pickup/dropoff details.
- **Approval Flows**: Handles email verification and admin approval states.
- **Responsive Design**: Works on desktop and mobile devices.

## Setup and Run Instructions

### Prerequisites
- Node.js 18+
- Backend server running (Flask app at `http://localhost:5000`)

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (create `.env.local` if needed):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Account Credentials
- **Student**: Email: student@example.com, Password: password123
- **Driver**: Email: driver@example.com, Password: password123
- **Admin**: Email: admin@example.com, Password: password123

(Note: These are mock credentials; in a real setup, use the backend registration.)

## Project Structure

```
Frontend/
├── app/
│   ├── admin/          # Admin pages
│   ├── driver/         # Driver pages
│   ├── student/        # Student pages
│   └── page.jsx        # Login/Register page
├── components/
│   ├── MainLayout.tsx  # Main layout with Sidebar and Topbar
│   ├── Sidebar.tsx     # Role-aware sidebar
│   ├── Topbar.tsx      # Top bar with user info
│   ├── Card.tsx        # Reusable stat cards
│   ├── Table.tsx       # Sortable table component
│   ├── Modal.tsx       # Modal for confirmations
│   ├── ProfileForm.tsx # Profile update form
│   ├── VehicleForm.tsx # Vehicle details form (drivers)
│   ├── RideRequestForm.tsx # Ride request form (students)
│   └── EmptyState.tsx  # Empty state component
├── lib/                # Utilities
└── public/             # Static assets
```

## Demo Script (5-7 Minutes)

1. **Introduction (1 min)**:
   - Explain the project: University transportation platform for students.
   - Show login page and role selection.

2. **Student Flow (2 mins)**:
   - Log in as student.
   - Show sidebar and navigate to Dashboard (stats cards).
   - Go to Request Ride: Fill form and submit.
   - Check My Rides tab for ride status.
   - Settings: Update profile and show success message.

3. **Driver Flow (1 min)**:
   - Log in as driver.
   - Show Dashboard with ride requests (accept/decline).
   - Vehicle tab: Update vehicle details.

4. **Admin Flow (1 min)**:
   - Log in as admin.
   - Show Dashboard stats.
   - Pending Approvals: Approve a user and show toast.

5. **Wrap-up (1 min)**:
   - Highlight responsive design and approval flows.
   - Mention backend integration for real functionality.

## Technologies Used
- **Framework**: Next.js (App Router)
- **Language**: TypeScript/JavaScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React useState/useEffect

## Notes
- This is a demo frontend; authentication is handled by the backend.
- Mock data is used for rides and stats.
- For production, integrate with a real database and add payment processing.
