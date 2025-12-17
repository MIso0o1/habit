/**
 * SEO Metadata and utilities for the application
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
}

const DEFAULT_SITE_URL = 'https://cherry-tree-viewer.example.com';

export const defaultMetadata: SEOMetadata = {
  title: 'Habit & Skill Tracker - Grow Your Tree',
  description: 'Track your habits and skills with an interactive 3D tree visualization. Watch your tree grow as you build better habits and develop new skills.',
  keywords: [
    'habit tracker',
    'skill development',
    'habit building',
    'productivity',
    '3D visualization',
    'tree growth',
    'personal development',
    'goal tracking'
  ],
  canonical: DEFAULT_SITE_URL,
  ogImage: `${DEFAULT_SITE_URL}/og-image.png`,
  ogType: 'website',
  twitterCard: 'summary_large_image'
};

export const pageMetadata: Record<string, SEOMetadata> = {
  home: {
    title: 'Habit & Skill Tracker - Grow Your Tree',
    description: 'Track your habits and skills with an interactive 3D tree visualization. Watch your tree grow as you build better habits and develop new skills.',
    keywords: ['habit tracker', 'skill development', 'productivity', '3D visualization'],
    canonical: DEFAULT_SITE_URL,
  },
  login: {
    title: 'Login - Habit & Skill Tracker',
    description: 'Sign in to your Habit & Skill Tracker account to access your dashboard and track your progress.',
    keywords: ['login', 'sign in', 'account access'],
    canonical: `${DEFAULT_SITE_URL}/login`,
  },
  register: {
    title: 'Register - Habit & Skill Tracker',
    description: 'Create a new account to start tracking your habits and skills with our interactive 3D tree visualization.',
    keywords: ['register', 'sign up', 'create account', 'join'],
    canonical: `${DEFAULT_SITE_URL}/register`,
  },
  forgotPassword: {
    title: 'Reset Password - Habit & Skill Tracker',
    description: 'Reset your password to regain access to your Habit & Skill Tracker account.',
    keywords: ['reset password', 'forgot password', 'account recovery'],
    canonical: `${DEFAULT_SITE_URL}/forgot-password`,
  },
  resetPassword: {
    title: 'Create New Password - Habit & Skill Tracker',
    description: 'Create a new password for your Habit & Skill Tracker account.',
    keywords: ['new password', 'password reset', 'account security'],
    canonical: `${DEFAULT_SITE_URL}/reset-password`,
  },
  dashboard: {
    title: 'Dashboard - Habit & Skill Tracker',
    description: 'View your progress, manage your habits, and watch your tree grow as you achieve your goals.',
    keywords: ['dashboard', 'progress tracking', 'habit management'],
    canonical: `${DEFAULT_SITE_URL}/dashboard`,
  },
  presentation: {
    title: 'Presentation - Habit & Skill Tracker',
    description: 'Learn more about how the Habit & Skill Tracker helps you build better habits and develop new skills.',
    keywords: ['presentation', 'features', 'how it works'],
    canonical: `${DEFAULT_SITE_URL}/presentation`,
  },
};

/**
 * Update the document head with SEO metadata
 */
export function updatePageMetadata(metadata: SEOMetadata): void {
  // Update title
  document.title = metadata.title;
  updateMetaTag('title', metadata.title);
  updateMetaTag('og:title', metadata.title);
  updateMetaTag('twitter:title', metadata.title);

  // Update description
  updateMetaTag('description', metadata.description);
  updateMetaTag('og:description', metadata.description);
  updateMetaTag('twitter:description', metadata.description);

  // Update keywords
  if (metadata.keywords) {
    updateMetaTag('keywords', metadata.keywords.join(', '));
  }

  // Update canonical URL
  if (metadata.canonical) {
    updateCanonicalLink(metadata.canonical);
  }

  // Update Open Graph image
  if (metadata.ogImage) {
    updateMetaTag('og:image', metadata.ogImage);
    updateMetaTag('twitter:image', metadata.ogImage);
  }

  // Update Open Graph type
  if (metadata.ogType) {
    updateMetaTag('og:type', metadata.ogType);
  }

  // Update Twitter card
  if (metadata.twitterCard) {
    updateMetaTag('twitter:card', metadata.twitterCard);
  }
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(name: string, content: string): void {
  let element = document.querySelector(`meta[name="${name}"]`) ||
                document.querySelector(`meta[property="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      element.setAttribute('property', name);
    } else {
      element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

/**
 * Update the canonical link
 */
function updateCanonicalLink(url: string): void {
  let link = document.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', url);
}

/**
 * Generate structured data for the current page
 */
export function generateStructuredData(type: string, data: Record<string, any>): void {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  });
  document.head.appendChild(script);
}
