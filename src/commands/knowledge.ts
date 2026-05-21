import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import { DifyClient } from '../api/client';
import { KnowledgeAPI } from '../api/knowledge';
import { formatOutput } from '../utils/output';

function buildProcessRule(options: Record<string, any>): Record<string, any> | undefined {
  if (!options.processRuleMode) return undefined;
  const processRule: Record<string, any> = { mode: options.processRuleMode };
  if (options.processRuleMode === 'custom') {
    const rules: Record<string, any> = {};
    const preProcessingRules: { id: string; enabled: boolean }[] = [];
    if (options.removeExtraSpaces !== undefined) {
      preProcessingRules.push({ id: 'remove_extra_spaces', enabled: options.removeExtraSpaces });
    }
    if (options.removeUrlsEmails !== undefined) {
      preProcessingRules.push({ id: 'remove_urls_emails', enabled: options.removeUrlsEmails });
    }
    if (preProcessingRules.length > 0) {
      rules.pre_processing_rules = preProcessingRules;
    }
    const segmentation: Record<string, any> = {};
    if (options.separator !== undefined) segmentation.separator = options.separator;
    if (options.maxTokens !== undefined) segmentation.max_tokens = options.maxTokens;
    if (options.overlap !== undefined) segmentation.chunk_overlap = options.overlap;
    if (Object.keys(segmentation).length > 0) {
      rules.segmentation = segmentation;
    }
    if (Object.keys(rules).length > 0) {
      processRule.rules = rules;
    }
  }
  return processRule;
}

