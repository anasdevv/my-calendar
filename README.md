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

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
