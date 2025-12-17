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
      // Get best audio available (no upper limit, sort by bitrate descending)
      const sortedAudios = [...data.audios.items]
        .filter((a: any) => a.url)
        .sort((a: any, b: any) => {
          const bitrateA = parseInt(a?.bitrate || a?.audioBitrate || a?.abr || '0');
          const bitrateB = parseInt(b?.bitrate || b?.audioBitrate || b?.abr || '0');
          return bitrateB - bitrateA;
        });
      
      const audio = sortedAudios[0] || data.audios.items[0];
      if (audio) {
        downloadUrl = audio.url;
        const bitrate = audio.bitrate || audio.audioBitrate || audio.abr || '128';
        quality = `${bitrate}kbps`;
        fileSize = audio.size || audio.contentLength || '';
      }
    }
    else if (format === 'mp4' && data.videos?.items?.length > 0) {
      // Get best quality video up to 1080p (ignore audio - YouTube separates them at high quality)
      const sortedVideos = [...data.videos.items]
        .filter((v: any) => v.url && parseInt(v?.height || '0') <= 1080)
        .sort((a: any, b: any) => {
          const heightA = parseInt(a?.height || '0');
          const heightB = parseInt(b?.height || '0');
          return heightB - heightA;
        });
      
      const video = sortedVideos[0];
      if (video) {
        downloadUrl = video.url;
        quality = video.quality || `${video.height}p`;
        fileSize = video.size || '';
      }
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
