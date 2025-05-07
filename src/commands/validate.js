import React from 'react';
import { render } from 'ink';
import { createProvider, parseModelString } from '../models/index.js';
import { hasApiKey } from '../utils/env.js';
import ValidateModel from '../ui/ValidateModel.js';

/**
 * Command handler for "parade validate <provider:model>"
 * @param {string} modelString - The model identifier to validate (e.g., "openai:gpt-4")
 */
export async function validateCommand(modelString) {
  let provider, model;
  
  try {
    // Parse provider:model string
    const parsed = parseModelString(modelString);
    provider = parsed.provider;
    model = parsed.model;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
  
  // Check if API key is available for this specific provider
  if (!hasApiKey(provider)) {
    console.error(`Error: Missing API key for ${provider}.`);
    console.error(`Please set ${provider === 'gemini' ? 'GOOGLE' : provider.toUpperCase()}_API_KEY in your environment or .env file.`);
    process.exit(1);
  }
  
  // Initial render with loading state
  const { rerender, unmount } = render(
    <ValidateModel 
      provider={provider} 
      model={model} 
      isValid={null} 
      loading={true} 
    />
  );
  
  try {
    // Create provider and validate model
    const providerInstance = createProvider(provider);
    const isValid = await providerInstance.validateModel(model);
    
    // Update render with validation result
    rerender(
      <ValidateModel 
        provider={provider} 
        model={model} 
        isValid={isValid} 
        loading={false} 
      />
    );
    
  } catch (error) {
    // Render error state
    rerender(
      <ValidateModel 
        provider={provider} 
        model={model} 
        isValid={false} 
        loading={false} 
        error={error.message} 
      />
    );
  }
}