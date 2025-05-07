import * as openaiSdk from '@ai-sdk/openai';
import { Provider } from './provider.js';

export class OpenAIProvider extends Provider {
  constructor() {
    super();
    this.client = openaiSdk.openai({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * List all available models from OpenAI
   * @returns {Promise<Array<{id: string, created: number, ...}>>}
   */
  async listModels() {
    try {
      // The AI SDK doesn't expose model listing directly, so we use fetch
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      // OpenAI returns { data: [...models] }
      if (data && data.data && Array.isArray(data.data)) {
        // Map the OpenAI model format to our standard format
        // OpenAI 'created' field is in Unix epoch seconds, need to convert to milliseconds
        return data.data.map(model => ({
          id: model.id,
          // Convert seconds to milliseconds if 'created' exists, otherwise use current time
          created: model.created ? model.created * 1000 : Date.now(),
          description: model.description || ''
        }));
      } else {
        // Handle unexpected API response format
        console.error('Unexpected API response format from OpenAI');
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Error listing OpenAI models:', error.message);
      return [];
    }
  }

  /**
   * Validate if a model exists by attempting to use it with a minimal request
   * @param {string} modelName - The model name to validate
   * @returns {Promise<boolean>} - True if model exists, false otherwise
   */
  async validateModel(modelName) {
    try {
      // Make a minimal request to check if the model is valid
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
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