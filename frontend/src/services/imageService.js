// src/services/imageService.js
const extractGoogleDriveFileId = (url) => {
    if (!url) return null;

    try {
        const urlObj = new URL(url);
        if (!urlObj.hostname.includes('drive.google.com')) return null;

        // Handle different Google Drive URL formats
        if (url.includes('/file/d/')) {
            const matches = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            return matches?.[1] || null;
        }

        if (url.includes('id=')) {
            const id = urlObj.searchParams.get('id');
            return id || null;
        }

        return null;
    } catch {
        return null;
    }
};

const getGoogleDriveImageUrl = (url) => {
    const fileId = extractGoogleDriveFileId(url);
    if (!fileId) return url;

    // Use the direct download URL format
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
};

const ImageService = {
    getImageUrl: (url) => {
        if (!url) return '';

        try {
            // Handle Google Drive URLs
            if (url.includes('drive.google.com')) {
                return getGoogleDriveImageUrl(url);
            }

            // Return original URL for other sources
            return url;
        } catch {
            return url;
        }
    },
};

export default ImageService;
