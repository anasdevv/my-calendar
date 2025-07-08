'use server';

import { clerkClient, OauthAccessToken } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import invariant from 'tiny-invariant';

export interface GoogleTokens {
  accessToken: string;
  expiresAt: number;
}
export class GoogleAccountManager {
  private static instance: GoogleAccountManager | null = null;
  private oauth2Client: any;
  private clerkClient: typeof clerkClient;
  private readonly provider = 'google';
  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_AUTHORIZED_REDIRECT_URI;
    invariant(clientId, 'GOOGLE_CLIENT_ID is not defined');
    invariant(clientSecret, 'GOOGLE_CLIENT_SECRET is not defined');
    invariant(redirectUri, 'GOOGLE_AUTHORIZED_REDIRECT_URI is not defined');
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    this.clerkClient = clerkClient;
  }

  public static getInstance(): GoogleAccountManager {
    if (!GoogleAccountManager.instance) {
      GoogleAccountManager.instance = new GoogleAccountManager();
    }
    return GoogleAccountManager.instance;
  }

  public async getAuthenticatedClient(userId: string) {
    const tokens = await this.getTokens(userId);
    if (!tokens) {
      throw new Error('No tokens found for user');
    }
    // clerk does not provide refresh tokens, so we only use access token
    // and do not refresh it
    this.oauth2Client.setCredentials({
      access_token: tokens.accessToken,
    });
    return this.oauth2Client;
  }
  private async getTokens(userId: string): Promise<GoogleTokens | null> {
    const client = await this.clerkClient();
    const response = await client.users.getUserOauthAccessToken(
      userId,
      this.provider
    );

    const token = response?.data?.[0];
    if (!token) return null;

    return {
      accessToken: token.token,
      expiresAt: token.expiresAt as number,
    };
  }

  private isTokenExpired(expiresAt: number): boolean {
    // add 5 minute buffer
    return Date.now() >= expiresAt - 5 * 60 * 1000;
  }

  public async revokeToken(userId: string): Promise<void> {
    const client = await this.clerkClient();
    const tokens = await this.getTokens(userId);
    if (tokens) {
      this.oauth2Client.setCredentials({
        access_token: tokens.accessToken,
      });
      this.oauth2Client.revokeCredentials();
    }
    // await client.users.(userId, this.provider);
  }
}
