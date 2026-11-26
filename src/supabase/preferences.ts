import type { UiPreferences } from './types.ts';

const UI_PREFS_KEY = 'smartq_ui_prefs_v1';

const DEFAULT_UI_PREFS: UiPreferences = {
  theme: 'light',
  language: 'en',
  voiceAnnouncements: false,
  browserNotificationsEnabled: false,
};

/**
 * LocalStorage is strictly restricted to harmless UI preferences
 * (Light/Dark Mode, display language, voice/browser alert toggles).
 * Operational queue data, auth credentials, and tokens are NEVER stored here.
 */
export function loadUiPreferences(): UiPreferences {
  try {
    const raw = window.localStorage.getItem(UI_PREFS_KEY);
    if (!raw) return { ...DEFAULT_UI_PREFS };
    const parsed = JSON.parse(raw);
    return {
      theme: parsed && parsed.theme === 'dark' ? 'dark' : 'light',
      language: parsed && parsed.language === 'hi' ? 'hi' : 'en',
      voiceAnnouncements: Boolean(parsed && parsed.voiceAnnouncements),
      browserNotificationsEnabled: Boolean(parsed && parsed.browserNotificationsEnabled),
    };
  } catch {
    return { ...DEFAULT_UI_PREFS };
  }
}

export function saveUiPreferences(partial: Partial<UiPreferences>): UiPreferences {
  const current = loadUiPreferences();
  const next: UiPreferences = {
    theme: partial.theme !== undefined ? (partial.theme === 'dark' ? 'dark' : 'light') : current.theme,
    language: partial.language !== undefined ? (partial.language === 'hi' ? 'hi' : 'en') : current.language,
    voiceAnnouncements:
      partial.voiceAnnouncements !== undefined ? Boolean(partial.voiceAnnouncements) : current.voiceAnnouncements,
    browserNotificationsEnabled:
      partial.browserNotificationsEnabled !== undefined
        ? Boolean(partial.browserNotificationsEnabled)
        : current.browserNotificationsEnabled,
  };
  try {
    window.localStorage.setItem(UI_PREFS_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota / private browsing errors for UI prefs
  }
  return next;
}
