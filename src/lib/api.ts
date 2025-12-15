export interface DownloadResponse {
  success: boolean;
  title?: string;
  thumbnail?: string;
  duration?: number;
  channel?: string;
  downloadUrl?: string;
  quality?: string;
  fileSize?: string;
  format?: string;
  error?: string;
}

export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const downloadVideo = async (
  videoUrl: string,
  format: 'mp3' | 'mp4'
): Promise<DownloadResponse> => {
  const videoId = extractVideoId(videoUrl);

  if (!videoId) {
    return { success: false, error: 'Invalid YouTube URL' };
  }

  try {
    const response = await fetch('/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoId, format }),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { 
        success: false, 
        error: 'API no disponible. Despliega en Vercel para descargar.' 
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Error al procesar el video' };
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
};

export const triggerDownload = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
