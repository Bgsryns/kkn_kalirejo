document.addEventListener("DOMContentLoaded", function () {
  var map = L.map("map").setView([-7.133762, 110.421973], 16);
  var osmLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);
  var satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "Tiles &copy; Esri" }
  );
  var baseLayers = { OpenStreetMap: osmLayer, "Citra Satelit": satelliteLayer };
  var layerControl = L.control
    .layers(baseLayers, null, { collapsed: true })
    .addTo(map);
  var container = layerControl.getContainer();
  container.addEventListener("mouseenter", function (e) {
    e.stopImmediatePropagation();
  });
  container.addEventListener("mouseleave", function (e) {
    e.stopImmediatePropagation();
  });
  var toggleButton = container.querySelector(".leaflet-control-layers-toggle");
  function toggleFunction(e) {
    e.stopPropagation();
    e.preventDefault();
    container.classList.toggle("leaflet-control-layers-expanded");
  }
  if (toggleButton) {
    toggleButton.addEventListener("click", toggleFunction);
  }
  map.on("click", function () {
    if (container.classList.contains("leaflet-control-layers-expanded")) {
      container.classList.remove("leaflet-control-layers-expanded");
    }
  });

  function showSidebarWithData(umkm) {
    document.getElementById("sidebar-image").src = umkm.foto || "";
    document.getElementById("sidebar-title").textContent =
      umkm.name || "Tidak ada judul";
    document.getElementById("sidebar-address").textContent =
      umkm.alamat || "Tidak tersedia";
    document.getElementById("sidebar-description").textContent =
      umkm.description || "Tidak ada deskripsi.";

    // Menampilkan data baru
    document.getElementById("sidebar-hours").textContent =
      umkm.jam_operasional || "Tidak tersedia";
    document.getElementById("sidebar-price").textContent =
      umkm.kisaran_harga || "Tidak tersedia";
    document.getElementById("sidebar-payment").textContent =
      umkm.pembayaran || "Tidak tersedia";

    // Logika untuk menampilkan Menu Unggulan
    const menuList = document.getElementById("sidebar-menu");
    const menuSection = document.getElementById("menu-section");
    menuList.innerHTML = ""; // Kosongkan daftar menu sebelumnya
    if (umkm.menu_unggulan && umkm.menu_unggulan.length > 0) {
      umkm.menu_unggulan.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        menuList.appendChild(li);
      });
      menuSection.style.display = "block"; // Tampilkan seksi menu
    } else {
      menuSection.style.display = "none"; // Sembunyikan jika tidak ada menu
    }

    const waLink = document.getElementById("sidebar-whatsapp");
    const igLink = document.getElementById("sidebar-instagram");
    waLink.href = umkm.whatsapp ? `https://wa.me/${umkm.whatsapp}` : "#";
    waLink.style.display = umkm.whatsapp ? "flex" : "none";
    igLink.href = umkm.instagram
      ? `https://instagram.com/${umkm.instagram}`
      : "#";
    igLink.style.display = umkm.instagram ? "flex" : "none";

    document.body.classList.add("sidebar-open");
  }

  const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener("click", function () {
      document.body.classList.remove("sidebar-open");
    });
  }

  if (typeof umkmData !== "undefined" && umkmData.length > 0) {
    umkmData.forEach(function (umkm) {
      L.marker(umkm.coordinates)
        .addTo(map)
        .on("click", function () {
          showSidebarWithData(umkm);
        });
    });
  }

  const locateBtn = document.getElementById("locate-me-btn");
  if (locateBtn) {
    locateBtn.addEventListener("click", function () {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var lat = position.coords.latitude;
          var lon = position.coords.longitude;
          if (window.userLocationMarker)
            map.removeLayer(window.userLocationMarker);
          window.userLocationMarker = L.marker([lat, lon])
            .addTo(map)
            .bindPopup("<b>Lokasi Anda</b>")
            .openPopup();
          map.setView([lat, lon], 15);
        });
      } else {
        alert("Browser Anda tidak mendukung Geolocation.");
      }
    });
  }
});
