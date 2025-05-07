import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Load application configuration
 * @returns {Object} The configuration object
 */
export function loadConfig() {
  const defaultConfig = {
    defaultProvider: 'openai',
    defaultModel: null,  // Will use provider's default
    historySize: 100,
    maxTokens: 2048
  };

  try {
    // First try to load from current directory
    if (fs.existsSync('./parade.config.json')) {
      const configFile = JSON.parse(fs.readFileSync('./parade.config.json', 'utf8'));
      return { ...defaultConfig, ...configFile };
    }

    // Then try user's home directory
    const homeConfigPath = path.join(os.homedir(), '.parade.config.json');
    if (fs.existsSync(homeConfigPath)) {
      const configFile = JSON.parse(fs.readFileSync(homeConfigPath, 'utf8'));
      return { ...defaultConfig, ...configFile };
    }
  } catch (error) {
    console.error('Error loading config:', error.message);
  }

  // Return default config if no config file found or error occurs
  return defaultConfig;
}
