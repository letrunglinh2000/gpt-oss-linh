# Environment Configuration Setup

This project uses a separate configuration file for environment-specific settings like API endpoints. This allows you to customize the settings for your local environment without committing sensitive information to the repository.

## Quick Setup

1. **Copy the template file:**
   ```bash
   cd src/config/
   cp environment.template.ts environment.ts
   ```

2. **Edit the configuration:**
   Open `src/config/environment.ts` and update the values for your environment:
   ```typescript
   export const environment: EnvironmentConfig = {
     apiHost: 'YOUR_LM_STUDIO_IP',     // e.g., '192.168.1.100' or 'localhost'
     apiPort: YOUR_LM_STUDIO_PORT,     // e.g., 1234 or 1238
     apiBaseUrl: '', // This will be constructed automatically
   };
   ```

## Configuration Options

### `apiHost`
- **Default:** `localhost`
- **Description:** The IP address or hostname where your LM Studio server is running
- **Examples:** 
  - `'localhost'` - for local development
  - `'192.168.1.100'` - for LAN server
  - `'223.195.39.19'` - for remote server

### `apiPort`
- **Default:** `1234`
- **Description:** The port number where your LM Studio server is listening
- **Common ports:** `1234`, `1238`, `8080`

## Important Notes

- ✅ The `environment.ts` file is ignored by git and won't be committed
- ✅ Always use `environment.template.ts` as your starting point
- ✅ The `apiBaseUrl` is automatically constructed from `apiHost` and `apiPort`
- ⚠️ Never commit your actual `environment.ts` file to version control

## Troubleshooting

If you get connection errors:
1. Verify your LM Studio server is running
2. Check that the IP and port in `environment.ts` are correct
3. Ensure firewall settings allow connections to the specified port
4. Test the connection manually: `curl http://YOUR_IP:YOUR_PORT/v1/models`

## Example Configurations

### Local Development
```typescript
apiHost: 'localhost',
apiPort: 1234,
```

### LAN Server
```typescript
apiHost: '192.168.1.100',
apiPort: 1238,
```

### Remote Server
```typescript
apiHost: 'your-server.com',
apiPort: 8080,
```
