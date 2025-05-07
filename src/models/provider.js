/**
 * Base provider interface
 */
export class Provider {
  /**
   * Returns an array of available models for this provider
   * @returns {Promise<Array<{id: string, created: number, ...}>>} Array of model objects
   */
  async listModels() {
    throw new Error('Method not implemented');
  }

  /**
   * Validates if a model exists and is available
   * @param {string} modelName - The name of the model to validate
   * @returns {Promise<boolean>} True if model is valid, false otherwise
   */
  async validateModel(modelName) {
    throw new Error('Method not implemented');
  }
}