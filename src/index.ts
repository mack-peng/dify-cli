import { program } from 'commander';
import { decorateProgram } from './program';

decorateProgram(program);

program.parse(process.argv);
