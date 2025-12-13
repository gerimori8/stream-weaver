import type { VercelRequest, VercelResponse } from '@vercel/node';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = 'youtube-media-downloader.p.rapidapi.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId, format } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    if (!RAPIDAPI_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log(`Fetching video info for: ${videoId}, format: ${format}`);

    const url = new URL('https://youtube-media-downloader.p.rapidapi.com/v2/video/details');
    url.searchParams.append('videoId', videoId);
    url.searchParams.append('videos', 'true');
    url.searchParams.append('audios', 'true');
    url.searchParams.append('subtitles', 'false');
    url.searchParams.append('related', 'false');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RapidAPI error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to fetch video info',
        details: errorText 
      });
    }

    const data = await response.json();

    // Extract relevant download links based on format
    let downloadUrl = '';
    let quality = '';
    let fileSize = '';

    if (format === 'mp3' && data.audios?.items?.length > 0) {
      // Get best audio quality
      const audio = data.audios.items.reduce((best: any, current: any) => {
        const bestBitrate = parseInt(best?.bitrate || '0');
        const currentBitrate = parseInt(current?.bitrate || '0');
        return currentBitrate > bestBitrate ? current : best;
      }, data.audios.items[0]);

      downloadUrl = audio.url;
      quality = `${audio.bitrate || '128'}kbps`;
      fileSize = audio.size || 'Unknown';
    } else if (format === 'mp4' && data.videos?.items?.length > 0) {
      // Get best video quality (prefer 720p or 1080p with audio)
      const videosWithAudio = data.videos.items.filter((v: any) => v.hasAudio !== false);
      const video = videosWithAudio.length > 0 
        ? videosWithAudio.reduce((best: any, current: any) => {
            const bestHeight = parseInt(best?.height || '0');
            const currentHeight = parseInt(current?.height || '0');
            // Prefer 1080p or lower for reasonable file sizes
            if (currentHeight <= 1080 && currentHeight > bestHeight) return current;
            return best;
          }, videosWithAudio[0])
        : data.videos.items[0];

      downloadUrl = video.url;
      quality = video.quality || `${video.height}p`;
      fileSize = video.size || 'Unknown';
    }

    if (!downloadUrl) {
      return res.status(404).json({ 
        error: 'No download URL found for the requested format' 
      });
    }

    return res.status(200).json({
      success: true,
      title: data.title,
      thumbnail: data.thumbnails?.[0]?.url || data.thumbnail?.url,
      duration: data.lengthSeconds,
      channel: data.channel?.name,
      downloadUrl,
      quality,
      fileSize,
      format,
    });

  } catch (error) {
    console.error('Download API error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
