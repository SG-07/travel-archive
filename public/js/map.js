// Wait until DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get lat/lng from HTML data attributes
  const mapDiv = document.getElementById('map');
  const lat = parseFloat(mapDiv.dataset.lat);
  const lng = parseFloat(mapDiv.dataset.lng);

  // Initialize the map
  const map = L.map('map').setView([lat, lng], 13);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Add a marker
  L.marker([lat, lng]).addTo(map)
    .bindPopup('Listing Location')
    .openPopup();


  // ✅ Fix for responsiveness
  setTimeout(() => {
    map.invalidateSize();
  }, 100); // Ensure container size is calculated after rendering
});
