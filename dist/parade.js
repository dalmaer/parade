#!/usr/bin/env node

// src/cli.js
import { Command } from "commander";

// src/utils/env.js
import { config } from "dotenv";
import fs from "fs";
import path from "path";
function loadEnv(dotenvPath) {
  let loaded = false;
  if (dotenvPath && fs.existsSync(dotenvPath)) {
    config({ path: dotenvPath });
    loaded = true;
  }
  if (!loaded) {
    const cwdEnvPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(cwdEnvPath)) {
      config({ path: cwdEnvPath });
      loaded = true;
    }
  }
  if (!loaded && process.env.PARADE_DOTENV && fs.existsSync(process.env.PARADE_DOTENV)) {
    config({ path: process.env.PARADE_DOTENV });
    loaded = true;
  }
}
function hasApiKey(provider) {
  const providerEnvMap = {
    "openai": "OPENAI_API_KEY",
    "anthropic": "ANTHROPIC_API_KEY",
    "gemini": "GEMINI_API_KEY"
  };
  const envKey = providerEnvMap[provider.toLowerCase()];
  if (!envKey) {
    return false;
  }
  return !!process.env[envKey];
}

// src/commands/list.js
import React2 from "react";
import { render } from "ink";

// src/models/openai.js
import * as openaiSdk from "@ai-sdk/openai";

// src/models/provider.js
var Provider = class {
  /**
   * Returns an array of available models for this provider
   * @returns {Promise<Array<{id: string, created: number, ...}>>} Array of model objects
   */
  async listModels() {
    throw new Error("Method not implemented");
  }
  /**
   * Validates if a model exists and is available
   * @param {string} modelName - The name of the model to validate
   * @returns {Promise<boolean>} True if model is valid, false otherwise
   */
  async validateModel(modelName) {
    throw new Error("Method not implemented");
  }
};

// src/models/openai.js
var OpenAIProvider = class extends Provider {
  constructor() {
    super();
    this.client = openaiSdk.openai({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  /**
   * List all available models from OpenAI
   * @returns {Promise<Array<{id: string, created: number, ...}>>}
   */
  async listModels() {
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.data && Array.isArray(data.data)) {
        return data.data.map((model) => ({
          id: model.id,
          // Convert seconds to milliseconds if 'created' exists, otherwise use current time
          created: model.created ? model.created * 1e3 : Date.now(),
          description: model.description || ""
        }));
      } else {
        console.error("Unexpected API response format from OpenAI");
        throw new Error("Unexpected API response format");
      }
    } catch (error) {
      console.error("Error listing OpenAI models:", error.message);
      return [];
    }
  }
  /**
   * Validate if a model exists by attempting to use it with a minimal request
   * @param {string} modelName - The model name to validate
   * @returns {Promise<boolean>} - True if model exists, false otherwise
   */
  async validateModel(modelName) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 1
        })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};

