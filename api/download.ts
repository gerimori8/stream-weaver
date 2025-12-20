import type { VercelRequest, VercelResponse } from '@vercel/node';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = 'youtube-video-and-shorts-downloader1.p.rapidapi.com';

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

    console.log(`Fetching video info for: ${videoId}, format: ${format}, selectedQuality: ${selectedQuality}`);

    // Build URL with renderable formats for merged video+audio
    const url = new URL('https://youtube-video-and-shorts-downloader1.p.rapidapi.com/youtube/v3/video/details');
    url.searchParams.append('videoId', videoId);
    
    // Request renderable formats (merged video+audio) for all qualities
    if (format === 'mp4') {
      url.searchParams.append('renderableFormats', 'all');
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
    console.log('API response metadata:', JSON.stringify(data.metadata, null, 2));
    
    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    const contents = data.contents?.[0] || {};
    const metadata = data.metadata || {};

    // Extract available qualities
    const audioQualities: QualityOption[] = [];
    const videoQualities: QualityOption[] = [];

    // Process audio options
    if (contents.audios?.length > 0) {
      for (const audio of contents.audios) {
        const label = audio.label || 'audio';
        const bitrateMatch = audio.metadata?.audio_sample_rate;
        let bitrate = '128kbps';
        
        if (audio.metadata?.mime_type?.includes('mp4a')) {
          bitrate = label === 'high' ? '256kbps' : label === 'medium' ? '128kbps' : '64kbps';
        }
        
        if (!audioQualities.some(q => q.quality === label)) {
          audioQualities.push({
            url: audio.url || '',
            quality: label.charAt(0).toUpperCase() + label.slice(1),
            bitrate,
            fileSize: audio.metadata?.content_length_text || '',
            hasAudio: true,
          });
        }
      }
    }

    // Process video options - prefer renderableVideos (merged with audio)
    const renderableVideos = contents.renderableVideos || [];
    const regularVideos = contents.videos || [];

    // First, add renderable videos (these have audio merged!)
    for (const video of renderableVideos) {
      const label = video.label || video.metadata?.quality_label || '';
      const qualityLabel = label.includes('p') ? label : `${label}p`;
      
      if (!videoQualities.some(q => q.quality === qualityLabel)) {
        videoQualities.push({
          url: '', // Will use renderConfig
          quality: qualityLabel,
          fileSize: video.metadata?.content_length_text || '',
          hasAudio: true, // Renderable videos always have audio merged
        });
      }
    }

    // Add regular videos that already have audio (progressive formats)
    for (const video of regularVideos) {
      const label = video.label || video.metadata?.quality_label || '';
      const qualityLabel = label.includes('p') ? label : `${label}p`;
      const mimeType = video.metadata?.mime_type || '';
      
      // Check if video has audio codec in mime type
      const hasAudio = mimeType.includes('mp4a') || mimeType.includes('audio');
      
      if (!videoQualities.some(q => q.quality === qualityLabel)) {
        videoQualities.push({
          url: video.url || '',
          quality: qualityLabel,
          fileSize: video.metadata?.content_length_text || '',
          hasAudio,
        });
      }
    }

    // Sort videos by quality (highest first)
    const qualityOrder: Record<string, number> = {
      '2160p': 2160, '2160p60': 2160, '1440p': 1440, '1440p60': 1440,
      '1080p': 1080, '1080p60': 1080, '720p': 720, '720p60': 720,
      '480p': 480, '360p': 360, '240p': 240, '144p': 144,
    };
    
    videoQualities.sort((a, b) => {
      const aOrder = qualityOrder[a.quality] || 0;
      const bOrder = qualityOrder[b.quality] || 0;
      return bOrder - aOrder;
    });

    // Get download URL based on selection
    let downloadUrl = '';
    let quality = '';
    let fileSize = '';

    if (format === 'mp3') {
      const selected = selectedQuality 
        ? audioQualities.find(q => q.quality === selectedQuality)
        : audioQualities[0];
      
      if (selected) {
        downloadUrl = selected.url;
        quality = selected.quality;
        fileSize = selected.fileSize || '';
      }
    } else {
      // For MP4, prefer renderable (merged) video
      const selected = selectedQuality
        ? videoQualities.find(q => q.quality === selectedQuality)
        : videoQualities.find(q => q.hasAudio) || videoQualities[0];
      
      if (selected) {
        // Find the corresponding renderable or regular video
        const renderable = renderableVideos.find((v: any) => 
          v.label === selected.quality || v.metadata?.quality_label === selected.quality
        );
        const regular = regularVideos.find((v: any) => 
          v.label === selected.quality || v.metadata?.quality_label === selected.quality
        );
        
        if (renderable?.renderConfig?.executionUrl) {
          // Trigger render and get download URL
          try {
            const renderResponse = await fetch(renderable.renderConfig.executionUrl, {
              method: 'GET',
            });
            const renderData = await renderResponse.json();
            console.log('Render response:', JSON.stringify(renderData, null, 2));
            
            if (renderData.downloadUrl || renderData.url) {
              downloadUrl = renderData.downloadUrl || renderData.url;
            }
          } catch (renderError) {
            console.error('Render error:', renderError);
          }
        }
        
        // Fallback to regular URL if render failed
        if (!downloadUrl && regular?.url) {
          downloadUrl = regular.url;
        }
        
        quality = selected.quality;
        fileSize = selected.fileSize || '';
      }
    }

    // Parse duration from format "HH:MM:SS" or "MM:SS"
    let duration = 0;
    if (metadata.additionalData?.duration) {
      const parts = metadata.additionalData.duration.split(':').map(Number);
      if (parts.length === 3) {
        duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        duration = parts[0] * 60 + parts[1];
      }
    }

    return res.status(200).json({
      success: true,
      title: metadata.title || 'Video',
      thumbnail: metadata.thumbnailUrl || '',
      duration,
      channel: metadata.author?.name || '',
      downloadUrl,
      quality,
      fileSize,
      format,
      availableQualities: format === 'mp3' ? audioQualities : videoQualities,
      hasVideoOnlyWarning: videoQualities.some(v => !v.hasAudio),
    });

  } catch (error) {
    console.error('Download API error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
