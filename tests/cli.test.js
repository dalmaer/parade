import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cli } from '../src/cli.js';
import * as envModule from '../src/utils/env.js';
import * as openaiModule from '../src/models/openai.js';
import * as anthropicModule from '../src/models/anthropic.js';
import * as geminiModule from '../src/models/gemini.js';
import sinon from 'sinon';
import React from 'react';
import * as ink from 'ink';

// Mock the render function from ink
vi.mock('ink', () => ({
  render: vi.fn(() => ({
    rerender: vi.fn(),
    unmount: vi.fn()
  }))
}));

// Mock environment loading
vi.mock('../src/utils/env.js', () => ({
  loadEnv: vi.fn()
}));

describe('CLI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Override process.exit to prevent tests from exiting
    const originalExit = process.exit;
    vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`Process exited with code ${code}`);
    });
    
    // Mock console.error to catch error messages
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('parade list <provider>', () => {
    it('loads environment variables and renders the list UI for OpenAI', async () => {
      // Mock the OpenAI provider's listModels method
      const mockModels = [
        { id: 'gpt-4', created: 1687882410 },
        { id: 'gpt-3.5-turbo', created: 1677610602 }
      ];
      
      const listModelsSpy = vi.spyOn(openaiModule.OpenAIProvider.prototype, 'listModels')
        .mockResolvedValue(mockModels);
      
      // Call CLI with list command
      await cli(['node', 'parade', 'list', 'openai']);
      
      // Verify env was loaded
      expect(envModule.loadEnv).toHaveBeenCalled();
      
      // Verify provider's listModels was called
      expect(listModelsSpy).toHaveBeenCalled();
      
      // Verify ink render was called with appropriate components
      expect(ink.render).toHaveBeenCalledTimes(1);
      const firstRenderCall = ink.render.mock.calls[0][0];
      
      // Basic component validation
      expect(firstRenderCall.type.name).toBe('ListModels');
      expect(firstRenderCall.props.provider).toBe('openai');
      expect(firstRenderCall.props.loading).toBe(true);
    });
    
    it('handles unknown providers gracefully', async () => {
      // Attempt to call CLI with unknown provider
      try {
        await cli(['node', 'parade', 'list', 'unknown-provider']);
      } catch (error) {
        // Process.exit was called
        expect(error.message).toContain('Process exited');
      }
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Unknown provider')
      );
    });
  });
  
  describe('parade validate <provider:model>', () => {
    it('validates an OpenAI model correctly', async () => {
      // Mock the OpenAI provider's validateModel method
      const validateModelSpy = vi.spyOn(openaiModule.OpenAIProvider.prototype, 'validateModel')
        .mockResolvedValue(true);
      
      // Call CLI with validate command
      await cli(['node', 'parade', 'validate', 'openai:gpt-4']);
      
      // Verify env was loaded
      expect(envModule.loadEnv).toHaveBeenCalled();
      
      // Verify provider's validateModel was called with the right model
      expect(validateModelSpy).toHaveBeenCalledWith('gpt-4');
      
      // Verify ink render was called with appropriate components
      expect(ink.render).toHaveBeenCalledTimes(1);
      const firstRenderCall = ink.render.mock.calls[0][0];
      
      // Basic component validation
      expect(firstRenderCall.type.name).toBe('ValidateModel');
      expect(firstRenderCall.props.provider).toBe('openai');
      expect(firstRenderCall.props.model).toBe('gpt-4');
      expect(firstRenderCall.props.loading).toBe(true);
    });
    
    it('validates an Anthropic model correctly with ✅ or ❌', async () => {
      // Mock the Anthropic provider's validateModel method
      const validateModelSpy = vi.spyOn(anthropicModule.AnthropicProvider.prototype, 'validateModel')
        .mockResolvedValue(false); // Test the failing case (❌)
      
      // Call CLI with validate command
      await cli(['node', 'parade', 'validate', 'anthropic:claude-3']);
      
      // Verify provider's validateModel was called with the right model
      expect(validateModelSpy).toHaveBeenCalledWith('claude-3');
      
      // Verify ink render was called
      expect(ink.render).toHaveBeenCalledTimes(1);
      
      // We can't easily test for the ❌ symbol in the output without mocking React component rendering
      // In a real test, we might use a testing library that can test rendered output
    });
    
    it('handles invalid model format gracefully', async () => {
      // Attempt to call CLI with invalid model format
      try {
        await cli(['node', 'parade', 'validate', 'invalid-format']);
      } catch (error) {
        // Process.exit was called
        expect(error.message).toContain('Process exited');
      }
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid model format')
      );
    });
  });
});