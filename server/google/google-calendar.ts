import { calendar_v3, google } from 'googleapis';
import { clerkClient } from '@clerk/nextjs/server';
import { GoogleAccountManager } from './google-account';
import { deleteEvent } from '../actions/event';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: { email: string }[];
}

export class GoogleCalendarService {
  private static instance: GoogleCalendarService | null = null;
  private accountManager: GoogleAccountManager;
  constructor() {
    this.accountManager = GoogleAccountManager.getInstance();
  }
  public static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }

  public async getCalendarClient(userId: string) {
    const authClient = await this.accountManager.getAuthenticatedClient(userId);
    return google.calendar({ version: 'v3', auth: authClient });
  }

  public async listEvents({
    userId,
    calendarId = 'primary',
    maxResults = 20,
    singleEvents = true,
    timeMin = new Date().toISOString(),
    timeMax = new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    ).toISOString(),
    orderBy = 'startTime',
    ...res
  }: calendar_v3.Params$Resource$Events$List & { userId: string }) {
    const calendar = await this.getCalendarClient(userId);
    const response = await calendar.events.list({
      calendarId,
      maxResults,
      singleEvents,
      timeMin,
      timeMax,
      orderBy,
      ...res,
    });
    return response?.data?.items ?? [];
  }
  public async createEvent({
    userId,
    calendarId = 'primary',
    requestBody,
  }: calendar_v3.Params$Resource$Events$Insert & {
    userId: string;
  }): Promise<calendar_v3.Schema$Event> {
    const calendar = await this.getCalendarClient(userId);
    const response = await calendar.events.insert({
      calendarId,
      requestBody,
      sendUpdates: 'all',
    });
    return response.data;
  }

  public async deleteEvent({
    userId,
    eventId,
  }: {
    userId: string;
    eventId: string;
  }): Promise<void> {
    const calendar = await this.getCalendarClient(userId);
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
  }
}
