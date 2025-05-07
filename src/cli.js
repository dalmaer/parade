import { Command } from 'commander';
import { loadEnv } from './utils/env.js';
import { listCommand } from './commands/list.js';
import { validateCommand } from './commands/validate.js';
import { searchCommand } from './commands/search.js';

// Hardcode version for simplicity
const version = '0.1.0';

export function cli(args) {
  const program = new Command();

  program
    .name('parade')
    .description('CLI for inspecting AI model providers')
    .version(version)
    .option('--dotenv <path>', 'Path to a .env file (overrides default lookup)');

  // Global pre-action to load environment variables
  program.hook('preAction', (thisCommand) => {
    const options = thisCommand.opts();
    loadEnv(options.dotenv);
  });

  // List command
  program
    .command('list')
    .description('List all available models for a provider')
    .argument('<provider>', 'Provider name (openai, anthropic, gemini)')
    .argument('[filter]', 'Optional filter for model IDs (e.g., "gpt-" to show only GPT models)')
    .option('--sort <type>', 'Sort models by: newest (default), name, oldest', 'newest')
    .action((provider, filter, options) => {
      // Handle provider aliases at the CLI level
      let normalizedProvider = provider.toLowerCase();
      if (normalizedProvider === 'google') {
        normalizedProvider = 'gemini';
      } else if (normalizedProvider === 'claude') {
        normalizedProvider = 'anthropic';
      }
      listCommand(normalizedProvider, filter, options.sort);
    });

  // Validate command  
  program
    .command('validate')
    .description('Validate a model identifier')
    .argument('<provider:model>', 'Model identifier (e.g. openai:gpt-4, anthropic:claude-3-5-sonnet-latest, gemini:gemini-pro)')
    .action((modelString) => {
      // Handle provider aliases at the CLI level
      const modelLower = modelString.toLowerCase();
      
      if (modelLower.startsWith('google:')) {
        const modelPart = modelString.substring(modelString.indexOf(':') + 1);
        validateCommand(`gemini:${modelPart}`);
      } else if (modelLower.startsWith('claude:')) {
        const modelPart = modelString.substring(modelString.indexOf(':') + 1);
        validateCommand(`anthropic:${modelPart}`);
      } else {
        validateCommand(modelString);
      }
    });

  // Search command
  program
    .command('search')
    .description('Search for models across all providers')
    .argument('<query>', 'Search term to find in model IDs and descriptions')
    .option('--sort <type>', 'Sort models by: newest (default), name, oldest', 'newest')
    .action((query, options) => searchCommand(query, options));

  program.parse(args);
}