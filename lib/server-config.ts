import invariant from 'tiny-invariant';

/**
 * Server-side configuration loaded once into memory
 * This ensures environment variables are not accessed repeatedly
 * and cannot be exposed to the client side
 *
 * SECURITY NOTE: This file should never be imported in client-side code
 * as it contains sensitive server configuration
 */
class ServerConfig {
  private static instance: ServerConfig | null = null;

  public readonly google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };

  private constructor() {
    // Load environment variables once during instantiation
    const {
      GOOGLE_CLIENT_ID: clientId,
      GOOGLE_CLIENT_SECRET: clientSecret,
      GOOGLE_AUTHORIZED_REDIRECT_URI: redirectUri,
    } = process.env;

    invariant(clientId, 'GOOGLE_CLIENT_ID environment variable is not defined');
    invariant(
      clientSecret,
      'GOOGLE_CLIENT_SECRET environment variable is not defined'
    );
    invariant(
      redirectUri,
      'GOOGLE_AUTHORIZED_REDIRECT_URI environment variable is not defined'
    );

    this.google = {
      clientId,
      clientSecret,
      redirectUri,
    };
  }

  public static getInstance(): ServerConfig {
    if (!ServerConfig.instance) {
      ServerConfig.instance = new ServerConfig();
    }
    return ServerConfig.instance;
  }

  public static reset(): void {
    ServerConfig.instance = null;
  }
}

export const serverConfig = ServerConfig.getInstance();