export function registerKnowledgeCommands(program: Command): void {
  const knowledge = program.command('knowledge').description('Knowledge base management').alias('kb');

  knowledge
    .command('list')
    .description('List knowledge bases')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Items per page')
    .option('--keyword <text>', 'Search keyword')
    .action(async (options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new KnowledgeAPI(client);
      try {
        const result = await api.listDatasets({
          page: options.page ? Number(options.page) : undefined,
          limit: options.limit ? Number(options.limit) : undefined,
          keyword: options.keyword,
        });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  knowledge
    .command('create <name>')
    .description('Create a knowledge base')
    .option('--description <text>', 'Description')
    .option('--indexing-technique <technique>', 'Indexing technique: high_quality or economy')
    .option('--permission <perm>', 'Permission: only_me or all_team_members')
    .action(async (name: string, options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new KnowledgeAPI(client);
      try {
        const result = await api.createDataset({
          name,
          description: options.description,
          indexing_technique: options.indexingTechnique,
          permission: options.permission,
        });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  knowledge
    .command('get <dataset_id>')
    .description('Get knowledge base details')
    .action(async (datasetId: string, _options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new KnowledgeAPI(client);
      try {
        const result = await api.getDataset(datasetId);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  knowledge
    .command('update <dataset_id>')
    .description('Update a knowledge base')
    .option('--name <text>', 'New name')
    .option('--description <text>', 'New description')
    .action(async (datasetId: string, options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new KnowledgeAPI(client);
      try {
        const result = await api.updateDataset(datasetId, {
          name: options.name,
          description: options.description,
        });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  knowledge
    .command('delete <dataset_id>')
    .description('Delete a knowledge base')
    .action(async (datasetId: string, _options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new KnowledgeAPI(client);
      try {
        const result = await api.deleteDataset(datasetId);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  const doc = knowledge.command('document').description('Document operations');

  doc
    .command('list <dataset_id>')
    .description('List documents in a knowledge base')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Items per page')
    .option('--keyword <text>', 'Search keyword')
    .action(async (datasetId: string, options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new KnowledgeAPI(client);
      try {
        const result = await api.listDocuments(datasetId, {
          page: options.page ? Number(options.page) : undefined,
          limit: options.limit ? Number(options.limit) : undefined,
          keyword: options.keyword,
        });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  doc
    .command('create-text <dataset_id>')
    .description('Create a document from text content')
    .requiredOption('--name <text>', 'Document name')
    .requiredOption('--text <content>', 'Document text content')
    .option('--doc-type <type>', 'Document type')
    .option('--indexing-technique <technique>', 'Indexing technique (high_quality, economy)')
    .option('--doc-form <form>', 'Document form (text_model, qa_model)')
    .option('--doc-language <lang>', 'Document language')
    .option('--process-rule-mode <mode>', 'Process rule mode (automatic, custom, hierarchical)')
    .option('--separator <sep>', 'Chunk separator (e.g., "\\\\n")')
    .option('--max-tokens <n>', 'Max tokens per chunk', parseInt)
    .option('--overlap <n>', 'Chunk overlap', parseInt)
    .option('--remove-extra-spaces', 'Remove extra spaces (pre-processing)')
    .option('--remove-urls-emails', 'Remove URLs and email addresses (pre-processing)')
    .action(async (datasetId: string, options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new KnowledgeAPI(client);
      try {
        const params: Record<string, any> = {
          name: options.name,
          text: options.text,
          doc_type: options.docType,
          indexing_technique: options.indexingTechnique,
          doc_form: options.docForm,
          doc_language: options.docLanguage,
        };
        const processRule = buildProcessRule(options);
        if (processRule) params.process_rule = processRule;
        const result = await api.createDocumentByText(datasetId, params as any);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  doc
    .command('create-file <dataset_id>')
    .description('Create a document from a file')
    .requiredOption('--file <path>', 'File path')
    .option('--name <text>', 'Document name (defaults to filename)')
    .option('--indexing-technique <technique>', 'Indexing technique (high_quality, economy)')
    .option('--doc-form <form>', 'Document form (text_model, qa_model)')
    .option('--doc-language <lang>', 'Document language')
    .option('--process-rule-mode <mode>', 'Process rule mode (automatic, custom, hierarchical)')
    .option('--separator <sep>', 'Chunk separator (e.g., "\\\\n")')
    .option('--max-tokens <n>', 'Max tokens per chunk', parseInt)
    .option('--overlap <n>', 'Chunk overlap', parseInt)
    .option('--remove-extra-spaces', 'Remove extra spaces (pre-processing)')
    .option('--remove-urls-emails', 'Remove URLs and email addresses (pre-processing)')
    .action(async (datasetId: string, options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new KnowledgeAPI(client);
      try {
        const filePath = options.file;
        const fileName = options.name || path.basename(filePath);
        const buffer = await fs.promises.readFile(filePath);
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const formData = new FormData();
        formData.append('file', blob, fileName);
        const data: Record<string, any> = {};
        if (options.indexingTechnique) data.indexing_technique = options.indexingTechnique;
        if (options.docForm) data.doc_form = options.docForm;
        if (options.docLanguage) data.doc_language = options.docLanguage;
        const processRule = buildProcessRule(options);
        if (processRule) data.process_rule = processRule;
        if (Object.keys(data).length > 0) {
          formData.append('data', JSON.stringify(data));
        }
        formData.append('name', fileName);
        const result = await api.createDocumentByFile(datasetId, formData);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  doc
    .command('get <dataset_id> <document_id>')
    .description('Get document details')
    .action(async (datasetId: string, documentId: string, _options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new KnowledgeAPI(client);
      try {
        const result = await api.getDocument(datasetId, documentId);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  doc
    .command('delete <dataset_id> <document_id>')
    .description('Delete a document')
    .action(async (datasetId: string, documentId: string, _options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new KnowledgeAPI(client);
      try {
        const result = await api.deleteDocument(datasetId, documentId);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  doc
    .command('status <dataset_id> <batch>')
    .description('Get document indexing status')
    .action(async (datasetId: string, batch: string, _options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new KnowledgeAPI(client);
      try {
        const result = await api.getIndexingStatus(datasetId, batch);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  const segment = knowledge.command('segment').description('Segment (chunk) operations');

  segment
    .command('list <dataset_id> <document_id>')
    .description('List segments in a document')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Items per page')
    .option('--keyword <text>', 'Search keyword')
    .option('--status <status>', 'Filter by status')
    .action(async (datasetId: string, documentId: string, options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new KnowledgeAPI(client);
      try {
        const result = await api.listSegments(datasetId, documentId, {
          page: options.page ? Number(options.page) : undefined,
          limit: options.limit ? Number(options.limit) : undefined,
          keyword: options.keyword,
          status: options.status,
        });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  segment
    .command('create <dataset_id> <document_id>')
    .description('Create a segment')
    .requiredOption('--content <text>', 'Segment content')
    .option('--keywords <json>', 'Keywords as JSON array')
    .action(async (datasetId: string, documentId: string, options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new KnowledgeAPI(client);
      try {
        const result = await api.createSegment(datasetId, documentId, {
          content: options.content,
          keywords: options.keywords ? JSON.parse(options.keywords) : undefined,
        });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  segment
    .command('update <dataset_id> <document_id> <segment_id>')
    .description('Update a segment')
    .requiredOption('--content <text>', 'Segment content')
    .option('--keywords <json>', 'Keywords as JSON array')
    .action(async (datasetId: string, documentId: string, segmentId: string, options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new KnowledgeAPI(client);
      try {
        const result = await api.updateSegment(datasetId, documentId, segmentId, {
          content: options.content,
          keywords: options.keywords ? JSON.parse(options.keywords) : undefined,
        });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  segment
    .command('delete <dataset_id> <document_id> <segment_id>')
    .description('Delete a segment')
    .action(async (datasetId: string, documentId: string, segmentId: string, _options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new KnowledgeAPI(client);
      try {
        const result = await api.deleteSegment(datasetId, documentId, segmentId);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });
}
