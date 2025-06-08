#!/usr/bin/env node

import { Command } from 'commander';
import { checkCommand } from './commands/check';

const program = new Command();

program
  .name('tsenv')
  .description('Type-check environment variables against TypeScript schemas')
  .version('0.1.0');

program
  .command('check')
  .description('Check environment files against TypeScript schema')
  .option('-c, --config <path>', 'path to config file', './tsenv.config.ts')
  .action(checkCommand);

program.parse();