const TOKEN = import.meta.env.VITE_ADMIN_TOKEN;

async function call(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/admin/${path}`, {
    method,
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw Object.assign(new Error(data?.error || res.statusText), { status: res.status, data });
  return data;
}

export const get   = (p)       => call(p);
export const post  = (p, body) => call(p, { method: 'POST', body });
export const patch = (p, body) => call(p, { method: 'PATCH', body });
export const del   = (p)       => call(p, { method: 'DELETE' });

// --- file uploads / downloads (R2 via the Worker) ---
export async function upload(folder, name, file) {
  const res = await fetch(
    '/admin/upload?folder=' + encodeURIComponent(folder) + '&name=' + encodeURIComponent(name),
    {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + import.meta.env.VITE_ADMIN_TOKEN,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || 'Upload failed'); e.data = data; throw e; }
  return data; // { key }
}

export function fileUrl(key) {
  return '/admin/file?key=' + encodeURIComponent(key);
}

export async function fetchBlobUrl(key) {
  const res = await fetch(fileUrl(key), {
    headers: { 'Authorization': 'Bearer ' + import.meta.env.VITE_ADMIN_TOKEN },
  });
  if (!res.ok) throw new Error('Could not open file');
  return URL.createObjectURL(await res.blob());
}

export async function deleteFile(key) {
  const res = await fetch(fileUrl(key), {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + import.meta.env.VITE_ADMIN_TOKEN },
  });
  if (!res.ok) throw new Error('Could not delete file');
  return true;
}
