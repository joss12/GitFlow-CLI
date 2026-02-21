#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

import { Command } from "commander";
import { initCommand } from "./commands/init";
import { commitCommand } from "./commands/commit";
import { reviewCommand } from "./commands/review";
import { rebaseCommand } from "./commands/rebase";

const program = new Command();

program
  .name("gitflow")
  .description("Smart Git workflow automator")
  .version("1.0.0");

// Register commands
program.addCommand(initCommand);
program.addCommand(commitCommand);
program.addCommand(reviewCommand);
program.addCommand(rebaseCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
