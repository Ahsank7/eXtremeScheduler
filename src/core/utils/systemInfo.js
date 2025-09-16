// Utility functions to capture browser and system information

export const getSystemInfo = () => {
  try {
    const userAgent = navigator.userAgent;
    
    return {
      userAgent: userAgent,
      browserName: getBrowserName(userAgent),
      browserVersion: getBrowserVersion(userAgent),
      operatingSystem: getOperatingSystem(userAgent),
      deviceType: getDeviceType(userAgent),
      screenResolution: getScreenResolution(),
      timezone: getTimezone(),
      language: getLanguage(),
      country: getCountry(),
      city: getCity()
    };
  } catch (error) {
    console.error('Error getting system info:', error);
    return {
      userAgent: navigator.userAgent || 'Unknown',
      browserName: 'Unknown',
      browserVersion: 'Unknown',
      operatingSystem: 'Unknown',
      deviceType: 'Unknown',
      screenResolution: 'Unknown',
      timezone: 'Unknown',
      language: 'Unknown',
      country: 'Unknown',
      city: 'Unknown'
    };
  }
};

const getBrowserName = (userAgent) => {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'Internet Explorer';
  return 'Unknown';
};

const getBrowserVersion = (userAgent) => {
  try {
    if (userAgent.includes('Chrome')) {
      const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    }
    if (userAgent.includes('Firefox')) {
      const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    }
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      const match = userAgent.match(/Version\/(\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    }
    if (userAgent.includes('Edge')) {
      const match = userAgent.match(/Edge\/(\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    }
    if (userAgent.includes('MSIE')) {
      const match = userAgent.match(/MSIE (\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    }
    return 'Unknown';
  } catch {
    return 'Unknown';
  }
};

const getOperatingSystem = (userAgent) => {
  if (userAgent.includes('Windows')) {
    if (userAgent.includes('Windows NT 10.0')) return 'Windows 10/11';
    if (userAgent.includes('Windows NT 6.3')) return 'Windows 8.1';
    if (userAgent.includes('Windows NT 6.2')) return 'Windows 8';
    if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
    if (userAgent.includes('Windows NT 6.0')) return 'Windows Vista';
    if (userAgent.includes('Windows NT 5.2')) return 'Windows Server 2003';
    if (userAgent.includes('Windows NT 5.1')) return 'Windows XP';
    return 'Windows';
  }
  if (userAgent.includes('Mac OS X')) {
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
    if (match) {
      const version = match[1].replace('_', '.');
      return `macOS ${version}`;
    }
    return 'macOS';
  }
  if (userAgent.includes('Linux')) {
    if (userAgent.includes('Ubuntu')) return 'Ubuntu Linux';
    if (userAgent.includes('Fedora')) return 'Fedora Linux';
    if (userAgent.includes('CentOS')) return 'CentOS Linux';
    if (userAgent.includes('Debian')) return 'Debian Linux';
    return 'Linux';
  }
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    const match = userAgent.match(/OS (\d+[._]\d+)/);
    if (match) {
      const version = match[1].replace('_', '.');
      return `iOS ${version}`;
    }
    return 'iOS';
  }
  if (userAgent.includes('Android')) {
    const match = userAgent.match(/Android (\d+\.\d+)/);
    if (match) return `Android ${match[1]}`;
    return 'Android';
  }
  return 'Unknown';
};

const getDeviceType = (userAgent) => {
  if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    return 'Mobile';
  }
  if (userAgent.includes('Tablet')) {
    return 'Tablet';
  }
  return 'Desktop';
};

const getScreenResolution = () => {
  try {
    return `${window.screen.width}x${window.screen.height}`;
  } catch {
    return 'Unknown';
  }
};

const getTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Unknown';
  }
};

const getLanguage = () => {
  try {
    return navigator.language || navigator.userLanguage || 'Unknown';
  } catch {
    return 'Unknown';
  }
};

const getCountry = () => {
  try {
    // This is a basic implementation - in a real app you might use a geolocation service
    return 'Unknown';
  } catch {
    return 'Unknown';
  }
};

const getCity = () => {
  try {
    // This is a basic implementation - in a real app you might use a geolocation service
    return 'Unknown';
  } catch {
    return 'Unknown';
  }
};
