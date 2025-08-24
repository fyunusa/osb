#!/usr/bin/env node
import "reflect-metadata";
import { Command } from "commander";
import { generateCommand } from "./commands/generate";

const program = new Command();

program
  .name("osb")
  .description("OSB CLI - Open Scaffold Builder")
  .version("1.0.0");

// Register commands
generateCommand(program);

program.parse();