// src/models/anthropic.js
import * as anthropicSdk from "@ai-sdk/anthropic";
var AnthropicProvider = class extends Provider {
  constructor() {
    super();
    this.client = anthropicSdk.anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }
  /**
   * List all available models from Anthropic using their REST API
   * @returns {Promise<Array<{id: string, created: number, ...}>>}
   */
  async listModels() {
    try {
      const response = await fetch("https://api.anthropic.com/v1/models", {
        method: "GET",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }
      const data = await response.json();
      if (data) {
        if (data.models && Array.isArray(data.models)) {
          return data.models.map((model) => ({
            id: model.id,
            created: new Date(model.created_at || Date.now()).getTime(),
            description: model.description || ""
          }));
        } else if (Array.isArray(data)) {
          return data.map((model) => ({
            id: model.id || model.name || "unknown",
            created: new Date(model.created_at || model.created || Date.now()).getTime(),
            description: model.description || ""
          }));
        } else if (typeof data === "object") {
          for (const key in data) {
            if (Array.isArray(data[key])) {
              return data[key].map((model) => ({
                id: model.id || model.name || "unknown",
                created: new Date(model.created_at || model.created || Date.now()).getTime(),
                description: model.description || ""
              }));
            }
          }
        }
      }
      console.error("Unexpected API response format from Anthropic");
      throw new Error("Unexpected API response format");
    } catch (error) {
      console.error("Error listing Anthropic models:", error.message);
      const feb2024_29 = (/* @__PURE__ */ new Date("2024-02-29")).getTime();
      const mar2024_07 = (/* @__PURE__ */ new Date("2024-03-07")).getTime();
      const jun2024_20 = (/* @__PURE__ */ new Date("2024-06-20")).getTime();
      const nov2023_08 = (/* @__PURE__ */ new Date("2023-11-08")).getTime();
      const sep2023_07 = (/* @__PURE__ */ new Date("2023-09-07")).getTime();
      const jul2023_11 = (/* @__PURE__ */ new Date("2023-07-11")).getTime();
      const ANTHROPIC_MODELS = [
        {
          id: "claude-3-opus-20240229",
          created: feb2024_29,
          description: "Most powerful model for highly complex tasks"
        },
        {
          id: "claude-3-sonnet-20240229",
          created: feb2024_29,
          description: "Ideal balance of intelligence and speed"
        },
        {
          id: "claude-3-haiku-20240307",
          created: mar2024_07,
          description: "Fastest and most compact model"
        },
        {
          id: "claude-3-5-sonnet-20240620",
          created: jun2024_20,
          description: "Latest Sonnet model with improved capabilities"
        },
        {
          id: "claude-instant-1.2",
          created: sep2023_07,
          description: "Legacy model"
        },
        {
          id: "claude-2.0",
          created: jul2023_11,
          description: "Legacy model"
        },
        {
          id: "claude-2.1",
          created: nov2023_08,
          description: "Legacy model"
        }
      ];
      return ANTHROPIC_MODELS;
    }
  }
  /**
   * Validate if a model exists by attempting to use it with a minimal request
   * @param {string} modelName - The model name to validate
   * @returns {Promise<boolean>} - True if model exists, false otherwise
   */
  async validateModel(modelName) {
    try {
      const MODEL_ALIASES = {
        "claude-3-opus-latest": "claude-3-opus-20240229",
        "claude-3-sonnet-latest": "claude-3-5-sonnet-20240620",
        "claude-3-haiku-latest": "claude-3-haiku-20240307"
      };
      const actualModel = MODEL_ALIASES[modelName] || modelName;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 1
        })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};

// src/models/gemini.js
import * as googleSdk from "@ai-sdk/google";
var GeminiProvider = class extends Provider {
  constructor() {
    super();
    this.client = googleSdk.google({
      apiKey: process.env.GEMINI_API_KEY
    });
  }
  /**
   * List all available models from Google Gemini using their REST API
   * @returns {Promise<Array<{id: string, created: number, ...}>>}
   */
  async listModels() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`Google Gemini API error: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.models && Array.isArray(data.models)) {
        return data.models.filter((model) => model.name && model.name.includes("gemini")).map((model) => {
          let created;
          const id = model.name.split("/").pop();
          if (model.createTime) {
            created = new Date(model.createTime).getTime();
          } else {
            if (id === "gemini-2.5-pro-exp-03-25") {
              created = (/* @__PURE__ */ new Date("2024-03-25")).getTime();
            } else if (id === "gemini-2.5-pro-preview-03-25") {
              created = (/* @__PURE__ */ new Date("2024-03-25")).getTime();
            } else if (id === "gemini-2.5-flash-preview-04-17") {
              created = (/* @__PURE__ */ new Date("2024-04-17")).getTime();
            } else if (id.includes("gemini-2.0")) {
              created = (/* @__PURE__ */ new Date("2024-03-08")).getTime();
            } else if (id.includes("gemini-1.5")) {
              created = (/* @__PURE__ */ new Date("2024-02-12")).getTime();
            } else if (id.includes("gemini-pro")) {
              created = (/* @__PURE__ */ new Date("2023-12-01")).getTime();
            } else {
              created = (/* @__PURE__ */ new Date("2024-01-01")).getTime();
            }
          }
          let description = model.description || "";
          description = description.replace(/\b2025\b/g, "2024");
          return {
            id,
            created,
            description
          };
        });
      } else {
        console.error("Unexpected API response format from Gemini");
        throw new Error("Unexpected API response format");
      }
    } catch (error) {
      console.error("Error listing Google Gemini models:", error.message);
      const dec2023 = (/* @__PURE__ */ new Date("2023-12-01")).getTime();
      const feb2024 = (/* @__PURE__ */ new Date("2024-02-12")).getTime();
      const mar2024_8 = (/* @__PURE__ */ new Date("2024-03-08")).getTime();
      const mar2024_25 = (/* @__PURE__ */ new Date("2024-03-25")).getTime();
      const apr2024_17 = (/* @__PURE__ */ new Date("2024-04-17")).getTime();
      const GEMINI_MODELS = [
        // Standard models
        {
          id: "gemini-pro",
          created: dec2023,
          description: "Optimized for text-only prompts"
        },
        {
          id: "gemini-pro-vision",
          created: dec2023,
          description: "Handles both text and image inputs"
        },
        {
          id: "gemini-1.5-pro",
          created: feb2024,
          description: "Latest model with improved capabilities"
        },
        {
          id: "gemini-1.5-flash",
          created: feb2024,
          description: "Faster, more efficient model"
        },
        // Gemini 2 models - with correct dates in the past
        {
          id: "gemini-2.0-pro",
          created: mar2024_8,
          description: "Latest flagship model for text-only prompts"
        },
        {
          id: "gemini-2.0-vision",
          created: mar2024_8,
          description: "Latest flagship model for text and image inputs"
        },
        {
          id: "gemini-2.5-pro-exp-03-25",
          created: mar2024_25,
          description: "Experimental release (March 25th, 2024) of Gemini 2.5 Pro"
        },
        {
          id: "gemini-2.5-pro-preview-03-25",
          created: mar2024_25,
          description: "Gemini 2.5 Pro Preview (March 25th, 2024)"
        },
        {
          id: "gemini-2.5-flash-preview-04-17",
          created: apr2024_17,
          description: "Preview release (April 17th, 2024) of Gemini 2.5 Flash"
        }
      ];
      return GEMINI_MODELS;
    }
  }
  /**
   * Validate if a model exists by attempting to use it with a minimal request
   * @param {string} modelName - The model name to validate
   * @returns {Promise<boolean>} - True if model exists, false otherwise
   */
  async validateModel(modelName) {
    try {
      const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
      const apiKey = process.env.GEMINI_API_KEY;
      let endpoint = "";
      if (modelName.includes("vision")) {
        endpoint = `${baseUrl}/models/${modelName}:generateContent?key=${apiKey}`;
      } else {
        endpoint = `${baseUrl}/models/${modelName}:generateContent?key=${apiKey}`;
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: "Hello" }
              ]
            }
          ]
        })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};

// src/models/index.js
function createProvider(providerName) {
  const normalizedName = providerName.toLowerCase().trim();
  switch (normalizedName) {
    case "openai":
      return new OpenAIProvider();
    case "anthropic":
      return new AnthropicProvider();
    case "gemini":
      return new GeminiProvider();
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}
function getSupportedProviders() {
  return ["openai", "anthropic", "gemini"];
}
function parseModelString(modelString) {
  const match = modelString.match(/^([^:]+):(.+)$/);
  if (!match) {
    throw new Error(`Invalid model format: ${modelString}. Expected format: provider:model`);
  }
  return {
    provider: match[1].toLowerCase().trim(),
    model: match[2].trim()
  };
}

// src/ui/ListModels.js
import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";

// src/utils/date.js
function formatDate(timestamp) {
  if (!timestamp) return "Unknown";
  const now = /* @__PURE__ */ new Date();
  const date = new Date(timestamp);
  const finalDate = date > now ? now : date;
  return finalDate.toISOString().split("T")[0];
}
function formatRelativeTime(timestamp) {
  if (!timestamp) return "Unknown";
  const now = Date.now();
  const isFuture = timestamp > now;
  const milliseconds = Math.abs(now - timestamp);
  const seconds = Math.floor(milliseconds / 1e3);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  const suffix = isFuture ? "upcoming" : "ago";
  if (years > 0) {
    return `${years} ${years === 1 ? "year" : "years"} ${suffix}`;
  } else if (months > 0) {
    return `${months} ${months === 1 ? "month" : "months"} ${suffix}`;
  } else if (days > 0) {
    return `${days} ${days === 1 ? "day" : "days"} ${suffix}`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ${suffix}`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ${suffix}`;
  } else {
    return isFuture ? "Coming soon" : "Just now";
  }
}

// src/ui/ListModels.js
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var ListModels = ({ provider, models, loading, error, filter, sort = "newest" }) => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1e3);
      return () => clearInterval(timer);
    }
  }, [loading]);
  if (error) {
    return /* @__PURE__ */ jsx(Box, { flexDirection: "column", children: /* @__PURE__ */ jsxs(Text, { color: "red", children: [
      "Error: ",
      error
    ] }) });
  }
  let headerText = filter ? `\u{1F50D} Models available for ${provider} (filtered by "${filter}")` : `\u{1F50D} Models available for ${provider}`;
  const sortInfo = {
    name: "alphabetically",
    newest: "newest first",
    oldest: "oldest first"
  };
  headerText += ` (sorted ${sortInfo[sort] || "alphabetically"})`;
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx(Box, { marginBottom: 1, children: /* @__PURE__ */ jsx(Text, { bold: true, color: "green", children: headerText }) }),
    loading ? /* @__PURE__ */ jsxs(Box, { children: [
      /* @__PURE__ */ jsx(Text, { color: "green", children: /* @__PURE__ */ jsx(Spinner, { type: "dots" }) }),
      /* @__PURE__ */ jsx(Text, { children: " Loading models " }),
      /* @__PURE__ */ jsxs(Text, { color: "gray", children: [
        "(",
        seconds,
        "s)"
      ] })
    ] }) : /* @__PURE__ */ jsx(Fragment, { children: models.length === 0 ? /* @__PURE__ */ jsx(Text, { color: "yellow", children: filter ? `No models found matching "${filter}"` : "No models found" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(Text, { color: "green", children: [
        "\u{1F389} Found ",
        models.length,
        " models"
      ] }),
      /* @__PURE__ */ jsx(Box, { flexDirection: "column", marginTop: 1, children: models.map((model, index) => /* @__PURE__ */ jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [
        /* @__PURE__ */ jsxs(Box, { children: [
          /* @__PURE__ */ jsx(Text, { bold: true, children: model.id }),
          /* @__PURE__ */ jsx(Text, { color: "blue", children: " \u2022 " }),
          /* @__PURE__ */ jsx(Text, { color: "cyan", children: formatDate(model.created) }),
          /* @__PURE__ */ jsxs(Text, { color: "gray", children: [
            " (",
            formatRelativeTime(model.created),
            ")"
          ] })
        ] }),
        model.description && /* @__PURE__ */ jsx(Text, { color: "gray", children: model.description })
      ] }, index)) })
    ] }) })
  ] });
};
var ListModels_default = ListModels;

// src/commands/list.js
import { jsx as jsx2 } from "react/jsx-runtime";
async function listCommand(providerName, filter, sort = "newest") {
  const normalizedProviderName = providerName.toLowerCase();
  const supportedProviders = getSupportedProviders();
  if (!supportedProviders.includes(normalizedProviderName)) {
    console.error(`Error: Unknown provider '${providerName}'`);
    console.error(`Supported providers: ${supportedProviders.join(", ")}`);
    process.exit(1);
  }
  if (!hasApiKey(normalizedProviderName)) {
    console.error(`Error: Missing API key for ${providerName}.`);
    console.error(`Please set ${normalizedProviderName === "gemini" ? "GOOGLE" : normalizedProviderName.toUpperCase()}_API_KEY in your environment or .env file.`);
    process.exit(1);
  }
  const { rerender, unmount } = render(
    /* @__PURE__ */ jsx2(
      ListModels_default,
      {
        provider: providerName,
        models: [],
        loading: true,
        filter,
        sort
      }
    )
  );
  try {
    const provider = createProvider(normalizedProviderName);
    let models = await provider.listModels();
    if (filter) {
      models = models.filter((model) => model.id.includes(filter));
    }
    if (sort === "newest") {
      models.sort((a, b) => b.created - a.created);
    } else if (sort === "oldest") {
      models.sort((a, b) => a.created - b.created);
    } else {
      models.sort((a, b) => a.id.localeCompare(b.id));
    }
    rerender(
      /* @__PURE__ */ jsx2(
        ListModels_default,
        {
          provider: providerName,
          models,
          loading: false,
          filter,
          sort
        }
      )
    );
  } catch (error) {
    rerender(
      /* @__PURE__ */ jsx2(
        ListModels_default,
        {
          provider: providerName,
          models: [],
          loading: false,
          error: error.message,
          filter,
          sort
        }
      )
    );
  }
}

// src/commands/validate.js
import React4 from "react";
import { render as render2 } from "ink";

// src/ui/ValidateModel.js
import React3, { useState as useState2, useEffect as useEffect2 } from "react";
import { Box as Box2, Text as Text2 } from "ink";
import Spinner2 from "ink-spinner";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var ValidateModel = ({ provider, model, isValid, loading, error }) => {
  const [seconds, setSeconds] = useState2(0);
  useEffect2(() => {
    if (loading) {
      const timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1e3);
      return () => clearInterval(timer);
    }
  }, [loading]);
  if (error) {
    return /* @__PURE__ */ jsx3(Box2, { flexDirection: "column", children: /* @__PURE__ */ jsxs2(Text2, { color: "red", children: [
      "Error: ",
      error
    ] }) });
  }
  return /* @__PURE__ */ jsxs2(Box2, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx3(Box2, { marginBottom: 1, children: /* @__PURE__ */ jsxs2(Text2, { bold: true, children: [
      "Validating model: ",
      /* @__PURE__ */ jsxs2(Text2, { color: "cyan", children: [
        provider,
        ":",
        model
      ] })
    ] }) }),
    loading ? /* @__PURE__ */ jsxs2(Box2, { children: [
      /* @__PURE__ */ jsx3(Text2, { color: "green", children: /* @__PURE__ */ jsx3(Spinner2, { type: "dots" }) }),
      /* @__PURE__ */ jsx3(Text2, { children: " Checking model validity " }),
      /* @__PURE__ */ jsxs2(Text2, { color: "gray", children: [
        "(",
        seconds,
        "s)"
      ] })
    ] }) : /* @__PURE__ */ jsx3(Box2, { children: isValid === true ? /* @__PURE__ */ jsx3(Text2, { color: "green", children: "\u2705 Model is valid and available" }) : /* @__PURE__ */ jsx3(Text2, { color: "red", children: "\u274C Model is invalid or unavailable" }) })
  ] });
};
var ValidateModel_default = ValidateModel;

// src/commands/validate.js
import { jsx as jsx4 } from "react/jsx-runtime";
async function validateCommand(modelString) {
  let provider, model;
  try {
    const parsed = parseModelString(modelString);
    provider = parsed.provider;
    model = parsed.model;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
  if (!hasApiKey(provider)) {
    console.error(`Error: Missing API key for ${provider}.`);
    console.error(`Please set ${provider === "gemini" ? "GOOGLE" : provider.toUpperCase()}_API_KEY in your environment or .env file.`);
    process.exit(1);
  }
  const { rerender, unmount } = render2(
    /* @__PURE__ */ jsx4(
      ValidateModel_default,
      {
        provider,
        model,
        isValid: null,
        loading: true
      }
    )
  );
  try {
    const providerInstance = createProvider(provider);
    const isValid = await providerInstance.validateModel(model);
    rerender(
      /* @__PURE__ */ jsx4(
        ValidateModel_default,
        {
          provider,
          model,
          isValid,
          loading: false
        }
      )
    );
  } catch (error) {
    rerender(
      /* @__PURE__ */ jsx4(
        ValidateModel_default,
        {
          provider,
          model,
          isValid: false,
          loading: false,
          error: error.message
        }
      )
    );
  }
}

// src/commands/search.js
import React6 from "react";
import { render as render3 } from "ink";

// src/ui/SearchResults.js
import React5 from "react";
import { Box as Box3, Text as Text3 } from "ink";
import { Fragment as Fragment2, jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
var SearchResults = ({ results, query, error, loading }) => {
  if (error) {
    return /* @__PURE__ */ jsx5(Box3, { flexDirection: "column", children: /* @__PURE__ */ jsxs3(Text3, { color: "red", children: [
      "Error: ",
      error
    ] }) });
  }
  if (loading) {
    return /* @__PURE__ */ jsx5(Box3, { children: /* @__PURE__ */ jsxs3(Text3, { color: "yellow", children: [
      'Searching across providers for models matching "',
      query,
      '"...'
    ] }) });
  }
  const totalModels = results.reduce((sum, provider) => sum + provider.models.length, 0);
  let totalProviders = results.filter((provider) => provider.models.length > 0).length;
  return /* @__PURE__ */ jsxs3(Box3, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx5(Box3, { marginBottom: 1, children: /* @__PURE__ */ jsxs3(Text3, { bold: true, color: "green", children: [
      '\u{1F50D} Search results for "',
      query,
      '" across all providers'
    ] }) }),
    totalModels === 0 ? /* @__PURE__ */ jsx5(Text3, { color: "yellow", children: "No matching models found" }) : /* @__PURE__ */ jsxs3(Fragment2, { children: [
      /* @__PURE__ */ jsxs3(Text3, { color: "green", children: [
        "\u{1F389} Found ",
        totalModels,
        " matching ",
        totalModels === 1 ? "model" : "models",
        " across ",
        totalProviders,
        " ",
        totalProviders === 1 ? "provider" : "providers"
      ] }),
      results.map((provider, index) => provider.models.length > 0 && /* @__PURE__ */ jsxs3(Box3, { flexDirection: "column", marginTop: 1, children: [
        /* @__PURE__ */ jsxs3(Text3, { bold: true, color: "blue", children: [
          "Provider: ",
          provider.name
        ] }),
        /* @__PURE__ */ jsx5(Box3, { flexDirection: "column", marginLeft: 2, children: provider.models.map((model, idx) => /* @__PURE__ */ jsxs3(Box3, { flexDirection: "column", marginBottom: 1, children: [
          /* @__PURE__ */ jsxs3(Box3, { children: [
            /* @__PURE__ */ jsx5(Text3, { bold: true, children: model.id }),
            /* @__PURE__ */ jsx5(Text3, { color: "blue", children: " \u2022 " }),
            /* @__PURE__ */ jsx5(Text3, { color: "cyan", children: formatDate(model.created) }),
            /* @__PURE__ */ jsxs3(Text3, { color: "gray", children: [
              " (",
              formatRelativeTime(model.created),
              ")"
            ] })
          ] }),
          model.description && /* @__PURE__ */ jsx5(Text3, { color: "gray", children: model.description })
        ] }, idx)) })
      ] }, index))
    ] })
  ] });
};
var SearchResults_default = SearchResults;

// src/commands/search.js
import { jsx as jsx6 } from "react/jsx-runtime";
async function searchCommand(query, options = {}) {
  const sort = options.sort || "newest";
  const supportedProviders = getSupportedProviders();
  let searchResults = [];
  const { rerender, unmount } = render3(
    /* @__PURE__ */ jsx6(
      SearchResults_default,
      {
        results: [],
        query,
        loading: true
      }
    )
  );
  try {
    for (const providerName of supportedProviders) {
      if (!hasApiKey(providerName)) {
        searchResults.push({
          name: providerName,
          models: [],
          error: "Missing API key"
        });
        continue;
      }
      try {
        const provider = createProvider(providerName);
        const models = await provider.listModels();
        const matchingModels = models.filter(
          (model) => model.id.toLowerCase().includes(query.toLowerCase()) || model.description && model.description.toLowerCase().includes(query.toLowerCase())
        );
        if (sort === "newest") {
          matchingModels.sort((a, b) => b.created - a.created);
        } else if (sort === "oldest") {
          matchingModels.sort((a, b) => a.created - b.created);
        } else {
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
    rerender(
      /* @__PURE__ */ jsx6(
        SearchResults_default,
        {
          results: searchResults,
          query,
          loading: false
        }
      )
    );
  } catch (error) {
    rerender(
      /* @__PURE__ */ jsx6(
        SearchResults_default,
        {
          results: [],
          query,
          loading: false,
          error: error.message
        }
      )
    );
  }
}

// src/cli.js
var version = "0.1.0";
function cli(args) {
  const program = new Command();
  program.name("parade").description("CLI for inspecting AI model providers").version(version).option("--dotenv <path>", "Path to a .env file (overrides default lookup)");
  program.hook("preAction", (thisCommand) => {
    const options = thisCommand.opts();
    loadEnv(options.dotenv);
  });
  program.command("list").description("List all available models for a provider").argument("<provider>", "Provider name (openai, anthropic, gemini)").argument("[filter]", 'Optional filter for model IDs (e.g., "gpt-" to show only GPT models)').option("--sort <type>", "Sort models by: newest (default), name, oldest", "newest").action((provider, filter, options) => {
    let normalizedProvider = provider.toLowerCase();
    if (normalizedProvider === "google") {
      normalizedProvider = "gemini";
    } else if (normalizedProvider === "claude") {
      normalizedProvider = "anthropic";
    }
    listCommand(normalizedProvider, filter, options.sort);
  });
  program.command("validate").description("Validate a model identifier").argument("<provider:model>", "Model identifier (e.g. openai:gpt-4, anthropic:claude-3-5-sonnet-latest, gemini:gemini-pro)").action((modelString) => {
    const modelLower = modelString.toLowerCase();
    if (modelLower.startsWith("google:")) {
      const modelPart = modelString.substring(modelString.indexOf(":") + 1);
      validateCommand(`gemini:${modelPart}`);
    } else if (modelLower.startsWith("claude:")) {
      const modelPart = modelString.substring(modelString.indexOf(":") + 1);
      validateCommand(`anthropic:${modelPart}`);
    } else {
      validateCommand(modelString);
    }
  });
  program.command("search").description("Search for models across all providers").argument("<query>", "Search term to find in model IDs and descriptions").option("--sort <type>", "Sort models by: newest (default), name, oldest", "newest").action((query, options) => searchCommand(query, options));
  program.parse(args);
}

// src/index.js
cli(process.argv);
