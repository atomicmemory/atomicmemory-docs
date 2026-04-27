import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// OpenAPI spec is vendored into this repo under `vendor/` so the docs
// build stays self-contained. Refresh it by running
// `npm run vendor:spec` after core publishes a new version (see
// scripts/vendor-core-spec.mjs). Keeping the spec in-repo avoids the
// cross-repo release coupling that blocks CI and Pages deploys when
// the docs build has to reach into a sibling checkout.
const coreOpenapiYamlPath = resolve(
  __dirname,
  'vendor/atomicmemory-core-openapi.yaml',
);

const config: Config = {
  title: 'AtomicMemory',
  tagline: 'Standardized platform layer for AI memory — pluggable at every seam.',
  favicon: 'img/logo.svg',

  headTags: [
    {
      tagName: 'link',
      attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
  ],

  stylesheets: [
    'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700;800&family=Fira+Mono:wght@400;500;700&display=swap',
  ],

  future: {
    v4: true,
  },

  // Production URL — pointed at docs.atomicmemory.ai via CNAME
  url: 'https://docs.atomicmemory.ai',
  baseUrl: '/',

  // GitHub Pages deployment config
  organizationName: 'atomicmemory',
  projectName: 'atomicmemory-docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  themes: ['@docusaurus/theme-mermaid', 'docusaurus-theme-openapi-docs'],

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          { from: '/api-reference/sdk/coming-soon', to: '/sdk/overview' },
        ],
      },
    ],
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'openapi',
        docsPluginId: 'classic',
        config: {
          atomicmemory: {
            // Source-of-truth is @atomicmemory/atomicmemory-core's
            // shipped openapi.yaml — regenerated from Zod schemas on
            // every core publish.
            specPath: coreOpenapiYamlPath,
            outputDir: 'docs/api-reference/http',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          },
        },
      },
    ],
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/atomicmemory/atomicmemory-docs/edit/main/',
          // Required by docusaurus-plugin-openapi-docs so the generated
          // .mdx pages can use the `api` doc type for its request /
          // response renderers.
          docItemComponent: '@theme/ApiItem',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/logo-full.svg',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'AtomicMemory',
      logo: {
        alt: 'AtomicMemory Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'platformSidebar',
          position: 'left',
          label: 'Platform',
        },
        {
          type: 'docSidebar',
          sidebarId: 'sdkSidebar',
          position: 'left',
          label: 'SDK',
        },
        {
          type: 'docSidebar',
          sidebarId: 'integrationsSidebar',
          position: 'left',
          label: 'Integrations',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiReferenceSidebar',
          position: 'left',
          label: 'API Reference',
        },
        {
          href: 'https://github.com/atomicmemory/atomicmemory-core',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Introduction', to: '/' },
            { label: 'Quickstart', to: '/quickstart' },
            { label: 'SDK', to: '/sdk/overview' },
            { label: 'API Reference', to: '/api-reference/http/ingest-memory' },
          ],
        },
        {
          title: 'Code',
          items: [
            { label: 'atomicmemory-core', href: 'https://github.com/atomicmemory/atomicmemory-core' },
            { label: 'atomicmemory-sdk', href: 'https://github.com/atomicmemory/atomicmemory-sdk' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'GitHub', href: 'https://github.com/atomicmemory' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} AtomicMemory. Apache-2.0 licensed.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'sql'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
