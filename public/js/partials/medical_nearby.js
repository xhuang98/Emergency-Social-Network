
/** **************** Medical Nearby Logics ******************/
const medicalNearbyModal = new bootstrap.Modal('#medicalNearbyModal', {
  keyboard: false
});
const capacityTexts = { green: '0%-30%', yellow: '30%-50%', orange: '50%-70%', red: '70%-100%' };
const getMapBoxLocation = async (addressInput) => {
  if (!addressInput) {
    return null;
  }
  const response = await $.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${addressInput}.json?access_token=${mapboxToken}`);
  if (response.features.length) {
    return response.features[0];
  }
};

let MPsearchResults = [];
let MPview = 'list';
let currentCapacity;
let currentMedicalProvider;
let userLocation = null;
const handleMedicalNearbyModalCloseButtonClick = () => { // eslint-disable-line no-unused-vars
  MPsearchResults = [];
  MPview = 'list';
  currentCapacity = null;
  currentMedicalProvider = null;
  userLocation = null;
  $(".mp-list-container").empty();
};

const handleMedicalNearby = async () => { // eslint-disable-line no-unused-vars
  medicalNearbyModal.show();
  handleMedicalNearbyLoad();
};

const handleMedicalNearbyLoad = async () => {
  const loaderWrapper = $(".mp-list-loader-wrapper");
  loaderWrapper.show();
  $('.medical-nearby-list').removeClass("d-none");
  $('.medical-nearby-map').addClass("d-none");
  $('.medical-nearby-edit').addClass("d-none");
  $('.medical-nearby-info').addClass("d-none");
  if (navigator.geolocation) {
    try {
      const location = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      if (location) {
        userLocation = [location.coords.longitude, location.coords.latitude];
        body = { searchType: "location", query: userLocation };
        MPsearchResults = await authorizedPost('/medical-providers/search', JSON.stringify(body), '', token);
        renderMedicalProvidersList(MPsearchResults);
      }
    } catch (e) {
      showMedicalProvidersListError("Location unavailable - Please search manually");
    }
  } else {
    showMedicalProvidersListError("Location unavailable - Please search manually");
  }
  loaderWrapper.hide();
};

const handleMPSearchButtonClick = async () => { // eslint-disable-line no-unused-vars
  // mapbox: address -> coordinates
  const searchInput = $('#mp-search-input-text').val();
  const criteria = $('#mp-search-criteria').val();
  if (searchInput) {
    await handleMPsearch(searchInput, criteria);
  } else {
    handleMedicalNearbyLoad();
  }
};

const handleMPsearch = async (searchInput, criteria) => {
  const token = window.localStorage.getItem('jwttoken');
  const loaderWrapper = $(".mp-list-loader-wrapper");
  loaderWrapper.show();
  let body;
  if (criteria === 2) {
    body = { searchType: "name", query: searchInput };
    MPsearchResults = await authorizedPost('/medical-providers/search', JSON.stringify(body), '', token);
    renderMedicalProvidersList(MPsearchResults);
  } else {
    const location = await getMapBoxLocation(searchInput);
    if (location) {
      userLocation = location.center;
      body = { searchType: "location", query: userLocation };
      MPsearchResults = await authorizedPost('/medical-providers/search', JSON.stringify(body), '', token);
      renderMedicalProvidersList(MPsearchResults);
    } else {
      showMedicalProvidersListError("Address not recognized");
    }
  }
  loaderWrapper.hide();
};

const handleMPToggleToMapView = async () => {
  const loaderWrapper = $(".mp-map-loader-wrapper");
  loaderWrapper.show();
  $(".modal-content").scrollTop(0);
  $('.medical-nearby-map').removeClass("d-none");
  $(".medical-nearby-map-container").empty();
  renderMedicalProvidersMap(MPsearchResults, userLocation);
  $('.medical-nearby-list').addClass("d-none");
  MPview = 'map';
  loaderWrapper.hide();
};

const handleMPToggleToListView = async () => {
  const loaderWrapper = $(".mp-list-loader-wrapper");
  loaderWrapper.show();
  $(".modal-content").scrollTop(0);
  $('.medical-nearby-list').removeClass("d-none");
  renderMedicalProvidersList(MPsearchResults);
  $('.medical-nearby-map').addClass("d-none");
  MPview = 'list';
  loaderWrapper.hide();
};

const handleMPInfoClick = async (id) => {
  $(".modal-content").scrollTop(0);
  const listContainer = $(".mp-list-container");
  listContainer.empty();
  if (id) {
    currentMedicalProvider = MPsearchResults.find(({ _id }) => _id === id);
  }
  const medicalProvider = currentMedicalProvider;
  $('#mp-info-name').html(medicalProvider.name);
  $('#mp-info-capacity-indicator').html(`
    <div class="capacity-${medicalProvider.capacity}"></div>
  `);
  $('#mp-info-capacity-indicator-text').html(capacityTexts[medicalProvider.capacity]);
  $('#mp-info-intro').html(medicalProvider.introduction);
  $('#mp-info-address').html(medicalProvider.address);
  $('#mp-info-phone').html(medicalProvider.phone);
  $('#mp-info-notes').html(medicalProvider.notes);
  const editTime = moment(medicalProvider.editTime).format("MM.DD.YYYY, h:mm A");
  $('#mp-info-last-updated').html("Last updated: " + editTime);

  $('.medical-nearby-info').removeClass("d-none");
  $('.medical-nearby-list').addClass("d-none");
  $('.medical-nearby-map').addClass("d-none");
  $('.medical-nearby-edit').addClass("d-none");
};

const handleCapacityClick = async (color) => {
  if (currentCapacity) {
    $('.capacity-' + currentCapacity).removeClass('capacity-chosen');
  }
  console.log(currentCapacity + '->' + color);
  currentCapacity = color;
  $('.capacity-' + currentCapacity).addClass('capacity-chosen');
};

const handleMPInfoBackClick = async () => { // eslint-disable-line no-unused-vars
  currentMedicalProvider = null;
  $('.medical-nearby-info').addClass("d-none");
  if (MPsearchResults.length) {
    if (MPview === 'list') {
      handleMPToggleToListView();
    } else {
      handleMPToggleToMapView();
    }
  } else {
    // info updated -> reset search
    handleMedicalNearbyLoad();
  }
};

const handleEditInfoClick = async () => { // eslint-disable-line no-unused-vars
  $('#mp-edit-info-name').val('');
  $('#mp-edit-info-intro').val('');
  $('#mp-edit-info-address').val('');
  $('#mp-edit-info-phone').val('');
  $('#mp-edit-info-notes').val('');
  $('.capacity-green').removeClass('capacity-chosen');
  $('.capacity-yellow').removeClass('capacity-chosen');
  $('.capacity-orange').removeClass('capacity-chosen');
  $('.capacity-red').removeClass('capacity-chosen');

  const medicalProvider = currentMedicalProvider;
  $('.medical-nearby-edit').removeClass("d-none");
  $(".medical-nearby-edit-error").html('');
  if (medicalProvider) {
    $('.mp-delete').show();
    $('.medical-nearby-info').addClass("d-none");
    handleCapacityClick(medicalProvider.capacity);
    $('#mp-edit-info-name').val(medicalProvider.name);
    $('#mp-edit-info-intro').val(medicalProvider.introduction);
    $('#mp-edit-info-address').val(medicalProvider.address);
    $('#mp-edit-info-phone').val(medicalProvider.phone);
    $('#mp-edit-info-notes').val(medicalProvider.notes);
  } else {
    $('.mp-delete').hide();
    currentCapacity = undefined;
    $('.medical-nearby-list').addClass("d-none");
  }
};

const handleEditInfoSaveClick = async () => { // eslint-disable-line no-unused-vars
  const location = await getMapBoxLocation($('#mp-edit-info-address').val());
  if (!$('#mp-edit-info-name').val()) {
    $(".medical-nearby-edit-error").html("Name cannot be empty.");
  } else if (!location) {
    $(".medical-nearby-edit-error").html("Address is not recognized.");
  } else {
    if (currentMedicalProvider) {
      createMedicalProviderEntry(location);
    } else {
      updateMedicalProviderEntry(location);
    }
  }
};

const createMedicalProviderEntry = async (location) => {
  const token = window.localStorage.getItem('jwttoken');
  const body = {
    id: currentMedicalProvider._id,
    name: $('#mp-edit-info-name').val(),
    capacity: currentCapacity,
    introduction: $('#mp-edit-info-intro').val(),
    longitude: location.center[0],
    latitude: location.center[1],
    address: location.place_name,
    phone: $('#mp-edit-info-phone').val(),
    notes: $('#mp-edit-info-notes').val()
  };
  const response = await authorizedPut('/medical-providers/' + currentMedicalProvider._id, JSON.stringify(body), '', token);
  if (!response.error) {
    handleEditSuccess(body, response);
  } else {
    // if update failed, show prompt
    $(".medical-nearby-edit-error").html("Save failed. Please try again another time.");
  }
};

const updateMedicalProviderEntry = async (location) => {
  const token = window.localStorage.getItem('jwttoken');
  const body = {
    name: $('#mp-edit-info-name').val(),
    capacity: currentCapacity,
    introduction: $('#mp-edit-info-intro').val(),
    longitude: location.center[0],
    latitude: location.center[1],
    address: location.place_name,
    phone: $('#mp-edit-info-phone').val(),
    notes: $('#mp-edit-info-notes').val()
  };
  const response = await authorizedPost('/medical-providers', JSON.stringify(body), '', token);
  if (!response.error) {
    handleEditSuccess(body, response);
  } else {
    // if update failed, show prompt
    $(".medical-nearby-edit-error").html("Save failed. Please try again another time.");
  }
};

const handleEditSuccess = (body, response) => {
  $('.medical-nearby-edit').addClass("d-none");
  currentCapacity = undefined;
  MPsearchResults = []; // search outdated
  body._id = response._id;
  currentMedicalProvider = body;
  handleMPInfoClick();
  $(".medical-nearby-edit-error").html('');
};

const handleEditInfoBackClick = async () => { // eslint-disable-line no-unused-vars
  $('#mp-edit-info-name').val('');
  $('#mp-edit-info-intro').val('');
  $('#mp-edit-info-address').val('');
  $('#mp-edit-info-phone').val('');
  $('#mp-edit-info-notes').val('');
  currentCapacity = undefined;
  if (currentMedicalProvider) {
    handleMPInfoClick();
  } else {
    $('.medical-nearby-list').removeClass("d-none");
    $('.medical-nearby-edit').addClass("d-none");
  }
};

const handleDeleteClick = async () => { // eslint-disable-line no-unused-vars
  $(".modal-content").scrollTop(0);
  const token = window.localStorage.getItem('jwttoken');
  await authorizedDelete('/medical-providers/' + currentMedicalProvider._id, '', token);
  $('.medical-nearby-edit').addClass("d-none");
  // reset search
  handleMedicalNearbyLoad();
};

const appendMedicalProvidersToListContainer = (medicalProviders, listContainer) => {
  for (const mp of medicalProviders) {
    let distance = '';
    if (mp.distance) {
      distance = Math.round(mp.distance).toString() + 'km';
    }
    listContainer.append(
      `
        <div class='mp-card' onclick='handleMPInfoClick(${JSON.stringify(mp._id)})'>
          <div class='mp-card-header'> 
            <div class='mp-name'>${mp.name}</div>
          </div>
          <div class='mp-card-detail'>
            <div class='mp-card-distance'>${distance}</div>
            <div class='mp-card-capacity'>
              <div class='mp-card-capacity-text'>
                Capacity:&nbsp;&nbsp;&nbsp;<br>${capacityTexts[mp.capacity]}
              </div>
              <div class='capacity-${mp.capacity}'></div>
            </div>
          </div>
        </div>
      `
    );
  }
};

const renderMedicalProvidersList = (medicalProviders) => {
  showMedicalProvidersListError('');
  showMedicalProvidersMapError('');
  const listContainer = $(".mp-list-container");
  listContainer.empty();
  if (medicalProviders.length) {
    appendMedicalProvidersToListContainer(medicalProviders, listContainer);
  } else {
    showMedicalProvidersListError("No results found");
  }
};

const showMedicalProvidersListError = (message) => {
  const listContainer = $(".mp-list-container");
  listContainer.empty();
  listContainer.append(`<div class='mp-list-error'>${message}</div>`);
};

const showMedicalProvidersMapError = (message) => {
  const messageContainer = $(".medical-nearby-map-message");
  messageContainer.empty();
  messageContainer.append(`<div class='mp-map-error'>${message}</div>`);
};

const renderMedicalProvidersMap = (medicalProviders, curCoords = null) => {
  mapboxgl.accessToken = mapboxToken;
  if (!medicalProviders.length) {
    showMedicalProvidersMapError("No results found");
  } else {
    try {
      const map = new mapboxgl.Map({
        container: 'medical-nearby-map-container', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: getCenter(curCoords, medicalProviders),
        zoom: 12 // starting zoom
      });
      map.on('style.load', () => { map.setFog({}); });
      if (curCoords) {
        renderMapMarker(map, 'map-marker-person bi bi-person-fill', 'You', curCoords);
      }
      for (const mp of medicalProviders) {
        const marker = renderMapMarker(map, 'capacity-' + mp.capacity, mp.name, [mp.longitude, mp.latitude]);
        marker.on('click', () => {
          currentMedicalProvider = mp;
          handleMPInfoClick();
        });
      }
    } catch (e) {
      showMedicalProvidersMapError(e);
    }
  }
};

const getCenter = (curCoords, medicalProviders) => {
  if (!curCoords) {
    // take average of all coordinates as center
    longitudeSum = 0;
    latitudeSum = 0;
    for (const mp of medicalProviders) {
      longitudeSum += mp.longitude;
      latitudeSum += mp.latitude;
    }
    return [
      longitudeSum / medicalProviders.length,
      latitudeSum / medicalProviders.length
    ];
  }
  return curCoords;
};

const renderMapMarker = (map, markerClass, markerlabel, coords) => {
  const markerContainer = $("<div></div>");
  const marker = $("<div></div>");
  const label = $("<div></div>");
  label.html(markerlabel);
  label.addClass('map-marker-label');
  marker.addClass(markerClass);
  markerContainer.append(label);
  markerContainer.append(marker);
  new mapboxgl.Marker(markerContainer[0])
    .setLngLat(coords)
    .addTo(map);
  return marker;
};
