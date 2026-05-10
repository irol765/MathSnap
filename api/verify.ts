export default async function handler(
  req: { method: string; body?: Record<string, unknown> },
  res: {
    status: (code: number) => { json: (data: Record<string, unknown>) => void };
    json: (data: Record<string, unknown>) => void;
  }
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = (req.body || {}) as { code?: string };
  const accessCode = (process.env.ACCESS_CODE || '').trim();

  // No access code configured - all access allowed
  if (!accessCode) {
    return res.status(200).json({ verified: true });
  }

  // Access code configured - verify
  if (code && code === accessCode) {
    return res.status(200).json({ verified: true });
  }

  return res.status(401).json({ verified: false });
}
