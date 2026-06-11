'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload, Plus, Trash2, Save, ArrowLeft, Loader2, X, Sparkles, CheckCircle2, AlertTriangle,
  FileText, Eye, Download, RefreshCw, Camera, ImageOff,
} from 'lucide-react';
import {
  StudentProfileInput, ParsedProfile, ResumeMeta, AvatarMeta, SkillCategory, SKILL_CATEGORIES, SKILL_CATEGORY_LABELS,
} from '@/types/student';

/* ── small field primitives ─────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1.5">
        {label}{required && <span className="text-emerald-400"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-sm text-zinc-200 transition-all"
      />
    </label>
  );
}

function Area({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1.5">{label}</span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-sm text-zinc-200 transition-all resize-y"
      />
    </label>
  );
}

function Section({ title, desc, children, action }: {
  title: string; desc?: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <section className="p-6 rounded-2xl bg-zinc-950/45 border border-zinc-900 backdrop-blur-md relative overflow-hidden scroll-mt-24">
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-extrabold text-sm text-zinc-200">{title}</h3>
          {desc && <p className="text-[11px] text-zinc-500 mt-0.5">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ChipList({ items, onChange, placeholder }: {
  items: string[]; onChange: (next: string[]) => void; placeholder: string;
}) {
  const [draft, setDraft] = useState('');
  const add = () => { const v = draft.trim(); if (v) { onChange([...items, v]); setDraft(''); } };
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-blue-500/40 focus:outline-none text-sm text-zinc-200"
        />
        <button type="button" onClick={add} className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 && <span className="text-[11px] text-zinc-600 font-mono">None added yet.</span>}
        {items.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 text-xs">
            {it}
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-zinc-500 hover:text-red-400 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

const RepeatBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold hover:bg-blue-500/15 transition-colors cursor-pointer">
    <Plus className="w-3.5 h-3.5" /> {label}
  </button>
);

const DeleteBtn = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick} title="Remove" className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer shrink-0">
    <Trash2 className="w-3.5 h-3.5" />
  </button>
);

/* ── duration helper (auto-calculated) ───────────────────────────────── */
function calcDuration(start: string, end: string): string {
  const parse = (s: string): Date | null => {
    if (!s) return null;
    if (/^now$|^present$/i.test(s.trim())) return new Date();
    const d = new Date(s.length === 7 ? `${s}-01` : s);
    return isNaN(d.getTime()) ? null : d;
  };
  const a = parse(start);
  const b = end ? parse(end) : new Date();
  if (!a || !b) return '—';
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (months < 0) return '—';
  const y = Math.floor(months / 12); months = months % 12;
  return [y ? `${y} yr` : '', months ? `${months} mo` : ''].filter(Boolean).join(' ') || '< 1 mo';
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/* ── editor ──────────────────────────────────────────────────────────── */
export default function StudentProfileEditor({
  initial,
  studentId,
  backHref = '/admin/students',
  backLabel = 'All students',
  title,
  resumeMeta = null,
  avatarMeta = null,
  displayId = null,
}: {
  initial: StudentProfileInput;
  studentId?: string;
  backHref?: string;
  backLabel?: string;
  title?: string;
  resumeMeta?: ResumeMeta | null;
  avatarMeta?: AvatarMeta | null;
  displayId?: string | null;
}) {
  const router = useRouter();
  const isEdit = !!studentId;
  const [p, setP] = useState<StudentProfileInput>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extractNote, setExtractNote] = useState<{ kind: 'gemini' | 'parsed'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Resume management (edit mode only — needs an existing student id to attach to).
  const [resume, setResume] = useState<ResumeMeta | null>(resumeMeta);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const pendingFileRef = useRef<File | null>(null);
  const pendingSourceRef = useRef<string>('upload');

  // Profile picture management (edit mode only). Upload/remove are deferred to
  // Save so the picture commits together with the rest of the profile.
  const [avatar, setAvatar] = useState<AvatarMeta | null>(avatarMeta);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const pendingAvatarRef = useRef<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  // Bust the no-store image cache after a successful save so a replacement shows.
  const [avatarVersion, setAvatarVersion] = useState(0);

  // Revoke the object URL when the preview changes or the component unmounts.
  useEffect(() => () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); }, [avatarPreview]);

  const AVATAR_TYPES = /\.(jpe?g|png|webp)$/i;
  function handleAvatarSelect(file: File) {
    setAvatarError('');
    const mime = file.type || '';
    if (!/^image\/(jpeg|png|webp)$/.test(mime) && !AVATAR_TYPES.test(file.name)) {
      setAvatarError('Only JPG, JPEG, PNG, or WEBP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be 5 MB or smaller.');
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    pendingAvatarRef.current = file;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarRemoved(false);
  }

  function clearAvatar() {
    setAvatarError('');
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    pendingAvatarRef.current = null;
    // Only flag a server-side removal if there is a stored image to delete.
    setAvatarRemoved(!!avatar?.hasFile);
  }

  // What the picture card should render right now.
  const storedAvatarUrl = avatar?.hasFile && !avatarRemoved && studentId
    ? `/api/students/${studentId}/avatar?v=${avatarVersion}`
    : null;
  const shownAvatar = avatarPreview || storedAvatarUrl;
  const initials = useMemo(
    () => `${(p.firstName[0] || '').toUpperCase()}${(p.lastName[0] || '').toUpperCase()}` || '?',
    [p.firstName, p.lastName]
  );
  const avatarPending = !!pendingAvatarRef.current || (avatarRemoved && !!avatar?.hasFile);

  const set = <K extends keyof StudentProfileInput>(k: K, v: StudentProfileInput[K]) => setP((prev) => ({ ...prev, [k]: v }));

  /* resume upload → extract → merge (everything remains editable) */
  async function handleFile(file: File) {
    setUploading(true); setExtractNote(null); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/resume/extract', { method: 'POST', body: fd });
      const data = await res.json() as { parsed: ParsedProfile; source: 'gemini' | 'parsed'; reason?: string };
      const parsed = data.parsed || {};
      setP((prev) => ({
        ...prev,
        firstName: parsed.firstName || prev.firstName,
        middleName: parsed.middleName ?? prev.middleName,
        lastName: parsed.lastName || prev.lastName,
        // Use the real email parsed from the resume when present (it is unique
        // per candidate); fall back to whatever the record already had.
        email: parsed.email || prev.email,
        phone: parsed.phone || prev.phone,
        linkedinUrl: parsed.linkedinUrl || prev.linkedinUrl,
        githubUrl: parsed.githubUrl || prev.githubUrl,
        summary: parsed.summary || prev.summary,
        yearsExperience: parsed.yearsExperience || prev.yearsExperience,
        education: parsed.education?.length ? parsed.education : prev.education,
        experience: parsed.experience?.length ? parsed.experience : prev.experience,
        projects: parsed.projects?.length ? parsed.projects : prev.projects,
        certifications: parsed.certifications?.length ? parsed.certifications : prev.certifications,
        skills: parsed.skills?.length ? parsed.skills : prev.skills,
        softSkills: parsed.softSkills?.length ? parsed.softSkills : prev.softSkills,
        achievements: parsed.achievements?.length ? parsed.achievements : prev.achievements,
        awards: parsed.awards?.length ? parsed.awards : prev.awards,
      }));
      setExtractNote(
        data.source === 'gemini'
          ? { kind: 'gemini', text: 'Extracted with Gemini. Review every field below — all values are editable.' }
          : { kind: 'parsed', text: 'Parsed from your uploaded resume. Review and complete any missing fields — all values are editable.' }
      );
      // In edit mode, hold the file so it is stored (and metadata stamped) on Save.
      if (isEdit) {
        pendingFileRef.current = file;
        pendingSourceRef.current = data.source || 'upload';
        setPendingName(file.name);
      }
    } catch {
      setError('Resume extraction failed. You can still fill the form manually.');
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch(isEdit ? `/api/students/${studentId}` : '/api/students', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      const data = await res.json().catch(() => ({}));
      const profileError = res.ok ? '' : (data.error || 'Profile save failed.');

      // Create mode: we need the new id before any file can be attached, so a
      // failed creation has nothing to persist media against — stop here.
      if (!isEdit) {
        if (profileError) { setError(profileError); return; }
        setSaved(true);
        if (data.id) router.push(`/admin/students/${data.id}`);
        return;
      }

      // Edit mode: persist the resume + picture INDEPENDENTLY of the profile
      // result. A profile validation error (e.g. a duplicate email) must never
      // silently drop the file the user just uploaded. Errors are aggregated.
      const errors: string[] = [];
      if (profileError) errors.push(profileError);

      if (studentId && pendingFileRef.current) {
        const rfd = new FormData();
        rfd.append('file', pendingFileRef.current);
        rfd.append('source', pendingSourceRef.current);
        const rr = await fetch(`/api/students/${studentId}/resume`, { method: 'POST', body: rfd });
        if (rr.ok) {
          const rj = await rr.json();
          setResume(rj.resume as ResumeMeta);
          pendingFileRef.current = null;
          setPendingName(null);
        } else {
          const rj = await rr.json().catch(() => ({}));
          errors.push(rj.error || 'The resume could not be stored.');
        }
      }

      // Commit the profile picture (upload or removal) with the same Save.
      if (studentId && pendingAvatarRef.current) {
        const afd = new FormData();
        afd.append('file', pendingAvatarRef.current);
        const ar = await fetch(`/api/students/${studentId}/avatar`, { method: 'POST', body: afd });
        if (ar.ok) {
          const aj = await ar.json();
          setAvatar(aj.avatar as AvatarMeta);
          pendingAvatarRef.current = null;
          if (avatarPreview) URL.revokeObjectURL(avatarPreview);
          setAvatarPreview(null);
          setAvatarRemoved(false);
          setAvatarVersion((v) => v + 1);
        } else {
          const aj = await ar.json().catch(() => ({}));
          errors.push(aj.error || 'The picture could not be stored.');
        }
      } else if (studentId && avatarRemoved && avatar?.hasFile) {
        const ar = await fetch(`/api/students/${studentId}/avatar`, { method: 'DELETE' });
        if (ar.ok) {
          const aj = await ar.json();
          setAvatar(aj.avatar as AvatarMeta);
          setAvatarRemoved(false);
          setAvatarVersion((v) => v + 1);
        } else {
          const aj = await ar.json().catch(() => ({}));
          errors.push(aj.error || 'The picture could not be removed.');
        }
      }

      if (errors.length) {
        setError(errors.join(' '));
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setError('Network error while saving.');
    } finally {
      setSaving(false);
    }
  }

  const fullName = useMemo(() => [p.firstName, p.lastName].filter(Boolean).join(' ') || 'New Student', [p.firstName, p.lastName]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header / actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900/60 pb-5">
        <div>
          <button onClick={() => router.push(backHref)} className="inline-flex items-center gap-2 text-[11px] font-mono text-zinc-500 hover:text-zinc-200 transition-colors mb-2 cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" /> {backLabel}
          </button>
          <div className="flex items-center gap-3">
            {isEdit && (
              shownAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shownAvatar} alt="Profile picture" className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-sm font-black text-blue-300 shrink-0">
                  {initials}
                </div>
              )
            )}
            <div>
              <h2 className="text-2xl font-black text-zinc-100 tracking-tight">{title ?? (isEdit ? `Edit — ${fullName}` : 'Create Student')}</h2>
              {displayId && (
                <span className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] font-mono font-semibold tracking-wider">
                  ID: {displayId}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono"><CheckCircle2 className="w-4 h-4" /> Saved</span>}
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {isEdit ? 'Save Changes' : 'Create Student'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Shared hidden file input (PDF / DOC / DOCX) */}
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />

      {/* Hidden image input (JPG / JPEG / PNG / WEBP) */}
      <input
        ref={avatarInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarSelect(f); e.target.value = ''; }}
      />

      {/* Profile picture management (edit mode only — needs a student id to attach to) */}
      {isEdit && (
        <Section title="Profile Picture" desc="Upload a photo (JPG, PNG, or WEBP). It appears across your profile and navigation. Changes apply when you Save.">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                {shownAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={shownAvatar} alt="Profile picture" className="w-16 h-16 rounded-full object-cover border border-zinc-700 shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-lg font-black text-blue-300 shrink-0">
                    {initials}
                  </div>
                )}
                <div className="space-y-1.5">
                  <div className="text-sm font-bold text-zinc-100">
                    {avatarPreview ? (pendingAvatarRef.current?.name || 'New photo') : avatar?.hasFile && !avatarRemoved ? (avatar.fileName || 'Profile picture') : 'No picture uploaded'}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-zinc-500">
                    <span>Uploaded: {fmtDate(avatar?.uploadedAt)}</span>
                    <span className={avatarPending ? 'text-amber-400' : avatar?.hasFile && !avatarRemoved ? 'text-emerald-400' : 'text-zinc-500'}>
                      Status: {avatarPreview ? 'Pending save' : avatarRemoved ? 'Removal pending save' : avatar?.hasFile ? 'Stored' : 'None'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={storedAvatarUrl ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!storedAvatarUrl}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${storedAvatarUrl ? 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 cursor-pointer' : 'border-zinc-800 text-zinc-600 pointer-events-none opacity-50'}`}
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </a>
                <button type="button" onClick={() => avatarInputRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer">
                  <Camera className="w-3.5 h-3.5" /> {avatar?.hasFile && !avatarRemoved ? 'Replace' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={clearAvatar}
                  disabled={!shownAvatar && !avatarRemoved}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-red-400 hover:bg-red-500/5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-zinc-300"
                >
                  <ImageOff className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
            {(avatarError || avatarPending) && (
              <div className="mt-4 pt-4 border-t border-zinc-800/60 flex flex-wrap items-center gap-3">
                {avatarError && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5" /> {avatarError}
                  </span>
                )}
                {avatarPreview && <span className="text-[11px] text-amber-400 font-mono">New photo will be stored when you Save.</span>}
                {avatarRemoved && !avatarPreview && <span className="text-[11px] text-amber-400 font-mono">Picture will be removed when you Save.</span>}
              </div>
            )}
          </div>
        </Section>
      )}

      {isEdit ? (
        /* Resume management card (premium) */
        <Section title="Resume" desc="View, download, or replace the resume that powers extraction. Replacing it re-runs extraction so you can review before saving.">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-300" />
                </div>
                <div className="space-y-1.5">
                  <div className="text-sm font-bold text-zinc-100">{pendingName || resume?.fileName || 'No resume uploaded'}</div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-zinc-500">
                    <span>Last updated: {fmtDate(resume?.updatedAt)}</span>
                    <span>Source: {resume?.source || '—'}</span>
                    <span className={pendingName ? 'text-amber-400' : resume?.hasFile ? 'text-emerald-400' : 'text-zinc-500'}>
                      Status: {pendingName ? 'Pending save' : resume?.hasFile ? 'Stored' : 'None'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={resume?.hasFile ? `/api/students/${studentId}/resume` : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!resume?.hasFile}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${resume?.hasFile ? 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 cursor-pointer' : 'border-zinc-800 text-zinc-600 pointer-events-none opacity-50'}`}
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </a>
                <a
                  href={resume?.hasFile ? `/api/students/${studentId}/resume?download=1` : undefined}
                  aria-disabled={!resume?.hasFile}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${resume?.hasFile ? 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 cursor-pointer' : 'border-zinc-800 text-zinc-600 pointer-events-none opacity-50'}`}
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60">
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Update Resume
                </button>
              </div>
            </div>
            {(extractNote || pendingName) && (
              <div className="mt-4 pt-4 border-t border-zinc-800/60 flex flex-wrap items-center gap-3">
                {extractNote && (
                  <span className={`inline-flex items-center gap-1.5 text-[11px] ${extractNote.kind === 'gemini' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <Sparkles className="w-3.5 h-3.5" /> {extractNote.text}
                  </span>
                )}
                {pendingName && (
                  <span className="text-[11px] text-amber-400 font-mono">New file &ldquo;{pendingName}&rdquo; will be stored when you Save.</span>
                )}
              </div>
            )}
          </div>
        </Section>
      ) : (
        /* Create mode — extraction only (no record yet to attach a file to) */
        <Section title="Resume Extraction" desc="Upload a PDF/DOC/DOCX to auto-populate the professional profile. Every extracted field stays editable.">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-semibold hover:bg-blue-500/15 transition-colors cursor-pointer disabled:opacity-60">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload Resume
            </button>
            {extractNote && (
              <span className={`inline-flex items-center gap-1.5 text-[11px] ${extractNote.kind === 'gemini' ? 'text-emerald-400' : 'text-amber-400'}`}>
                <Sparkles className="w-3.5 h-3.5" /> {extractNote.text}
              </span>
            )}
          </div>
        </Section>
      )}

      {/* Part 1 — Personal */}
      <Section title="Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="First Name" value={p.firstName} onChange={(v) => set('firstName', v)} required />
          <Field label="Middle Name" value={p.middleName} onChange={(v) => set('middleName', v)} />
          <Field label="Last Name" value={p.lastName} onChange={(v) => set('lastName', v)} required />
          <Field label="Aadhaar Number" value={p.aadhaarNumber} onChange={(v) => set('aadhaarNumber', v)} />
          <Field label="Gender" value={p.gender} onChange={(v) => set('gender', v)} />
          <Field label="Nationality" value={p.nationality} onChange={(v) => set('nationality', v)} />
          <Field label="Date of Birth" value={p.dateOfBirth} onChange={(v) => set('dateOfBirth', v)} placeholder="YYYY-MM-DD" />
        </div>
      </Section>

      <Section title="Address">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Address 1" value={p.address1} onChange={(v) => set('address1', v)} />
          <Field label="Address 2" value={p.address2} onChange={(v) => set('address2', v)} />
          <Field label="City" value={p.city} onChange={(v) => set('city', v)} />
          <Field label="District" value={p.district} onChange={(v) => set('district', v)} />
          <Field label="State" value={p.state} onChange={(v) => set('state', v)} />
          <Field label="Pin Code" value={p.pinCode} onChange={(v) => set('pinCode', v)} />
          <Field label="Country" value={p.country} onChange={(v) => set('country', v)} />
        </div>
      </Section>

      <Section title="Contact">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Email" value={p.email} onChange={(v) => set('email', v)} type="email" required />
          <Field label="Phone" value={p.phone} onChange={(v) => set('phone', v)} />
          <Field label="Alternate Phone" value={p.altPhone} onChange={(v) => set('altPhone', v)} />
        </div>
      </Section>

      {/* Part 2 — Professional */}
      <Section title="Social & Summary">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="LinkedIn URL" value={p.linkedinUrl} onChange={(v) => set('linkedinUrl', v)} />
          <Field label="GitHub URL" value={p.githubUrl} onChange={(v) => set('githubUrl', v)} />
          <Field label="Years of Experience" value={p.yearsExperience} onChange={(v) => set('yearsExperience', v)} type="number" />
        </div>
        <Area label="Professional Summary" value={p.summary} onChange={(v) => set('summary', v)} rows={4} />
        <div className="mt-4">
          <Area label="Description" value={p.description} onChange={(v) => set('description', v)} rows={3} />
        </div>
      </Section>

      <Section title="Work Experience" desc="Duration is auto-calculated from start/end dates." action={<RepeatBtn label="Add Experience" onClick={() => set('experience', [...p.experience, { jobTitle: '', companyName: '', location: '', employmentType: '', startDate: '', endDate: '', responsibilities: '', achievements: '', technologies: '' }])} />}>
        <div className="space-y-5">
          {p.experience.length === 0 && <p className="text-[11px] text-zinc-600 font-mono">No experience added.</p>}
          {p.experience.map((e, i) => (
            <div key={i} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Experience #{i + 1}
                  <span className="ml-2 text-emerald-400">{calcDuration(e.startDate, e.endDate)}</span>
                </span>
                <DeleteBtn onClick={() => set('experience', p.experience.filter((_, j) => j !== i))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Job Title" value={e.jobTitle} onChange={(v) => set('experience', p.experience.map((x, j) => j === i ? { ...x, jobTitle: v } : x))} />
                <Field label="Company Name" value={e.companyName} onChange={(v) => set('experience', p.experience.map((x, j) => j === i ? { ...x, companyName: v } : x))} />
                <Field label="Location" value={e.location} onChange={(v) => set('experience', p.experience.map((x, j) => j === i ? { ...x, location: v } : x))} />
                <Field label="Employment Type" value={e.employmentType} onChange={(v) => set('experience', p.experience.map((x, j) => j === i ? { ...x, employmentType: v } : x))} />
                <Field label="Start Date" value={e.startDate} onChange={(v) => set('experience', p.experience.map((x, j) => j === i ? { ...x, startDate: v } : x))} placeholder="YYYY-MM" />
                <Field label="End Date" value={e.endDate} onChange={(v) => set('experience', p.experience.map((x, j) => j === i ? { ...x, endDate: v } : x))} placeholder="YYYY-MM or Present" />
              </div>
              <Area label="Responsibilities" value={e.responsibilities} onChange={(v) => set('experience', p.experience.map((x, j) => j === i ? { ...x, responsibilities: v } : x))} />
              <Area label="Achievements" value={e.achievements} onChange={(v) => set('experience', p.experience.map((x, j) => j === i ? { ...x, achievements: v } : x))} />
              <Field label="Technologies Used" value={e.technologies} onChange={(v) => set('experience', p.experience.map((x, j) => j === i ? { ...x, technologies: v } : x))} placeholder="Comma-separated" />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Education" action={<RepeatBtn label="Add Education" onClick={() => set('education', [...p.education, { degree: '', fieldOfStudy: '', institution: '', location: '', dateOfPassing: '', cgpa: '', percentage: '', achievements: '' }])} />}>
        <div className="space-y-5">
          {p.education.length === 0 && <p className="text-[11px] text-zinc-600 font-mono">No education added.</p>}
          {p.education.map((e, i) => (
            <div key={i} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Education #{i + 1}</span>
                <DeleteBtn onClick={() => set('education', p.education.filter((_, j) => j !== i))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Degree" value={e.degree} onChange={(v) => set('education', p.education.map((x, j) => j === i ? { ...x, degree: v } : x))} />
                <Field label="Field of Study" value={e.fieldOfStudy} onChange={(v) => set('education', p.education.map((x, j) => j === i ? { ...x, fieldOfStudy: v } : x))} />
                <Field label="Institution" value={e.institution} onChange={(v) => set('education', p.education.map((x, j) => j === i ? { ...x, institution: v } : x))} />
                <Field label="Location" value={e.location} onChange={(v) => set('education', p.education.map((x, j) => j === i ? { ...x, location: v } : x))} />
                <Field label="Date of Passing" value={e.dateOfPassing} onChange={(v) => set('education', p.education.map((x, j) => j === i ? { ...x, dateOfPassing: v } : x))} />
                <Field label="CGPA" value={e.cgpa} onChange={(v) => set('education', p.education.map((x, j) => j === i ? { ...x, cgpa: v } : x))} />
                <Field label="Percentage" value={e.percentage} onChange={(v) => set('education', p.education.map((x, j) => j === i ? { ...x, percentage: v } : x))} />
              </div>
              <Area label="Achievements" value={e.achievements} onChange={(v) => set('education', p.education.map((x, j) => j === i ? { ...x, achievements: v } : x))} rows={2} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Technical Skills" desc="Grouped by category.">
        <div className="space-y-5">
          {SKILL_CATEGORIES.map((cat) => (
            <SkillCategoryEditor
              key={cat}
              category={cat}
              skills={p.skills.filter((s) => s.category === cat).map((s) => s.name)}
              onChange={(names) => set('skills', [...p.skills.filter((s) => s.category !== cat), ...names.map((name) => ({ category: cat, name }))])}
            />
          ))}
        </div>
      </Section>

      <Section title="Projects" action={<RepeatBtn label="Add Project" onClick={() => set('projects', [...p.projects, { title: '', description: '', technologies: '' }])} />}>
        <div className="space-y-5">
          {p.projects.length === 0 && <p className="text-[11px] text-zinc-600 font-mono">No projects added.</p>}
          {p.projects.map((pr, i) => (
            <div key={i} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Project #{i + 1}</span>
                <DeleteBtn onClick={() => set('projects', p.projects.filter((_, j) => j !== i))} />
              </div>
              <Field label="Project Title" value={pr.title} onChange={(v) => set('projects', p.projects.map((x, j) => j === i ? { ...x, title: v } : x))} />
              <Area label="Project Description" value={pr.description} onChange={(v) => set('projects', p.projects.map((x, j) => j === i ? { ...x, description: v } : x))} />
              <Field label="Technologies Used" value={pr.technologies} onChange={(v) => set('projects', p.projects.map((x, j) => j === i ? { ...x, technologies: v } : x))} placeholder="Comma-separated" />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Certifications" action={<RepeatBtn label="Add Certification" onClick={() => set('certifications', [...p.certifications, { title: '', number: '', description: '' }])} />}>
        <div className="space-y-5">
          {p.certifications.length === 0 && <p className="text-[11px] text-zinc-600 font-mono">No certifications added.</p>}
          {p.certifications.map((c, i) => (
            <div key={i} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Certification #{i + 1}</span>
                <DeleteBtn onClick={() => set('certifications', p.certifications.filter((_, j) => j !== i))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Certification Title" value={c.title} onChange={(v) => set('certifications', p.certifications.map((x, j) => j === i ? { ...x, title: v } : x))} />
                <Field label="Certification Number" value={c.number} onChange={(v) => set('certifications', p.certifications.map((x, j) => j === i ? { ...x, number: v } : x))} />
              </div>
              <Area label="Description" value={c.description} onChange={(v) => set('certifications', p.certifications.map((x, j) => j === i ? { ...x, description: v } : x))} rows={2} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Soft Skills"><ChipList items={p.softSkills} onChange={(v) => set('softSkills', v)} placeholder="Add a soft skill and press Enter" /></Section>
      <Section title="Achievements"><ChipList items={p.achievements} onChange={(v) => set('achievements', v)} placeholder="Add an achievement and press Enter" /></Section>
      <Section title="Awards"><ChipList items={p.awards} onChange={(v) => set('awards', v)} placeholder="Add an award and press Enter" /></Section>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {isEdit ? 'Save Changes' : 'Create Student'}
        </button>
      </div>
    </div>
  );
}

function SkillCategoryEditor({ category, skills, onChange }: { category: SkillCategory; skills: string[]; onChange: (names: string[]) => void }) {
  return (
    <div>
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-2">{SKILL_CATEGORY_LABELS[category]}</span>
      <ChipList items={skills} onChange={onChange} placeholder={`Add ${SKILL_CATEGORY_LABELS[category].toLowerCase()}`} />
    </div>
  );
}
