# parade

A pluggable, ESM-based Node.js CLI for inspecting AI model providers.

## Features

* **Validate** a model identifier (`provider:modelName`) by pinging each provider's model endpoint.
* **List** all available models (and metadata) for a given provider.

Out of the box it includes support for **OpenAI**, **Anthropic**, **Google Gemini**, **Mistral**, **DeepSeek**, and **Groq**.

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/parade.git
cd parade

# Install dependencies
npm install

# Link the CLI
npm link
```

## Usage

```bash
# Validate a model name
parade validate openai:gpt-4o
parade validate anthropic:claude-3 # ❌
parade validate anthropic:claude-3-5-sonnet-latest # ✅
parade validate gemini:text-bison

# List available models for a provider
parade list openai
parade list anthropic
parade list gemini

# Show help
parade --help
```

### Global Options

| Flag              | Description                                      |
| ----------------- | ------------------------------------------------ |
| `--dotenv <path>` | Path to a `.env` file (overrides default lookup) |
| `--help`          | Display usage information                        |
| `--version`       | Show CLI version                                 |

## Environment Variables

Create a `.env` file in your project directory with the following API keys:

```
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GEMINI_API_KEY=your_gemini_api_key
MISTRAL_API_KEY=your_mistral_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
GROQ_API_KEY=your_groq_api_key
```

The CLI will look for environment variables in the following order:
1. `.env` in current working directory
2. Path provided via `--dotenv <path>` option
3. Value of `PARADE_DOTENV` environment variable if set
4. Existing environment variables in your shell

## Extending

You can add support for additional providers by:

1. Creating a new file in `src/models/` that extends the `Provider` class
2. Implementing the required methods: `listModels()` and `validateModel()`
3. Adding the provider to the factory function in `src/models/index.js`

## License

MIT
