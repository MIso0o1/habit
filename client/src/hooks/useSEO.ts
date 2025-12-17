import { useEffect } from 'react';
import { updatePageMetadata, pageMetadata, SEOMetadata } from '@/lib/seo';

/**
 * Hook to update page metadata on component mount
 * @param page - The page key from pageMetadata
 * @param customMetadata - Optional custom metadata to override defaults
 */
export function useSEO(page: keyof typeof pageMetadata, customMetadata?: Partial<SEOMetadata>): void {
  useEffect(() => {
    const metadata = {
      ...pageMetadata[page],
      ...customMetadata
    };
    updatePageMetadata(metadata);
  }, [page, customMetadata]);
}
