import React from 'react';
import { render } from 'ink';
import { createProvider, getSupportedProviders } from '../models/index.js';
import { hasApiKey } from '../utils/env.js';
import SearchResults from '../ui/SearchResults.js';

/**
 * Command handler for "parade search <query>"
 * Searches for models matching the query across all supported providers
 * @param {string} query - The search term to look for in model IDs
 * @param {Object} options - Command options (sort)
 */
export async function searchCommand(query, options = {}) {
  const sort = options.sort || 'newest';
  const supportedProviders = getSupportedProviders();
  let searchResults = [];
  
  // Initial render with loading state
  const { rerender, unmount } = render(
    <SearchResults
      results={[]}
      query={query}
      loading={true}
    />
  );
  
  try {
    // Search across all providers
    for (const providerName of supportedProviders) {
      // Skip providers without API keys
      if (!hasApiKey(providerName)) {
        searchResults.push({
          name: providerName,
          models: [],
          error: 'Missing API key'
        });
        continue;
      }
      
      try {
        // Create provider instance and fetch models
        const provider = createProvider(providerName);
        const models = await provider.listModels();
        
        // Filter models that match the query
        const matchingModels = models.filter(model => 
          model.id.toLowerCase().includes(query.toLowerCase()) ||
          (model.description && model.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        // Sort matching models
        if (sort === 'newest') {
          matchingModels.sort((a, b) => b.created - a.created);
        } else if (sort === 'oldest') {
          matchingModels.sort((a, b) => a.created - b.created);
        } else {
          // Default to sorting by name
          matchingModels.sort((a, b) => a.id.localeCompare(b.id));
        }
        
        searchResults.push({
          name: providerName,
          models: matchingModels,
          error: null
        });
      } catch (error) {
        searchResults.push({
          name: providerName,
          models: [],
          error: error.message
        });
      }
    }
    
    // Update render with results
    rerender(
      <SearchResults
        results={searchResults}
        query={query}
        loading={false}
      />
    );
  } catch (error) {
    // Render error state
    rerender(
      <SearchResults
        results={[]}
        query={query}
        loading={false}
        error={error.message}
      />
    );
  }
}