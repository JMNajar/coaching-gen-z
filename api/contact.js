export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  console.log(`[contact] ${name || 'no name'} <${email}>`);
  console.log(`[contact] message: ${message || '(none)'}`);

  return res.status(200).json({ success: true });
}
