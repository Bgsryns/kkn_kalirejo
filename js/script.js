// Inisialisasi objek peta Leaflet
var map = L.map("map").setView([-7.136944, 110.423611], 16);

// Definisi Layer Peta Dasar
var satelliteLayer = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles &copy; Esri" }
);
var osmLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

osmLayer.addTo(map);

var baseLayers = {
  OpenStreetMap: osmLayer,
  "Citra Satelit": satelliteLayer,
};

// Definisi Layer UMKM
var umkmLayers = {};
if (typeof umkmData !== "undefined" && umkmData.length > 0) {
  umkmData.forEach(function (umkm) {
    if (!umkm.type) {
      umkm.type = "Lain-lain";
    }
    if (!umkmLayers[umkm.type]) {
      umkmLayers[umkm.type] = L.layerGroup();
      umkmLayers[umkm.type].addTo(map);
    }
    L.marker(umkm.coordinates)
      .bindPopup(`<b>${umkm.name}</b><br>${umkm.description}`)
      .addTo(umkmLayers[umkm.type]);
  });
}

// Struktur untuk Kelompok Overlay
var groupedOverlays = {
  "Lokasi UMKM": umkmLayers,
};

// Opsi Kontrol Layer
var options = {
  groupCheckboxes: true,
  position: "topright",
};

// Tambahkan Kontrol Layer ke Peta
var layerControl = L.control
  .groupedLayers(baseLayers, groupedOverlays, options)
  .addTo(map);

/* =================================================================== */
/* ===== KODE BARU v3: PENDEKATAN PALING KUAT UNTUK CLICK-TOGGLE ===== */
/* =================================================================== */

var container = layerControl.getContainer();

// 1. Secara paksa hentikan SEMUA event 'hover' pada container
//    e.stopImmediatePropagation() akan memblokir listener bawaan Leaflet.
container.addEventListener("mouseenter", function (e) {
  e.stopImmediatePropagation();
});
container.addEventListener("mouseleave", function (e) {
  e.stopImmediatePropagation();
});

// 2. Tambahkan logika klik pada tombol toggle
var toggleButton = container.querySelector(".leaflet-control-layers-toggle");
if (toggleButton) {
  // Hapus event listener lama jika ada untuk menghindari duplikasi
  toggleButton.removeEventListener("click", toggleFunction);
  // Tambahkan event listener yang baru
  toggleButton.addEventListener("click", toggleFunction);
}

function toggleFunction(e) {
  // Hentikan event agar tidak 'merembet'
  e.stopPropagation();
  e.preventDefault();
  // Buka-tutup panel secara manual
  container.classList.toggle("leaflet-control-layers-expanded");
}

// 3. Tambahan: Tutup panel jika mengklik peta
map.on("click", function () {
  if (container.classList.contains("leaflet-control-layers-expanded")) {
    container.classList.remove("leaflet-control-layers-expanded");
  }
});

// Fungsionalitas Tombol "Temukan Lokasi Saya"
document.getElementById("locate-me-btn").addEventListener("click", function () {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        if (window.userLocationMarker) {
          map.removeLayer(window.userLocationMarker);
        }
        window.userLocationMarker = L.marker([lat, lon])
          .addTo(map)
          .bindPopup("<b>Lokasi Anda</b>")
          .openPopup();
        map.setView([lat, lon], 15);
      },
      function () {
        alert("Tidak bisa mendapatkan lokasi Anda.");
      }
    );
  } else {
    alert("Browser Anda tidak mendukung Geolocation.");
  }
});
