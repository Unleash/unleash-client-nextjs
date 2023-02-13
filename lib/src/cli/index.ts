#!/usr/bin/env node

import { createProgram } from "./createProgram";
import { getDefinitions } from "./commands/getDefinitions";
import { generateTypes } from "./commands/generateTypes";

const program = createProgram();

getDefinitions(program);
generateTypes(program);

program.parse(process.argv);
