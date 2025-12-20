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
    const av1Qualities: QualityOption[] = [];

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

    console.log('Available renderableVideos:', renderableVideos.map((v: any) => ({
      label: v.label,
      quality: v.metadata?.quality_label,
      hasRenderConfig: !!v.renderConfig?.executionUrl
    })));
    console.log('Available regularVideos:', regularVideos.map((v: any) => ({
      label: v.label,
      quality: v.metadata?.quality_label,
      mime: v.metadata?.mime_type
    })));

    // First, add renderable videos (these have audio merged!)
    for (const video of renderableVideos) {
      const label = video.label || video.metadata?.quality_label || '';
      const qualityLabel = label.includes('p') ? label : `${label}p`;
      const mimeType = video.metadata?.mime_type || '';
      const isAV1 = mimeType.includes('av01') || mimeType.includes('av1');
      
      if (isAV1) {
        // Add to AV1 qualities
        if (!av1Qualities.some(q => q.quality === qualityLabel)) {
          av1Qualities.push({
            url: video.renderConfig?.executionUrl || '',
            quality: qualityLabel,
            fileSize: video.metadata?.content_length_text || '',
            hasAudio: true,
          });
        }
      } else {
        // Add to regular MP4 qualities
        if (!videoQualities.some(q => q.quality === qualityLabel)) {
          videoQualities.push({
            url: video.renderConfig?.executionUrl || '',
            quality: qualityLabel,
            fileSize: video.metadata?.content_length_text || '',
            hasAudio: true,
          });
        }
      }
    }

    // Add regular videos - separate AV1 from H.264
    for (const video of regularVideos) {
      const label = video.label || video.metadata?.quality_label || '';
      const qualityLabel = label.includes('p') ? label : `${label}p`;
      const mimeType = video.metadata?.mime_type || '';
      const hasAudio = mimeType.includes('mp4a');
      const isAV1 = mimeType.includes('av01') || mimeType.includes('av1');
      
      if (isAV1) {
        // Add to AV1 qualities if has audio or not already present
        if (hasAudio && !av1Qualities.some(q => q.quality === qualityLabel)) {
          av1Qualities.push({
            url: video.url || '',
            quality: qualityLabel,
            fileSize: video.metadata?.content_length_text || '',
            hasAudio: true,
          });
        }
      } else {
        // Only add if not already added from renderable and HAS AUDIO
        if (hasAudio && !videoQualities.some(q => q.quality === qualityLabel)) {
          videoQualities.push({
            url: video.url || '',
            quality: qualityLabel,
            fileSize: video.metadata?.content_length_text || '',
            hasAudio: true,
          });
        }
      }
    }

    // Sort videos by quality (highest first)
    const qualityOrder: Record<string, number> = {
      '8640p': 8640, '4320p': 4320, '4320p60': 4320,
      '2160p': 2160, '2160p60': 2160, '1440p': 1440, '1440p60': 1440,
      '1080p': 1080, '1080p60': 1080, '720p': 720, '720p60': 720,
      '480p': 480, '360p': 360, '240p': 240, '144p': 144,
    };
    
    const sortByQuality = (arr: QualityOption[]) => {
      arr.sort((a, b) => {
        const aOrder = qualityOrder[a.quality] || 0;
        const bOrder = qualityOrder[b.quality] || 0;
        return bOrder - aOrder;
      });
    };
    
    sortByQuality(videoQualities);
    sortByQuality(av1Qualities);

    console.log('Final videoQualities:', videoQualities);
    console.log('Final av1Qualities:', av1Qualities);

    // Get download URL based on selection
    let downloadUrl = '';
    let quality = '';
    let fileSize = '';

    // Determine which qualities array to use based on format
    const targetQualities = format === 'mp3' 
      ? audioQualities 
      : format === 'av1' 
        ? av1Qualities 
        : videoQualities;

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
      // For MP4 and AV1, find selected quality
      const qualitiesToSearch = format === 'av1' ? av1Qualities : videoQualities;
      const selected = selectedQuality
        ? qualitiesToSearch.find(q => q.quality === selectedQuality)
        : qualitiesToSearch[0];
      
      if (selected) {
        console.log('Selected quality:', selected);
        
        // Find the corresponding renderable video first (has audio)
        const isAV1Format = format === 'av1';
        const renderable = renderableVideos.find((v: any) => {
          const vLabel = v.label || v.metadata?.quality_label || '';
          const vQuality = vLabel.includes('p') ? vLabel : `${vLabel}p`;
          const mimeType = v.metadata?.mime_type || '';
          const videoIsAV1 = mimeType.includes('av01') || mimeType.includes('av1');
          return vQuality === selected.quality && (isAV1Format ? videoIsAV1 : !videoIsAV1);
        });
        
        if (renderable?.renderConfig?.executionUrl) {
          // Trigger render and get download URL
          console.log('Calling render URL:', renderable.renderConfig.executionUrl);
          try {
            const renderResponse = await fetch(renderable.renderConfig.executionUrl, {
              method: 'GET',
            });
            const renderData = await renderResponse.json();
            console.log('Render response:', JSON.stringify(renderData, null, 2));
            
            if (renderData.downloadUrl || renderData.url) {
              downloadUrl = renderData.downloadUrl || renderData.url;
              console.log('Got merged download URL:', downloadUrl);
            }
          } catch (renderError) {
            console.error('Render error:', renderError);
          }
        }
        
        // Fallback: Only use regular video if it has audio (progressive format)
        if (!downloadUrl) {
          const regularWithAudio = regularVideos.find((v: any) => {
            const vLabel = v.label || v.metadata?.quality_label || '';
            const vQuality = vLabel.includes('p') ? vLabel : `${vLabel}p`;
            const mimeType = v.metadata?.mime_type || '';
            const videoIsAV1 = mimeType.includes('av01') || mimeType.includes('av1');
            return vQuality === selected.quality && mimeType.includes('mp4a') && (isAV1Format ? videoIsAV1 : !videoIsAV1);
          });
          
          if (regularWithAudio?.url) {
            downloadUrl = regularWithAudio.url;
            console.log('Using progressive format with audio:', downloadUrl);
          } else {
            console.log('No video with audio available for quality:', selected.quality);
          }
        }
        
        quality = selected.quality;
        fileSize = selected.fileSize || '';
      }
    }

    // Parse duration - can be string "HH:MM:SS" or number in seconds
    let duration = 0;
    const rawDuration = metadata.additionalData?.duration;
    if (rawDuration) {
      if (typeof rawDuration === 'number') {
        duration = rawDuration;
      } else if (typeof rawDuration === 'string') {
        const parts = rawDuration.split(':').map(Number);
        if (parts.length === 3) {
          duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          duration = parts[0] * 60 + parts[1];
        }
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
      availableQualities: format === 'mp3' ? audioQualities : format === 'av1' ? av1Qualities : videoQualities,
      hasVideoOnlyWarning: (format === 'av1' ? av1Qualities : videoQualities).some(v => !v.hasAudio),
    });

  } catch (error) {
    console.error('Download API error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
