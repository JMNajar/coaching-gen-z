export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, first_name, source } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  // Use Kent's own pub when ready; falls back to main Horsepower AI pub
  const pubId  = process.env.KENT_BEEHIIV_PUB_ID || process.env.BEEHIIV_PUB_ID;
  const apiKey = process.env.BEEHIIV_API_KEY;

  if (!pubId || !apiKey) {
    // Beehiiv not yet configured — log and return success so user gets the PDF
    console.log(`[subscribe] PENDING CONFIG — ${email} (${first_name || 'no name'}) from ${source || 'unknown'}`);
    return res.status(200).json({ success: true, pending: true });
  }

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          email,
          first_name: first_name || '',
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: 'coaching-gen-z',
          utm_medium: source || 'website'
        })
      }
    );

    if (response.ok) {
      return res.status(200).json({ success: true });
    }

    const err = await response.json();
    console.error('Beehiiv error:', err);
    return res.status(502).json({ error: 'Subscription failed' });

  } catch (e) {
    console.error('Subscribe handler error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
