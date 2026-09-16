import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { openapi } from './openapi';
import type { OperationOutput, WebhookOutput } from 'fumadocs-openapi';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// Hand-written MDX (content/docs/**) and the OpenAPI reference (virtual pages
// derived live from public/openapi/openapi.json, grouped by the spec's own
// tags - "Device Control" vs the "* (dashboard)" tags) are merged into one
// page tree here, so the Reference section is never hand-authored or
// copy-pasted: it's regenerated from the spec on every dev/build.
export const source = loader(
  {
    docs: docs.toFumadocsSource(),
    openapi: await openapi.staticSource({
      groupBy: 'tag',
      baseDir: 'reference',
      // Default naming mirrors the raw URL path segment-for-segment (every
      // endpoint starts with /api/v1/..., so the sidebar ends up nesting
      // Api > V1 > Devices > {deviceId} > ... for literally every operation -
      // redundant on every single page and it reads as unfinished/generic).
      // Flatten to one page per operation, named after its own summary
      // (already unique and descriptive - see backend/services/api-gateway/
      // src/openapi/paths/*.ts) instead of its path.
      name: (output: Omit<OperationOutput | WebhookOutput, 'path'>) => {
        const path = 'path' in output.item ? output.item.path : output.item.name;
        const title = output.info.title || `${output.item.method} ${path}`;
        return title
          .toLowerCase()
          .replace(/'/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      },
    }),
  },
  {
    baseUrl: docsRoute,
    plugins: [lucideIconsPlugin(), openapi.loaderPlugin()],
  },
);

export const docsLlms = llms(source, {
  renderPage: async (page) => {
    const data = page.data as { title: string; description?: string; getText?: (type: 'processed') => Promise<string> };
    const body =
      typeof data.getText === 'function'
        ? await data.getText('processed')
        : (data.description ?? '');
    return `# ${data.title} (${page.url})\n\n${body}`;
  },
});
