import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

const ValidateModel = ({ provider, model, isValid, loading, error }) => {
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
  
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>
          Validating model: <Text color="cyan">{provider}:{model}</Text>
        </Text>
      </Box>
      
      {loading ? (
        <Box>
          <Text color="green">
            <Spinner type="dots" />
          </Text>
          <Text> Checking model validity </Text>
          <Text color="gray">({seconds}s)</Text>
        </Box>
      ) : (
        <Box>
          {isValid === true ? (
            <Text color="green">✅ Model is valid and available</Text>
          ) : (
            <Text color="red">❌ Model is invalid or unavailable</Text>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ValidateModel;