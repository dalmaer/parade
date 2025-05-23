import { createGroq } from '@ai-sdk/groq';
import { Provider } from './provider.js';

export class GroqProvider extends Provider {
  constructor() {
    super();
    this.groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async listModels() {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      const jsonResponse = await response.json();
      return jsonResponse.data.map((model) => ({
        id: model.id,
        created: model.created * 1000, // Convert seconds to milliseconds
        // Groq API list models response includes 'owned_by' rather than a generic 'description'.
        // We'll use 'owned_by' and provide a more generic description if needed.
        description: model.description || `Owned by: ${model.owned_by}, Context Window: ${model.context_window}`,
      }));
    } catch (error) {
      console.error('Error listing Groq models:', error);
      return [];
    }
  }

  async validateModel(modelId) {
    try {
      // Make a minimal call to check if the model is valid
      await this.groq.chat({
        model: modelId,
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 5,
      });
      return true;
    } catch (error) {
      // If the API call fails, the model is likely invalid or inaccessible
      console.error(`Error validating Groq model ${modelId}:`, error.message);
      return false;
    }
  }
}
