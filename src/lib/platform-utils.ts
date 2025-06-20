export function getPlatform() {
  if (typeof window === 'undefined') return 'server';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() || '';
  
  // Check for mobile devices first
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return 'mobile';
  }
  
  // Check for Mac
  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'mac';
  }
  
  // Check for Windows
  if (platform.includes('win') || userAgent.includes('win')) {
    return 'windows';
  }
  
  // Check for Linux
  if (platform.includes('linux') || userAgent.includes('linux')) {
    return 'linux';
  }
  
  return 'unknown';
}

export function getSubmitShortcutKey() {
  const platform = getPlatform();
  
  switch (platform) {
    case 'mac':
      return '⌘';
    case 'windows':
    case 'linux':
      return 'Ctrl';
    case 'mobile':
    case 'server':
    case 'unknown':
      return null;
  }
}

export function getSubmitShortcutText() {
  const key = getSubmitShortcutKey();
  if (!key) return null;
  
  return `${key}+Enter`;
}

export function isSubmitShortcut(event: KeyboardEvent) {
  const platform = getPlatform();
  
  if (event.key !== 'Enter') return false;
  
  switch (platform) {
    case 'mac':
      return event.metaKey && !event.shiftKey && !event.altKey && !event.ctrlKey;
    case 'windows':
    case 'linux':
      return event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey;
    default:
      return false;
  }
}