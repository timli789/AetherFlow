const SUPABASE_URL = 'https://diryaljjfcucuvzyelvk.supabase.co/rest/v1/nouns';
const SUPABASE_KEY = 'sb_publishable_puw8xu-OwPWKAtVgaWpiTg_CjOO93lF';

export default async function handler(req, res) {
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };

  try {
    const queryUrl = `${SUPABASE_URL}?select=word`;
    const initialResponse = await fetch(queryUrl, {
      headers: { ...headers, 'Range': '0-999', 'Prefer': 'count=exact' }
    });

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

    // Fetch remaining batches in parallel if database has more than 1000 items
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

    // Cache at Vercel Edge CDN for 24h (86400s) + 1h stale-while-revalidate for sub-50ms loads
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600, public');
    res.status(200).json(allWords);
  } catch (error) {
    console.error("Error in api/nouns handler:", error);
    res.status(500).json({ error: error.message });
  }
}


