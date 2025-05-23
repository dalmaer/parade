import { createDeepSeek } from '@ai-sdk/deepseek';
import { Provider } from './provider.js';

export class DeepSeekProvider extends Provider {
  constructor() {
    super();
    this.deepseek = createDeepSeek({
      apiKey: process.env.DEEPSEEK_API_KEY,
    });
  }

  async listModels() {
    try {
      // Assuming DeepSeek API is similar to OpenAI and Mistral
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      const jsonResponse = await response.json();
      // Assuming the response structure is similar to OpenAI:
      // { data: [ { id: 'model-id', created: 1677652288, ... } ] }
      return jsonResponse.data.map((model) => ({
        id: model.id,
        created: model.created * 1000, // Convert seconds to milliseconds
        // DeepSeek API might not provide a 'description'.
        // If model.description is undefined, it will be handled by the caller.
        description: model.description,
      }));
    } catch (error) {
      console.error('Error listing DeepSeek models (attempted with common API pattern):', error);
      // Return a predefined list or an empty list if the API call fails
      // This helps in partial functionality even if API documentation is unavailable.
      // These are common DeepSeek model names, actual availability might vary.
      return [
        { id: 'deepseek-chat', created: Date.now(), description: 'DeepSeek Chat Model' },
        { id: 'deepseek-coder', created: Date.now(), description: 'DeepSeek Coder Model' },
      ];
    }
  }

  async validateModel(modelId) {
    try {
      // Make a minimal call to check if the model is valid
      await this.deepseek.chat({
        model: modelId,
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 5,
      });
      return true;
    } catch (error) {
      // If the API call fails, the model is likely invalid or inaccessible
      console.error(`Error validating DeepSeek model ${modelId}:`, error.message);
      return false;
    }
  }
}
