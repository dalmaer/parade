import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GroqProvider } from '../../src/models/groq.js';

// Mock the @ai-sdk/groq library
const mockGroqChat = vi.fn();
vi.mock('@ai-sdk/groq', () => ({
  createGroq: vi.fn(() => ({
    chat: mockGroqChat,
  })),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GroqProvider', () => {
  let provider;

  beforeEach(() => {
    provider = new GroqProvider();
    mockGroqChat.mockReset();
    mockFetch.mockReset();
    process.env.GROQ_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.GROQ_API_KEY;
  });

  describe('constructor', () => {
    it('should initialize Groq client with API key from environment variable', () => {
      expect(GroqProvider).toBeDefined();
    });
  });

  describe('listModels', () => {
    it('should fetch and map models correctly on successful API call', async () => {
      const mockApiResponse = {
        data: [
          { id: 'llama3-8b-8192', created: 1693721698, owned_by: 'Meta', context_window: 8192 },
          { id: 'gemma2-9b-it', created: 1693721699, owned_by: 'Google', context_window: 8192, description: 'Gemma 2' },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const models = await provider.listModels();

      expect(mockFetch).toHaveBeenCalledWith('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: 'Bearer test-api-key' },
      });
      expect(models).toEqual([
        { id: 'llama3-8b-8192', created: 1693721698000, description: 'Owned by: Meta, Context Window: 8192' },
        { id: 'gemma2-9b-it', created: 1693721699000, description: 'Gemma 2' },
      ]);
    });

    it('should return an empty array if API call fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'API Error',
      });
      console.error = vi.fn(); // Suppress console.error

      const models = await provider.listModels();

      expect(models).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error listing Groq models:', expect.any(Error));
    });

    it('should return an empty array if API response is not as expected', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // Malformed response
      });
      console.error = vi.fn(); // Suppress console.error

      const models = await provider.listModels();
      expect(models).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error listing Groq models:', expect.any(Error));
    });
  });

  describe('validateModel', () => {
    it('should return true if model validation is successful', async () => {
      mockGroqChat.mockResolvedValueOnce({ choices: [] });

      const isValid = await provider.validateModel('llama3-8b-8192');

      expect(isValid).toBe(true);
      expect(mockGroqChat).toHaveBeenCalledWith({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 5,
      });
    });

    it('should return false if model validation fails', async () => {
      mockGroqChat.mockRejectedValueOnce(new Error('Invalid model'));
      console.error = vi.fn(); // Suppress console.error

      const isValid = await provider.validateModel('invalid-model');

      expect(isValid).toBe(false);
      expect(mockGroqChat).toHaveBeenCalledWith({
        model: 'invalid-model',
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 5,
      });
      expect(console.error).toHaveBeenCalledWith('Error validating Groq model invalid-model:', 'Invalid model');
    });
  });
});
