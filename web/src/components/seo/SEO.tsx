import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  type?: 'website' | 'article';
}

/**
 * SEO component for managing page metadata
 * Uses react-helmet-async for SSR-compatible meta tags
 */
export function SEO({
  title,
  description,
  path,
  ogImage,
  type = 'website',
}: SEOProps) {
  const fullTitle = `${title} | Dashforge-UI`;
  const canonicalUrl = `https://dashforge-ui.com${path}`;
  const defaultOgImage = 'https://dashforge-ui.com/icons/icon-512x512.png';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage || defaultOgImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />

      {/* Plausible Analytics */}
      <script
        defer
        data-domain="dashforge-ui.com"
        src="https://plausible.io/js/script.js"
      ></script>
    </Helmet>
  );
}
