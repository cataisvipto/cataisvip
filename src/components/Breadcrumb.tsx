'use client';

import { Link } from '@/i18n/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { BASE_URL, generateBreadcrumbJsonLd } from '@/lib/seo';

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  locale: string;
}

export default function Breadcrumb({ items, locale }: BreadcrumbProps) {
  // Build full items for JSON-LD (with absolute URLs)
  const jsonLdItems = [
    { name: 'Home', url: `${BASE_URL}/${locale}` },
    ...items.map((item) =>
      item.href
        ? { name: item.name, url: `${BASE_URL}/${locale}${item.href}` }
        : { name: item.name }
    ),
  ];

  const jsonLd = generateBreadcrumbJsonLd(jsonLdItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <li>
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-indigo-600 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-indigo-600 transition"
                >
                  {item.name}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
