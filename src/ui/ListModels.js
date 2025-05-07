import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { formatDate, formatRelativeTime } from '../utils/date.js';

const ListModels = ({ provider, models, loading, error, filter, sort = 'newest' }) => {
  const [seconds, setSeconds] = useState(0);
  
  // Timer for elapsed time
  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [loading]);
  
  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }
  
  // Determine header text based on filter and sort
  let headerText = filter 
    ? `🔍 Models available for ${provider} (filtered by "${filter}")`
    : `🔍 Models available for ${provider}`;
    
  // Add sort info to header
  const sortInfo = {
    name: 'alphabetically',
    newest: 'newest first',
    oldest: 'oldest first'
  };
  headerText += ` (sorted ${sortInfo[sort] || 'alphabetically'})`;
  
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="green">{headerText}</Text>
      </Box>
      
      {loading ? (
        <Box>
          <Text color="green">
            <Spinner type="dots" />
          </Text>
          <Text> Loading models </Text>
          <Text color="gray">({seconds}s)</Text>
        </Box>
      ) : (
        <>
          {models.length === 0 ? (
            <Text color="yellow">
              {filter 
                ? `No models found matching "${filter}"`
                : "No models found"
              }
            </Text>
          ) : (
            <>
              <Text color="green">🎉 Found {models.length} models</Text>
              <Box flexDirection="column" marginTop={1}>
                {models.map((model, index) => (
                  <Box key={index} flexDirection="column" marginBottom={1}>
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
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default ListModels;