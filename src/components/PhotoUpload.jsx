import { useRef, useState } from 'react';
import { mediaUrl, uploadMedia } from '../lib/api.js';

const ACCEPT = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];

// pathPrefix: full R2 path WITHOUT extension, e.g. "cigars/<pos_id>/main"
// currentPath: the saved photo_path from the DB (or null/undefined)
// onUploaded(path): called after successful upload + before parent save
// onCleared(): called when user clicks Remove
// version: bust the browser cache when the entity is saved with a new path
export default function PhotoUpload({
  pathPrefix,
  currentPath,
  onUploaded,
  onCleared,
  version,
  height = 220,
  hint,
}) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const name = file.name.toLowerCase();
    const dot = name.lastIndexOf('.');
    const ext = dot >= 0 ? name.slice(dot) : '';
    if (!ACCEPT.includes(ext)) {
      setError(`Use one of: ${ACCEPT.join(', ')}`);
      return;
    }
    const path = `${pathPrefix}${ext}`;
    setBusy(true);
    try {
      const { path: uploadedPath } = await uploadMedia(path, file);
      await onUploaded?.(uploadedPath);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  }

  async function clear() {
    if (!currentPath) return;
    if (!confirm('Remove this photo?')) return;
    setError(null); setBusy(true);
    try {
      await onCleared?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const src = currentPath ? mediaUrl(currentPath, version) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        position: 'relative',
        height,
        borderRadius: 12,
        background: 'var(--bg-soft)',
        border: '1px dashed var(--line)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {src ? (
          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span className="mute" style={{ fontSize: 13, textAlign: 'center', padding: 12 }}>
            No photo yet
            {hint && <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>{hint}</div>}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <label className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13, cursor: busy ? 'wait' : 'pointer' }}>
          {busy ? 'Uploading…' : currentPath ? 'Replace' : 'Upload'}
          <input
            ref={ref}
            type="file"
            accept={ACCEPT.join(',')}
            onChange={onFileChange}
            disabled={busy}
            style={{ display: 'none' }}
          />
        </label>
        {currentPath && (
          <button type="button" onClick={clear} disabled={busy} className="btn btn-danger" style={{ padding: '8px 14px', fontSize: 13 }}>
            Remove
          </button>
        )}
      </div>
      {error && <div style={{ color: 'var(--ember)', fontSize: 13 }}>{error}</div>}
    </div>
  );
}
