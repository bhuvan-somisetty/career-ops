'use client';

import { useEffect } from 'react';

// One-time migration: the app was renamed Career Officer → Career Ops and its
// localStorage keys moved from `career_officer_*` to `career_ops_*`. Copy any
// legacy values forward so existing sessions (login, student id, onboarding,
// currency, admin) survive the rename instead of silently logging users out.
const LEGACY_PAIRS: [string, string][] = [
  ['career_officer_logged_in', 'career_ops_logged_in'],
  ['career_officer_token', 'career_ops_token'],
  ['career_officer_student_id', 'career_ops_student_id'],
  ['career_officer_onboarded', 'career_ops_onboarded'],
  ['career_officer_currency', 'career_ops_currency'],
  ['career_officer_admin_logged_in', 'career_ops_admin_logged_in'],
  ['career_officer_admin_token', 'career_ops_admin_token'],
];

export default function LegacyKeyMigration() {
  useEffect(() => {
    try {
      for (const [oldKey, newKey] of LEGACY_PAIRS) {
        const v = localStorage.getItem(oldKey);
        if (v !== null && localStorage.getItem(newKey) === null) localStorage.setItem(newKey, v);
      }
    } catch { /* localStorage unavailable — ignore */ }
  }, []);
  return null;
}
