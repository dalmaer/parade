import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

/**
 * Load environment variables from .env files
 * Order of precedence:
 * 1. Path provided as argument
 * 2. .env in current working directory
 * 3. PARADE_DOTENV if set
 * 4. Fall back to existing process.env
 * 
 * @param {string} dotenvPath Optional path to a .env file
 */
export function loadEnv(dotenvPath) {
  let loaded = false;

  // 1. Try specified path if provided
  if (dotenvPath && fs.existsSync(dotenvPath)) {
    config({ path: dotenvPath });
    loaded = true;
  }

  // 2. Try .env in current working directory
  if (!loaded) {
    const cwdEnvPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(cwdEnvPath)) {
      config({ path: cwdEnvPath });
      loaded = true;
    }
  }

  // 3. Try PARADE_DOTENV if set
  if (!loaded && process.env.PARADE_DOTENV && fs.existsSync(process.env.PARADE_DOTENV)) {
    config({ path: process.env.PARADE_DOTENV });
    loaded = true;
  }

  // 4. Fall back to process.env (which happens automatically)
  // We'll check for specific API keys in the provider implementation
}

/**
 * Check if a specific provider API key is available
 * @param {string} provider - The provider name (openai, anthropic, gemini)
 * @returns {boolean} - True if the API key is available, false otherwise
 */
export function hasApiKey(provider) {
  const providerEnvMap = {
    'openai': 'OPENAI_API_KEY',
    'anthropic': 'ANTHROPIC_API_KEY',
    'gemini': 'GEMINI_API_KEY'
  };
  
  const envKey = providerEnvMap[provider.toLowerCase()];
  if (!envKey) {
    return false; // Unknown provider
  }
  
  return !!process.env[envKey];
}