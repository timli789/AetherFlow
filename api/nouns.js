export default async function handler(req, res) {
  try {
    const response = await fetch('https://xrczdjbmwhenkxhyddfo.supabase.co/rest/v1/nouns?select=word', {
      headers: {
        'apikey': 'sb_publishable_hDqhfmunNjArj0YSBuW8uQ_zlP23tuV',
        'Authorization': 'Bearer sb_publishable_hDqhfmunNjArj0YSBuW8uQ_zlP23tuV'
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase REST query responded with status ${response.status}`);
    }

    const data = await response.json();

    // Cache content at the Vercel Edge network for 1 hour (3600 seconds)
    // Serve stale content for up to 10 minutes (600 seconds) while refreshing in background
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600, public');
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in api/nouns proxy handler:", error);
    res.status(500).json({ error: error.message });
  }
}
