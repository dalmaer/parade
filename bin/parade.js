#!/usr/bin/env node

// This simple entry point enables us to use the bundled version
import { cli } from '../dist/parade.js';

// Execute the CLI
cli(process.argv);