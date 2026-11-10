const SUPABASE_URL = 'https://diryaljjfcucuvzyelvk.supabase.co/rest/v1/nouns';
const SUPABASE_KEY = 'sb_publishable_puw8xu-OwPWKAtVgaWpiTg_CjOO93lF';

export default async function handler(req, res) {
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };

  // POST / PATCH: Mark displayed nouns as reviewed = true in Supabase
  if (req.method === 'POST' || req.method === 'PATCH') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const rawWords = Array.isArray(body.words) ? body.words : (body.word ? [body.word] : []);
      const cleaned = rawWords
        .map(w => String(w || '').trim())
        .filter(Boolean);

      if (cleaned.length === 0) {
        return res.status(400).json({ error: 'No words provided to mark as reviewed.' });
      }

      const normalizedVals = [...new Set(cleaned.map(w => w.toLowerCase()))]
        .map(w => `"${w.replace(/"/g, '\\"')}"`)
        .join(',');
      const exactVals = [...new Set([...cleaned, ...cleaned.map(w => w.toLowerCase())])]
        .map(w => `"${w.replace(/"/g, '\\"')}"`)
        .join(',');

      const filterQuery = `or=(normalized.in.(${normalizedVals}),word.in.(${exactVals}))`;
      const patchRes = await fetch(`${SUPABASE_URL}?${filterQuery}`, {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ reviewed: true })
      });

      if (!patchRes.ok) {
        const errText = await patchRes.text();
        throw new Error(`Supabase PATCH failed (${patchRes.status}): ${errText}`);
      }

      const updated = await patchRes.json();
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ updatedCount: Array.isArray(updated) ? updated.length : 0 });
    } catch (error) {
      console.error('Error marking nouns as reviewed:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // GET: Fetch only nouns where reviewed is false or null
  try {
    let queryUrl = `${SUPABASE_URL}?select=word,reviewed&or=(reviewed.is.null,reviewed.eq.false)`;
    let initialResponse = await fetch(queryUrl, {
      headers: { ...headers, 'Range': '0-999', 'Prefer': 'count=exact' }
    });

    // Fallback if the `reviewed` column has not been created in Supabase yet
    if (!initialResponse.ok && initialResponse.status === 400) {
      queryUrl = `${SUPABASE_URL}?select=word`;
      initialResponse = await fetch(queryUrl, {
        headers: { ...headers, 'Range': '0-999', 'Prefer': 'count=exact' }
      });
    }

    if (!initialResponse.ok) {
      throw new Error(`Supabase REST query responded with status ${initialResponse.status}`);
    }

    const firstBatch = await initialResponse.json();
    const contentRange = initialResponse.headers.get('content-range');
    let totalCount = 0;
    if (contentRange && contentRange.includes('/')) {
      totalCount = parseInt(contentRange.split('/')[1], 10);
    }

    let allWords = [...firstBatch];

    // Fetch remaining batches in parallel if database has more than 1000 unreviewed items
    if (totalCount > 1000) {
      const remainingPromises = [];
      for (let offset = 1000; offset < totalCount; offset += 1000) {
        const end = Math.min(offset + 999, totalCount - 1);
        remainingPromises.push(
          fetch(queryUrl, {
            headers: { ...headers, 'Range': `${offset}-${end}` }
          }).then(r => r.json())
        );
      }
      const remainingBatches = await Promise.all(remainingPromises);
      for (const batch of remainingBatches) {
        if (Array.isArray(batch)) {
          allWords.push(...batch);
        }
      }
    }

    // Do not cache at the edge so newly reviewed words are immediately excluded
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.status(200).json(allWords);
  } catch (error) {
    console.error("Error in api/nouns proxy handler:", error);
    res.status(500).json({ error: error.message });
  }
}

