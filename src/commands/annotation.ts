import { Command } from 'commander';
import { DifyClient } from '../api/client';
import { AnnotationAPI } from '../api/annotation';
import { formatOutput } from '../utils/output';

export function registerAnnotationCommands(program: Command): void {
  const annotation = program.command('annotation').description('Annotation management').alias('ann');

  annotation
    .command('create')
    .description('Create an annotation')
    .requiredOption('-q, --question <text>', 'Question text')
    .requiredOption('-a, --answer <text>', 'Answer text')
    .action(async (options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new AnnotationAPI(client);
      try {
        const result = await api.create({ question: options.question, answer: options.answer });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  annotation
    .command('list')
    .description('List annotations')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Items per page')
    .action(async (options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new AnnotationAPI(client);
      try {
        const result = await api.list({
          page: options.page ? Number(options.page) : undefined,
          limit: options.limit ? Number(options.limit) : undefined,
        });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  annotation
    .command('update <annotation_id>')
    .description('Update an annotation')
    .option('-q, --question <text>', 'Question text')
    .option('-a, --answer <text>', 'Answer text')
    .action(async (annotationId: string, options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new AnnotationAPI(client);
      try {
        const result = await api.update(annotationId, {
          question: options.question,
          answer: options.answer,
        });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  annotation
    .command('delete <annotation_id>')
    .description('Delete an annotation')
    .action(async (annotationId: string, _options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new AnnotationAPI(client);
      try {
        const result = await api.delete(annotationId);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  annotation
    .command('reply-config')
    .description('Get or update annotation reply config')
    .option('--update', 'Update the reply config')
    .option('--reply-type <type>', 'Reply type')
    .option('--score-threshold <n>', 'Score threshold')
    .action(async (options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new AnnotationAPI(client);
      try {
        if (options.update) {
          const result = await api.updateReplyConfig({
            reply_type: options.replyType,
            score_threshold: options.scoreThreshold ? Number(options.scoreThreshold) : 0,
          });
          console.log(formatOutput(result));
        } else {
          const result = await api.getReplyConfig();
          console.log(formatOutput(result));
        }
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });
}
