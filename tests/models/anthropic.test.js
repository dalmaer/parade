import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnthropicProvider } from '../../src/models/anthropic.js';
import sinon from 'sinon';

// Mock global fetch
global.fetch = vi.fn();

describe('AnthropicProvider', () => {
  let provider;
  
  beforeEach(() => {
    // Reset environment and mocks
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
    vi.clearAllMocks();
    
    // Create provider instance
    provider = new AnthropicProvider();
  });
  
  describe('listModels()', () => {
    it('returns an array of model objects with id and created properties', async () => {
      const models = await provider.listModels();
      
      // Verify returned models
      expect(models).toBeInstanceOf(Array);
      expect(models.length).toBeGreaterThan(0);
      
      // Check structure of models
      models.forEach(model => {
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('created');
        expect(typeof model.id).toBe('string');
        expect(typeof model.created).toBe('number');
      });
      
      // Check for a specific model
      expect(models.some(m => m.id.includes('claude-3'))).toBe(true);
    });
  });
  
  describe('validateModel()', () => {
    it('returns true for a valid model', async () => {
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true
      });
      
      const isValid = await provider.validateModel('claude-3-opus-20240229');
      
      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-api-key'
          }),
          body: expect.stringContaining('"model":"claude-3-opus-20240229"')
        })
      );
      
      expect(isValid).toBe(true);
    });
    
    it('handles model aliases correctly', async () => {
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true
      });
      
      const isValid = await provider.validateModel('claude-3-opus-latest');
      
      // Verify fetch was called with the actual model ID
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"model":"claude-3-opus-20240229"')
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
      
      const isValid = await provider.validateModel('claude-3-opus-20240229');
      
      expect(isValid).toBe(false);
    });
  });
});