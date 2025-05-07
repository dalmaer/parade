import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getModelProvider } from '../../src/providers/index.js';
import { OpenAIProvider } from '../../src/providers/openai.js';
import { AnthropicProvider } from '../../src/providers/anthropic.js';
import { GeminiProvider } from '../../src/providers/gemini.js';

describe('Provider Factory', () => {
  it('should return OpenAIProvider when provider is openai', () => {
    const provider = getModelProvider('openai');
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  it('should return AnthropicProvider when provider is anthropic', () => {
    const provider = getModelProvider('anthropic');
    expect(provider).toBeInstanceOf(AnthropicProvider);
  });

  it('should return GeminiProvider when provider is gemini', () => {
    const provider = getModelProvider('gemini');
    expect(provider).toBeInstanceOf(GeminiProvider);
  });

  it('should default to OpenAIProvider when provider is not specified', () => {
    const provider = getModelProvider();
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });
});
