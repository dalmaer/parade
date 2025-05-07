import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiProvider } from '../../src/models/gemini.js';
import sinon from 'sinon';

// Mock global fetch
global.fetch = vi.fn();

describe('GeminiProvider', () => {
  let provider;
  
  beforeEach(() => {
    // Reset environment and mocks
    process.env.GEMINI_API_KEY = 'test-api-key';
    vi.clearAllMocks();
    
    // Create provider instance
    provider = new GeminiProvider();
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
      expect(models.some(m => m.id.includes('gemini'))).toBe(true);
    });
  });
  
  describe('validateModel()', () => {
    it('returns true for a valid model', async () => {
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true
      });
      
      const isValid = await provider.validateModel('gemini-pro');
      
      // Verify fetch was called correctly
      const expectedUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=test-api-key';
      
      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"text":"Hello"')
        })
      );
      
      expect(isValid).toBe(true);
    });
    
    it('handles vision models correctly', async () => {
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true
      });
      
      const isValid = await provider.validateModel('gemini-pro-vision');
      
      // The URL should contain the vision model name
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('gemini-pro-vision'),
        expect.any(Object)
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
      
      const isValid = await provider.validateModel('gemini-pro');
      
      expect(isValid).toBe(false);
    });
  });
});