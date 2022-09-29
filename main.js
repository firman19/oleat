const map = L.map("map").setView([51.505, -0.09], 13);
const markers = [];
const polyline = [];

const elmtEditWrapper = (i) => `<div class="edit-wrapper mb-2">
<div>
Marker ${i}
</div>
<input type="text" class="edit-content" />
<button class="btn btn-outline-primary save-content d-none">Simpan</button>
</div>`;

const _icon = L.icon({
  iconUrl: "aim.png",
  iconSize: [26, 26], // size of the icon
  iconAnchor: [13, 13], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -10], // point from which the popup should open relative to the iconAnchor
});

function initMap() {
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);
}

function onMapClick(e) {
  const m = L.marker(e.latlng, {
    draggable: true,
    icon: _icon,
  });
  m.on("drag", (e) => {
    updatePolyLines();
  });
  m.bindPopup();
  m.addTo(map);

  $(".wrapper").append(elmtEditWrapper(markers.length + 1));

  markers.push(m);
  createPolyLines();
  if (markers.length > 1) $(".delete-last-marker").prop("disabled", false);
}

function createPolyLines() {
  let lines = [];
  markers.forEach((e) => {
    lines.push(e.getLatLng());
  });
  polyline.push(L.polyline(lines, { color: "red" }).addTo(map));
}

function updatePolyLines() {
  if (polyline) {
    try {
      polyline.forEach(function (item) {
        map.removeLayer(item);
      });
      createPolyLines();
    } catch (e) {
      console.log("problem " + e);
    }
  }
}

function resetAll() {
  $(".wrapper").children().remove();

  // remove markers
  markers.forEach((marker) => {
    map.removeLayer(marker);
  });
  markers.length = 0;

  // remove polyline
  polyline.forEach((e) => {
    map.removeLayer(e);
  });
  polyline.length = 0;
}

function loadData() {
  $.get("data.json", function (data, status) {
    drawObjects(data);
  });
}

function drawObjects(latlngs) {
  // draw markers
  latlngs.forEach((latlng) => {
    const m = L.marker(latlng, { icon: _icon });
    m.bindPopup(latlng.data);
    m.addTo(map);
  });
  // draw lines
  L.polyline(latlngs, { color: "black" }).addTo(map);
}

initMap();
loadData();

map.on("click", onMapClick);

$(".delete-last-marker").on("click", function (e) {
  const len = markers.length;
  if (len > 1) {
    const last = len - 1;
    // remove last marker
    map.removeLayer(markers[last]);

    // update array
    markers.pop();
    if (markers.length <= 1) e.target.disabled = true;

    // update polylines
    updatePolyLines();

    $(".wrapper").children().last().remove();
  }
});

$(".save-marker").on("click", function (e) {
  for (let i = 0; i < markers.length; i++) {
    const currVal = $(".edit-content").eq(i).val();
    markers[i].bindPopup(currVal);
  }

  let data = markers.map((marker) => {
    return {
      ...marker.getLatLng(),
      data: marker.getPopup().getContent() ?? null,
    };
  });
  console.log(data);

  resetAll();
});

$(".cancel-marker").on("click", function (e) {
  resetAll();
});

$(document).on("click", ".save-content", function (e) {
  var i = $(".save-content").index(this);
  const val = $(this).closest(".edit-wrapper").find(".edit-content").val();
  markers[i].bindPopup(val);
});
