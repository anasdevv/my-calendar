'use server';
import { google } from 'googleapis';
import { clerkClient } from '@clerk/nextjs/server';
import { GoogleAccountManager } from './google-account';

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
}
