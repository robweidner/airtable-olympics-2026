/**
 * PostHog analytics for Fantasy Olympics.
 *
 * Configured for Airtable's iframe sandbox:
 * - memory persistence (cross-origin storage is unreliable)
 * - no autocapture (CSS selectors are meaningless inside iframe)
 * - manual page views (window.location is the iframe URL, not useful)
 */
import posthog from 'posthog-js';

// Replace with your PostHog project API key
const POSTHOG_KEY = '__POSTHOG_API_KEY__';
const POSTHOG_HOST = 'https://us.i.posthog.com';

let initialized = false;

export function initAnalytics() {
  if (initialized || POSTHOG_KEY === '__POSTHOG_API_KEY__') return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    persistence: 'memory',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    loaded: () => { initialized = true; },
  });
}

export function identifyUser(airtableUser, playerInfo) {
  if (!initialized) return;
  const id = airtableUser.email || airtableUser.id;
  posthog.identify(id, {
    name: airtableUser.name,
    email: airtableUser.email,
    ...(playerInfo && {
      player_display_name: playerInfo.displayName,
      player_total_score: playerInfo.totalScore,
    }),
  });
}

export function track(event, properties) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function trackPageView(pageName) {
  track('$pageview', { page: pageName });
}
