import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { GeminiProvider } from './gemini.js';

/**
 * Factory function to create provider instances
 * @param {string} providerName - The name of the provider (openai, anthropic, gemini)
 * @returns {Provider} The provider instance
 * @throws {Error} If the provider is unknown
 */
export function createProvider(providerName) {
  const normalizedName = providerName.toLowerCase().trim();
  
  switch (normalizedName) {
    case 'openai':
      return new OpenAIProvider();
    case 'anthropic':
      return new AnthropicProvider();
    case 'gemini':
      return new GeminiProvider();
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}

/**
 * Get all supported provider names
 * @returns {string[]} List of provider names
 */
export function getSupportedProviders() {
  return ['openai', 'anthropic', 'gemini'];
}

/**
 * Parse a provider:model string into its components
 * @param {string} modelString - The model string to parse (e.g., "openai:gpt-4")
 * @returns {{provider: string, model: string}} The parsed provider and model
 * @throws {Error} If the format is invalid
 */
export function parseModelString(modelString) {
  const match = modelString.match(/^([^:]+):(.+)$/);
  
  if (!match) {
    throw new Error(`Invalid model format: ${modelString}. Expected format: provider:model`);
  }
  
  return {
    provider: match[1].toLowerCase().trim(),
    model: match[2].trim()
  };
}