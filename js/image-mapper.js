// Loads media/images.json and replaces img[src] for elements with data-img keys.
(async function() {
  try {
    const res = await fetch('media/images.json', { cache: 'no-store' });
    if (!res.ok) {
      console.warn('image-mapper: images.json not found or failed to load');
      return;
    }
    const map = await res.json();

    // Replace images that declare a data-img key
    document.querySelectorAll('img[data-img]').forEach(img => {
      const key = img.getAttribute('data-img');
      if (key && map[key]) {
        img.src = map[key];
      } else if (img.dataset.fallback) {
        img.src = img.dataset.fallback;
      } else if (map.default) {
        img.src = map.default;
      }
    });
  } catch (err) {
    console.error('image-mapper error', err);
  }
})();
