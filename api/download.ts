import type { VercelRequest, VercelResponse } from '@vercel/node';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = 'youtube-video-downloader-4k-and-8k-mp3.p.rapidapi.com';

interface QualityOption {
  url: string;
  quality: string;
  fileSize?: string;
  bitrate?: string;
  hasAudio?: boolean;
}

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
    const { videoId, format, selectedQuality } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    if (!RAPIDAPI_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log(`Fetching video info for: ${videoId}, format: ${format}`);

    // Use the new API that merges audio+video automatically
    const url = new URL('https://youtube-video-downloader-4k-and-8k-mp3.p.rapidapi.com/download');
    url.searchParams.append('id', videoId);
    
    // Request the specific format - this API returns merged audio+video for MP4
    if (selectedQuality) {
      url.searchParams.append('format', selectedQuality);
    } else if (format === 'mp3') {
      url.searchParams.append('format', 'mp3');
    } else {
      url.searchParams.append('format', '1080'); // Default to 1080p
    }

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
    console.log('API response:', JSON.stringify(data, null, 2));
    
    // Handle error response from API
    if (data.error || data.status === 'error') {
      return res.status(400).json({ 
        error: data.message || data.error || 'Video not available' 
      });
    }

    // Extract available qualities from the API response
    const audioQualities: QualityOption[] = [];
    const videoQualities: QualityOption[] = [];

    // This API provides pre-merged video+audio streams
    // Available formats: 8k, 4k, 1080, 720, 480, 360, mp3, m4a
    const videoFormats = ['8k', '4k', '1080', '720', '480', '360'];
    const audioFormats = ['mp3', 'm4a'];

    // Build quality options based on what the API supports
    if (format === 'mp3') {
      // Audio formats
      for (const fmt of audioFormats) {
        const bitrateLabel = fmt === 'mp3' ? '320kbps' : '256kbps';
        audioQualities.push({
          url: '', // URL will be fetched when user selects
          quality: fmt.toUpperCase(),
          bitrate: bitrateLabel,
          hasAudio: true,
        });
      }
    } else {
      // Video formats - all include audio (merged by the API)
      for (const fmt of videoFormats) {
        let qualityLabel = fmt;
        if (fmt === '8k') qualityLabel = '4320p';
        else if (fmt === '4k') qualityLabel = '2160p';
        else qualityLabel = `${fmt}p`;
        
        videoQualities.push({
          url: '', // URL will be fetched when user selects
          quality: qualityLabel,
          hasAudio: true, // This API always includes audio!
        });
      }
    }

    // Get the actual download URL from the response
    let downloadUrl = data.url || data.link || data.downloadUrl || '';
    let quality = selectedQuality || (format === 'mp3' ? 'MP3' : '1080p');
    let fileSize = data.size || data.fileSize || '';

    // If no download URL in response, it might be in a different structure
    if (!downloadUrl && data.formats) {
      const targetFormat = selectedQuality || (format === 'mp3' ? 'mp3' : '1080');
      const formatData = data.formats.find((f: any) => 
        f.quality === targetFormat || f.format === targetFormat || f.label?.includes(targetFormat)
      );
      if (formatData) {
        downloadUrl = formatData.url || formatData.link;
        fileSize = formatData.size || '';
      }
    }

    // Get video metadata (need a separate call for thumbnail/title)
    let title = data.title || 'Video';
    let thumbnail = data.thumbnail || data.thumbnailUrl || '';
    let duration = data.duration || data.lengthSeconds || 0;
    let channel = data.channel || data.author || '';

    return res.status(200).json({
      success: true,
      title,
      thumbnail,
      duration,
      channel,
      downloadUrl,
      quality,
      fileSize,
      format,
      availableQualities: format === 'mp3' ? audioQualities : videoQualities,
      hasVideoOnlyWarning: false, // This API always includes audio
    });

  } catch (error) {
    console.error('Download API error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
