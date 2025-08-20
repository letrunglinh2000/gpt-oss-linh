// Environment configuration template
// Copy this file to environment.ts and customize for your setup

export interface EnvironmentConfig {
  apiBaseUrl: string;
  apiPort: number;
  apiHost: string;
}

// Default configuration - customize this for your environment
export const environment: EnvironmentConfig = {
  apiHost: 'localhost',     // Change this to your LM Studio server IP (e.g., '192.168.1.100')
  apiPort: 1238,            // Change this to your LM Studio server port (e.g., 1234, 1238)
  apiBaseUrl: '', // This will be constructed automatically
};

// Construct the full API URL
environment.apiBaseUrl = `http://${environment.apiHost}:${environment.apiPort}/v1`;

export default environment;
