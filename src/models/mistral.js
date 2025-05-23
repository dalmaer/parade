import { createMistral } from '@ai-sdk/mistral';
import { Provider } from './provider.js';

export class MistralProvider extends Provider {
  constructor() {
    super();
    this.mistral = createMistral({
      apiKey: process.env.MISTRAL_API_KEY,
    });
  }

  async listModels() {
    try {
      const response = await fetch('https://api.mistral.ai/v1/models', {
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      const jsonResponse = await response.json();
      return jsonResponse.data.map((model) => ({
        id: model.id,
        created: model.created * 1000, // Convert seconds to milliseconds
        description: model.description,
      }));
    } catch (error) {
      console.error('Error listing Mistral models:', error);
      return [];
    }
  }

  async validateModel(modelId) {
    try {
      // Make a minimal call to check if the model is valid
      await this.mistral.chat({
        model: modelId,
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 5,
      });
      return true;
    } catch (error) {
      // If the API call fails, the model is likely invalid or inaccessible
      console.error(`Error validating Mistral model ${modelId}:`, error.message);
      return false;
    }
  }
}
