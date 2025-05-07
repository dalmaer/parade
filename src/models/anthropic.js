import * as anthropicSdk from '@ai-sdk/anthropic';
import { Provider } from './provider.js';

export class AnthropicProvider extends Provider {
  constructor() {
    super();
    this.client = anthropicSdk.anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  /**
   * List all available models from Anthropic using their REST API
   * @returns {Promise<Array<{id: string, created: number, ...}>>}
   */
  async listModels() {
    try {
      const response = await fetch('https://api.anthropic.com/v1/models', {
        method: 'GET',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Using more robust checking for different possible API response formats
      // Anthropic might return different response formats
      if (data) {
        // Check for models array directly in data
        if (data.models && Array.isArray(data.models)) {
          return data.models.map(model => ({
            id: model.id,
            created: new Date(model.created_at || Date.now()).getTime(),
            description: model.description || ''
          }));
        }
        
        // Check if data itself is an array (some APIs return arrays directly)
        else if (Array.isArray(data)) {
          return data.map(model => ({
            id: model.id || model.name || 'unknown',
            created: new Date(model.created_at || model.created || Date.now()).getTime(),
            description: model.description || ''
          }));
        }
        
        // If data is an object with model list in a different format
        else if (typeof data === 'object') {
          // Try to extract models from any other property that might contain an array
          for (const key in data) {
            if (Array.isArray(data[key])) {
              return data[key].map(model => ({
                id: model.id || model.name || 'unknown',
                created: new Date(model.created_at || model.created || Date.now()).getTime(),
                description: model.description || ''
              }));
            }
          }
        }
      }
      
      // If we couldn't parse the response in any expected format, throw error
      console.error('Unexpected API response format from Anthropic');
      throw new Error('Unexpected API response format');
    } catch (error) {
      console.error('Error listing Anthropic models:', error.message);
      
      // Fallback to predefined models if API fails
      // Use explicit date objects for better readability and maintenance
      const feb2024_29 = new Date('2024-02-29').getTime();
      const mar2024_07 = new Date('2024-03-07').getTime();
      const jun2024_20 = new Date('2024-06-20').getTime(); 
      const nov2023_08 = new Date('2023-11-08').getTime();
      const sep2023_07 = new Date('2023-09-07').getTime();
      const jul2023_11 = new Date('2023-07-11').getTime();
      
      const ANTHROPIC_MODELS = [
        {
          id: 'claude-3-opus-20240229',
          created: feb2024_29,
          description: 'Most powerful model for highly complex tasks'
        },
        {
          id: 'claude-3-sonnet-20240229',
          created: feb2024_29,
          description: 'Ideal balance of intelligence and speed'
        },
        {
          id: 'claude-3-haiku-20240307',
          created: mar2024_07,
          description: 'Fastest and most compact model'
        },
        {
          id: 'claude-3-5-sonnet-20240620',
          created: jun2024_20,
          description: 'Latest Sonnet model with improved capabilities'
        },
        {
          id: 'claude-instant-1.2',
          created: sep2023_07,
          description: 'Legacy model'
        },
        {
          id: 'claude-2.0',
          created: jul2023_11,
          description: 'Legacy model'
        },
        {
          id: 'claude-2.1',
          created: nov2023_08,
          description: 'Legacy model'
        }
      ];
      
      return ANTHROPIC_MODELS;
    }
  }

  /**
   * Validate if a model exists by attempting to use it with a minimal request
   * @param {string} modelName - The model name to validate
   * @returns {Promise<boolean>} - True if model exists, false otherwise
   */
  async validateModel(modelName) {
    try {
      // Handle model aliases if needed
      const MODEL_ALIASES = {
        'claude-3-opus-latest': 'claude-3-opus-20240229',
        'claude-3-sonnet-latest': 'claude-3-5-sonnet-20240620',
        'claude-3-haiku-latest': 'claude-3-haiku-20240307'
      };
      
      const actualModel = MODEL_ALIASES[modelName] || modelName;
      
      // Make a minimal request to check if the model is valid
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 1
        })
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}