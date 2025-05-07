import React from 'react';
import { render } from 'ink';
import { createProvider, getSupportedProviders } from '../models/index.js';
import { hasApiKey } from '../utils/env.js';
import ListModels from '../ui/ListModels.js';

/**
 * Command handler for "parade list <provider> [filter]"
 * @param {string} providerName - The name of the provider to list models for
 * @param {string} [filter] - Optional filter to apply to model IDs
 * @param {string} [sort='newest'] - Sort order: 'newest' (default), 'name', or 'oldest'
 */
export async function listCommand(providerName, filter, sort = 'newest') {
  // Normalize provider name
  const normalizedProviderName = providerName.toLowerCase();
  
  // Validate provider
  const supportedProviders = getSupportedProviders();
  if (!supportedProviders.includes(normalizedProviderName)) {
    console.error(`Error: Unknown provider '${providerName}'`);
    console.error(`Supported providers: ${supportedProviders.join(', ')}`);
    process.exit(1);
  }
  
  // Check if API key is available for this specific provider
  if (!hasApiKey(normalizedProviderName)) {
    console.error(`Error: Missing API key for ${providerName}.`);
    console.error(`Please set ${normalizedProviderName === 'gemini' ? 'GOOGLE' : normalizedProviderName.toUpperCase()}_API_KEY in your environment or .env file.`);
    process.exit(1);
  }
  
  // Initial render with loading state
  const { rerender, unmount } = render(
    <ListModels 
      provider={providerName} 
      models={[]} 
      loading={true} 
      filter={filter} 
      sort={sort}
    />
  );
  
  try {
    // Create provider and fetch models
    const provider = createProvider(normalizedProviderName);
    let models = await provider.listModels();
    
    // Apply filter if provided
    if (filter) {
      models = models.filter(model => model.id.includes(filter));
    }
    
    // Apply sorting based on the sort parameter
    if (sort === 'newest') {
      models.sort((a, b) => b.created - a.created);
    } else if (sort === 'oldest') {
      models.sort((a, b) => a.created - b.created);
    } else {
      // Default to sorting by name
      models.sort((a, b) => a.id.localeCompare(b.id));
    }
    
    // Update render with fetched models
    rerender(
      <ListModels 
        provider={providerName} 
        models={models} 
        loading={false} 
        filter={filter}
        sort={sort}
      />
    );
    
  } catch (error) {
    // Render error state
    rerender(
      <ListModels 
        provider={providerName} 
        models={[]} 
        loading={false} 
        error={error.message}
        filter={filter}
        sort={sort}
      />
    );
  }
}