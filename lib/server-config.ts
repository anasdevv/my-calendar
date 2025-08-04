import invariant from 'tiny-invariant';

class ServerConfig {
  private static instance: ServerConfig | null = null;

  public readonly google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  public readonly databaseUrl: string;

  private constructor() {
    if (typeof window !== 'undefined') {
      throw new Error(
        'ServerConfig can only be instantiated on the server side'
      );
    }

    const {
      GOOGLE_CLIENT_ID: clientId,
      GOOGLE_CLIENT_SECRET: clientSecret,
      GOOGLE_AUTHORIZED_REDIRECT_URI: redirectUri,
      DATABASE_URL: databaseUrl,
    } = process.env;

    invariant(
      clientId?.trim(),
      'GOOGLE_CLIENT_ID environment variable is not defined'
    );
    invariant(
      clientSecret?.trim(),
      'GOOGLE_CLIENT_SECRET environment variable is not defined'
    );
    invariant(
      redirectUri?.trim(),
      'GOOGLE_AUTHORIZED_REDIRECT_URI environment variable is not defined'
    );
    invariant(
      databaseUrl?.trim(),
      'DATABASE_URL environment variable is not defined'
    );

    this.google = {
      clientId: clientId!,
      clientSecret: clientSecret!,
      redirectUri: redirectUri!,
    };
    this.databaseUrl = databaseUrl!;
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

export const getServerConfig = () => ServerConfig.getInstance();

export const getGoogleConfig = () => getServerConfig().google;
export const getDatabaseUrl = () => getServerConfig().databaseUrl;
