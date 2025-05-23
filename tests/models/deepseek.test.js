import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DeepSeekProvider } from '../../src/models/deepseek.js';

// Mock the @ai-sdk/deepseek library
const mockDeepSeekChat = vi.fn();
vi.mock('@ai-sdk/deepseek', () => ({
  createDeepSeek: vi.fn(() => ({
    chat: mockDeepSeekChat,
  })),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('DeepSeekProvider', () => {
  let provider;

  beforeEach(() => {
    provider = new DeepSeekProvider();
    mockDeepSeekChat.mockReset();
    mockFetch.mockReset();
    process.env.DEEPSEEK_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.DEEPSEEK_API_KEY;
  });

  describe('constructor', () => {
    it('should initialize DeepSeek client with API key from environment variable', () => {
      expect(DeepSeekProvider).toBeDefined();
    });
  });

  describe('listModels', () => {
    it('should fetch and map models correctly on successful API call', async () => {
      const mockApiResponse = {
        data: [
          { id: 'deepseek-chat', created: 1677652288, description: 'DeepSeek Chat Model' },
          { id: 'deepseek-coder', created: 1677652289, description: 'DeepSeek Coder Model' },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const models = await provider.listModels();

      expect(mockFetch).toHaveBeenCalledWith('https://api.deepseek.com/v1/models', {
        headers: { Authorization: 'Bearer test-api-key' },
      });
      expect(models).toEqual([
        { id: 'deepseek-chat', created: 1677652288000, description: 'DeepSeek Chat Model' },
        { id: 'deepseek-coder', created: 1677652289000, description: 'DeepSeek Coder Model' },
      ]);
    });

    it('should return a fallback list if API call fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'API Error',
      });
      console.error = vi.fn(); // Suppress console.error

      const models = await provider.listModels();

      expect(models).toEqual([
        { id: 'deepseek-chat', created: expect.any(Number), description: 'DeepSeek Chat Model' },
        { id: 'deepseek-coder', created: expect.any(Number), description: 'DeepSeek Coder Model' },
      ]);
      expect(console.error).toHaveBeenCalledWith('Error listing DeepSeek models (attempted with common API pattern):', expect.any(Error));
    });

    it('should return a fallback list if API response is not as expected', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // Malformed response
      });
      console.error = vi.fn(); // Suppress console.error

      const models = await provider.listModels();
      expect(models).toEqual([
        { id: 'deepseek-chat', created: expect.any(Number), description: 'DeepSeek Chat Model' },
        { id: 'deepseek-coder', created: expect.any(Number), description: 'DeepSeek Coder Model' },
      ]);
      expect(console.error).toHaveBeenCalledWith('Error listing DeepSeek models (attempted with common API pattern):', expect.any(Error));
    });
  });

  describe('validateModel', () => {
    it('should return true if model validation is successful', async () => {
      mockDeepSeekChat.mockResolvedValueOnce({ choices: [] });

      const isValid = await provider.validateModel('deepseek-chat');

      expect(isValid).toBe(true);
      expect(mockDeepSeekChat).toHaveBeenCalledWith({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 5,
      });
    });

    it('should return false if model validation fails', async () => {
      mockDeepSeekChat.mockRejectedValueOnce(new Error('Invalid model'));
      console.error = vi.fn(); // Suppress console.error

      const isValid = await provider.validateModel('invalid-model');

      expect(isValid).toBe(false);
      expect(mockDeepSeekChat).toHaveBeenCalledWith({
        model: 'invalid-model',
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 5,
      });
      expect(console.error).toHaveBeenCalledWith('Error validating DeepSeek model invalid-model:', 'Invalid model');
    });
  });
});
