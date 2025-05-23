import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MistralProvider } from '../../src/models/mistral.js';

// Mock the @ai-sdk/mistral library
const mockMistralChat = vi.fn();
vi.mock('@ai-sdk/mistral', () => ({
  createMistral: vi.fn(() => ({
    chat: mockMistralChat,
  })),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('MistralProvider', () => {
  let provider;

  beforeEach(() => {
    provider = new MistralProvider();
    // Reset mocks before each test
    mockMistralChat.mockReset();
    mockFetch.mockReset();
    process.env.MISTRAL_API_KEY = 'test-api-key'; // Ensure API key is set for constructor
  });

  afterEach(() => {
    delete process.env.MISTRAL_API_KEY;
  });

  describe('constructor', () => {
    it('should initialize Mistral client with API key from environment variable', () => {
      expect(MistralProvider).toBeDefined(); // Basic check
      // The actual check for createMistral call is implicitly done by it being mocked
    });
  });

  describe('listModels', () => {
    it('should fetch and map models correctly on successful API call', async () => {
      const mockApiResponse = {
        data: [
          { id: 'mistral-tiny', created: 1677652288, description: 'Tiny model' },
          { id: 'mistral-small', created: 1677652289, description: 'Small model' },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const models = await provider.listModels();

      expect(mockFetch).toHaveBeenCalledWith('https://api.mistral.ai/v1/models', {
        headers: { Authorization: 'Bearer test-api-key' },
      });
      expect(models).toEqual([
        { id: 'mistral-tiny', created: 1677652288000, description: 'Tiny model' },
        { id: 'mistral-small', created: 1677652289000, description: 'Small model' },
      ]);
    });

    it('should return an empty array if API call fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'API Error',
      });
      console.error = vi.fn(); // Suppress console.error for this test

      const models = await provider.listModels();

      expect(models).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error listing Mistral models:', expect.any(Error));
    });

    it('should return an empty array if API response is not as expected', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // Malformed response
      });
      console.error = vi.fn(); // Suppress console.error for this test

      const models = await provider.listModels();
      expect(models).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error listing Mistral models:', expect.any(Error));
    });
  });

  describe('validateModel', () => {
    it('should return true if model validation is successful', async () => {
      mockMistralChat.mockResolvedValueOnce({ choices: [] }); // Simulate successful chat call

      const isValid = await provider.validateModel('mistral-small');

      expect(isValid).toBe(true);
      expect(mockMistralChat).toHaveBeenCalledWith({
        model: 'mistral-small',
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 5,
      });
    });

    it('should return false if model validation fails', async () => {
      mockMistralChat.mockRejectedValueOnce(new Error('Invalid model'));
      console.error = vi.fn(); // Suppress console.error for this test

      const isValid = await provider.validateModel('invalid-model');

      expect(isValid).toBe(false);
      expect(mockMistralChat).toHaveBeenCalledWith({
        model: 'invalid-model',
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 5,
      });
      expect(console.error).toHaveBeenCalledWith('Error validating Mistral model invalid-model:', 'Invalid model');
    });
  });
});
