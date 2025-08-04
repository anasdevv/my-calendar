# My Calendar

A modern, full-stack calendar and event management application built with Next.js, TypeScript, and Drizzle ORM. Easily manage events, bookings, and schedules with a beautiful UI and Google Calendar integration.

## Features

- **Authentication**: Secure login and registration flows.
- **Event Management**: Create, edit, and view events (protected routes).
- **Booking System**: Public booking pages for events, with confirmation and feedback.
- **Scheduling**: Manage your schedule and meetings.
- **Google Calendar Integration**: Sync events with Google Calendar.
- **Reusable UI Components**: Custom buttons, dialogs, cards, and forms.
- **Database Migrations**: Versioned schema changes using Drizzle ORM.

## Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Drizzle ORM**
- **PostCSS**
- **React**

## Project Structure

```
app/            # Main application logic and routing
components/     # Reusable UI components
constants/      # Centralized constants
lib/            # Utility functions and hooks
server/         # Server-side actions and integrations
validations/    # Input validation schemas
public/         # Static assets (SVGs, images)
db/             # Database schema and migrations
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Run database migrations**:
   ```bash
   npm run migrate
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```

## Configuration

- Edit `drizzle.config.ts` for database settings.
- Update environment variables as needed for Google integration and authentication.

## Environment Variables

Create a `.env` file in the project root and add the following variables (see `copy.env` for reference):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=        # Clerk publishable key for frontend authentication
CLERK_SECRET_KEY=                         # Clerk secret key for backend authentication
NEXT_PUBLIC_CLERK_SIGN_IN_URL=            # Clerk sign-in URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL=            # Clerk sign-up URL
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL= # Optional: force redirect after sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL= # Optional: force redirect after sign-up
DATABASE_URL=                             # Database connection string
GOOGLE_CLIENT_ID=                         # Google OAuth client ID
GOOGLE_CLIENT_SECRET=                     # Google OAuth client secret
GOOGLE_AUTHORIZED_REDIRECT_URI=           # Google OAuth redirect URI
```

Be sure to fill in your actual values for each variable.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
