// media-gallery.js
// Dynamically injects a media gallery (images, screenshots, videos) based on the current page.

const mediaGalleryData = {
  // Key: page identifier (filename without extension)
  'bone-breaking': [
    { type: 'image', src: 'media/bone-breaking-1.jpg', alt: 'Bone Breaking spell in action' },
    { type: 'image', src: 'media/bone-breaking-2.png', alt: 'Bone Mage casting' },
    { type: 'video', src: 'media/bone-breaking-demo.mp4', alt: 'Bone Breaking demonstration', poster: 'media/bone-breaking-thumb.jpg' },
    { type: 'screenshot', src: 'media/bone-breaking-ui.png', alt: 'Bone Breaking UI screenshot' }
  ],
  // Add more pages as needed
};

function getPageKey() {
  // Use the filename (without extension) as the key
  const path = window.location.pathname;
  const file = path.substring(path.lastIndexOf('/') + 1);
  return file.split('.')[0];
}

function renderMediaGallery() {
  const key = getPageKey();
  const gallery = mediaGalleryData[key];
  const container = document.getElementById('media-gallery');
  if (!container || !gallery) return;

  let html = '<div class="media-gallery-grid">';
  for (const item of gallery) {
    if (item.type === 'image' || item.type === 'screenshot') {
      html += `<div class="media-item"><img src="${item.src}" alt="${item.alt}" loading="lazy"></div>`;
    } else if (item.type === 'video') {
      html += `<div class="media-item"><video controls poster="${item.poster || ''}"><source src="${item.src}" type="video/mp4">Your browser does not support the video tag.</video></div>`;
    }
  }
  html += '</div>';
  container.innerHTML = html;
}

function ensureLoreStylesheet() {
  // Only add if not already present
  if (!document.querySelector('link[href*="css/lore.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/lore.css';
    document.head.appendChild(link);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  ensureLoreStylesheet();
  renderMediaGallery();
});
