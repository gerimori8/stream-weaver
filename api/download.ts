import type { VercelRequest, VercelResponse } from '@vercel/node';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = 'youtube-media-downloader.p.rapidapi.com';

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
    
    // Extract all available qualities
    const audioQualities: QualityOption[] = [];
    const videoQualities: QualityOption[] = [];

    // Process audio options
    if (data.audios?.items?.length > 0) {
      for (const audio of data.audios.items) {
        if (!audio.url) continue;
        
        const bitrate = audio.bitrate || audio.audioBitrate || audio.abr || '128';
        const bitrateNum = parseInt(bitrate);
        
        // Avoid duplicates
        if (!audioQualities.some(q => q.bitrate === `${bitrateNum}kbps`)) {
          audioQualities.push({
            url: audio.url,
            quality: `${bitrateNum}kbps`,
            bitrate: `${bitrateNum}kbps`,
            fileSize: audio.size || audio.contentLength || '',
          });
        }
      }
      // Sort by bitrate descending
      audioQualities.sort((a, b) => {
        const bitrateA = parseInt(a.bitrate || '0');
        const bitrateB = parseInt(b.bitrate || '0');
        return bitrateB - bitrateA;
      });
    }

    // Process video options - include all resolutions including 4K
    if (data.videos?.items?.length > 0) {
      for (const video of data.videos.items) {
        if (!video.url) continue;
        
        const height = parseInt(video.height || '0');
        const qualityLabel = video.quality || `${height}p`;
        const hasAudio = video.hasAudio !== false && video.audioChannels !== 0;
        
        // Avoid duplicates - prefer versions WITH audio
        const existingIndex = videoQualities.findIndex(q => q.quality === qualityLabel);
        if (existingIndex >= 0) {
          // If current one has audio and existing doesn't, replace it
          if (hasAudio && !videoQualities[existingIndex].hasAudio) {
            videoQualities[existingIndex] = {
              url: video.url,
              quality: qualityLabel,
              fileSize: video.size || '',
              hasAudio,
            };
          }
        } else {
          videoQualities.push({
            url: video.url,
            quality: qualityLabel,
            fileSize: video.size || '',
            hasAudio,
          });
        }
      }
      // Sort by resolution descending
      videoQualities.sort((a, b) => {
        const heightA = parseInt(a.quality) || 0;
        const heightB = parseInt(b.quality) || 0;
        return heightB - heightA;
      });
    }
    
    // For MP4, filter to only show options WITH audio (video+audio combined)
    const videoWithAudio = videoQualities.filter(v => v.hasAudio);
    const finalVideoQualities = videoWithAudio.length > 0 ? videoWithAudio : videoQualities;

    // If user selected a specific quality, return that download URL
    let downloadUrl = '';
    let quality = '';
    let fileSize = '';

    if (selectedQuality) {
      if (format === 'mp3') {
        const selected = audioQualities.find(q => q.quality === selectedQuality);
        if (selected) {
          downloadUrl = selected.url;
          quality = selected.quality;
          fileSize = selected.fileSize || '';
        }
      } else if (format === 'mp4') {
        const selected = finalVideoQualities.find(q => q.quality === selectedQuality);
        if (selected) {
          downloadUrl = selected.url;
          quality = selected.quality;
          fileSize = selected.fileSize || '';
        }
      }
    } else {
      // Return best quality by default for initial preview
      if (format === 'mp3' && audioQualities.length > 0) {
        downloadUrl = audioQualities[0].url;
        quality = audioQualities[0].quality;
        fileSize = audioQualities[0].fileSize || '';
      } else if (format === 'mp4' && finalVideoQualities.length > 0) {
        downloadUrl = finalVideoQualities[0].url;
        quality = finalVideoQualities[0].quality;
        fileSize = finalVideoQualities[0].fileSize || '';
      }
    }

    if (!downloadUrl && (format === 'mp3' ? audioQualities.length === 0 : finalVideoQualities.length === 0)) {
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
      // Include all available qualities (for MP4, only those with audio)
      availableQualities: format === 'mp3' ? audioQualities : finalVideoQualities,
      // Flag if we had to filter out video-only options
      hasVideoOnlyWarning: format === 'mp4' && videoWithAudio.length < videoQualities.length,
    });

  } catch (error) {
    console.error('Download API error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
