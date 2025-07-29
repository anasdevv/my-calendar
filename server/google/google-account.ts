import { clerkClient, OauthAccessToken } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { serverConfig } from '../../lib/server-config';

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
    const { clientId, clientSecret, redirectUri } = serverConfig.google;

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
    try {
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
    } catch (error: any) {
      console.error('Error getting OAuth access token from Clerk:', error);
      if (error.status === 400) {
        throw new Error(
          'User has not connected their Google account. Please connect your Google account in your profile settings.'
        );
      }
      throw error;
    }
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
  }
}
