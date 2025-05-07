import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIProvider } from '../../src/models/openai.js';
import sinon from 'sinon';

// Mock global fetch
global.fetch = vi.fn();

describe('OpenAIProvider', () => {
  let provider;
  
  beforeEach(() => {
    // Reset environment and mocks
    process.env.OPENAI_API_KEY = 'test-api-key';
    vi.clearAllMocks();
    
    // Create provider instance
    provider = new OpenAIProvider();
  });
  
  describe('listModels()', () => {
    it('returns an array of model objects with id and created properties', async () => {
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { id: 'gpt-4', created: 1687882410 },
            { id: 'gpt-3.5-turbo', created: 1677610602 }
          ]
        })
      });
      
      const models = await provider.listModels();
      
      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/models',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          })
        })
      );
      
      // Verify returned models
      expect(models).toBeInstanceOf(Array);
      expect(models).toHaveLength(2);
      expect(models[0]).toHaveProperty('id', 'gpt-4');
      expect(models[0]).toHaveProperty('created', 1687882410);
    });
    
    it('returns an empty array if the API call fails', async () => {
      // Mock failed API response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });
      
      const models = await provider.listModels();
      
      expect(models).toBeInstanceOf(Array);
      expect(models).toHaveLength(0);
    });
  });
  
  describe('validateModel()', () => {
    it('returns true for a valid model', async () => {
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true
      });
      
      const isValid = await provider.validateModel('gpt-4');
      
      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"model":"gpt-4"')
        })
      );
      
      expect(isValid).toBe(true);
    });
    
    it('returns false for an invalid model', async () => {
      // Mock failed API response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });
      
      const isValid = await provider.validateModel('nonexistent-model');
      
      expect(isValid).toBe(false);
    });
    
    it('returns false if the API request throws an error', async () => {
      // Mock fetch throwing an error
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      const isValid = await provider.validateModel('gpt-4');
      
      expect(isValid).toBe(false);
    });
  });
});