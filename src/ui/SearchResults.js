import React from 'react';
import { Box, Text } from 'ink';
import { formatDate, formatRelativeTime } from '../utils/date.js';

const SearchResults = ({ results, query, error, loading }) => {
  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box>
        <Text color="yellow">Searching across providers for models matching "{query}"...</Text>
      </Box>
    );
  }

  // Calculate totals
  const totalModels = results.reduce((sum, provider) => sum + provider.models.length, 0);
  let totalProviders = results.filter(provider => provider.models.length > 0).length;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="green">🔍 Search results for "{query}" across all providers</Text>
      </Box>

      {totalModels === 0 ? (
        <Text color="yellow">No matching models found</Text>
      ) : (
        <>
          <Text color="green">🎉 Found {totalModels} matching {totalModels === 1 ? 'model' : 'models'} across {totalProviders} {totalProviders === 1 ? 'provider' : 'providers'}</Text>
          
          {results.map((provider, index) => (
            provider.models.length > 0 && (
              <Box key={index} flexDirection="column" marginTop={1}>
                <Text bold color="blue">Provider: {provider.name}</Text>
                <Box flexDirection="column" marginLeft={2}>
                  {provider.models.map((model, idx) => (
                    <Box key={idx} flexDirection="column" marginBottom={1}>
                      <Box>
                        <Text bold>{model.id}</Text>
                        <Text color="blue"> • </Text>
                        <Text color="cyan">{formatDate(model.created)}</Text>
                        <Text color="gray"> ({formatRelativeTime(model.created)})</Text>
                      </Box>
                      {model.description && (
                        <Text color="gray">{model.description}</Text>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )
          ))}
        </>
      )}
    </Box>
  );
};

export default SearchResults;