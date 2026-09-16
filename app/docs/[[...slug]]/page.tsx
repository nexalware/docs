import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { OpenAPIPage } from '@/components/api-page';
import { Callout } from 'fumadocs-ui/components/callout';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getPageImageUrl, getPageMarkdownUrl, gitConfig } from '@/lib/shared';
import type { OperationObject, PathItemObject } from 'fumadocs-openapi';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  if (page.type === 'openapi') {
    const openApiProps = page.data.getOpenAPIPageProps();
    const bundled = 'payload' in openApiProps ? openApiProps.payload.bundled : undefined;
    const operations = openApiProps.operations ?? [];
    // Session tokens are now legitimately obtainable by a third party via
    // POST /auth/login (see paths/auth.ts) - so "requires sessionAuth" alone
    // no longer means "dashboard-only" (that used to be true when a session
    // token was only ever obtainable by logging into the web app itself).
    // The Authentication endpoints use that same scheme and are meant to be
    // used this way, so they're excluded by tag rather than by scheme.
    const dashboardOnly =
      operations.length > 0 &&
      operations.every((op) => {
        const pathItem = bundled?.paths?.[op.path] as PathItemObject | undefined;
        const operation = pathItem?.[op.method] as OperationObject | undefined;
        if (operation?.tags?.includes('Authentication')) return false;
        const schemes = new Set((operation?.security ?? []).flatMap((s: Record<string, unknown>) => Object.keys(s)));
        return schemes.has('sessionAuth') && !schemes.has('apiKeyAuth');
      });

    return (
      <DocsPage toc={page.data.toc} full>
        <DocsTitle>{page.data.title}</DocsTitle>
        {/* No <DocsDescription> here — it renders page.data.description as
            plain text, but OpenAPIPage below already renders the same
            operation description properly, as parsed markdown (so links
            and code spans work). Rendering both produced two copies of the
            same text, with the first one showing raw "[text](url)" syntax
            instead of a link. */}
        <DocsBody>
          {dashboardOnly && (
            <Callout type="warn" title="Dashboard-only">
              This mirrors what a human does from the Nexalware web app - it&apos;s not meant to
              be automated by a third-party integration, even though a session token from{' '}
              <a href="/docs/reference/authentication">Log in</a> can technically call it. If
              you&apos;re building an integration that controls devices, use an API key instead:
              have an Owner/Admin grant it access to a device (a <code>DeviceGrant</code>), and
              use the <a href="/docs/reference/device-control">Device Control</a> endpoints.
            </Callout>
          )}
          <OpenAPIPage {...openApiProps} />
        </DocsBody>
      </DocsPage>
    );
  }

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: page.type === 'openapi' ? undefined : getPageImageUrl(page).url,
    },
  };
}
