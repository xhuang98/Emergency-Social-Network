class PublicWall extends Component {
  constructor () {
    super('public-wall');
  }

  onContainerRegister () {
    this.registerFocusedSocketTopic('public_message', this.appendMessageToPublicMessageWall);
    // To resize the chat textarea automatically (snippet taken from blog)
    onMessageScroll();
  }

  async handlePostMessageButtonClick () {
    await postMessage("#public-message-text", this.sendPublicMessage);
  }

  // By default params is set to 'amount=10', check ../../services/public_messages.js/getLatestMessages()
  async getLatestPublicMessages (amount) {
    const token = window.localStorage.getItem('jwttoken');
    if (!token) {
      return resolve({ valid: false });
    }
    const params = "amount=" + amount;
    return await authorizedGet('/public-messages', params, token);
  }

  async appendMessageToPublicMessageWall (message) {
    if (message.type === "normal") PublicWall.appendNormalMessageToPublicWall(message);
    if (message.type === "medical_alert") await PublicWall.appendMedicalAlertToPublicWall(message);
    const overflow_wrapper = $(".overflow-wrapper");
    overflow_wrapper.scrollTop(overflow_wrapper[0].scrollHeight);
  }

  static appendNormalMessageToPublicWall (message) {
    const formattedTimeStamp = moment(message.timestamp).format("MM.DD.YYYY, h:mm A");
    $(".list-container").append(
      "<div class='public-message-card'>" +
            "<div class='public-message-card-header'> <div class='name'>" + message.user.displayName + "</div> <div class='status'> " + Component.getStatusIcon(message.status) + " </div> </div>" +
            "<div class='public-message-card-message'>" + message.text + "</div>" +
            "<div class='public-message-card-footer'>" + formattedTimeStamp + "</div>" +
            "</div>");
  }

  openMap (lat, long) {
    changeView("map", lat, long);
  }

  async onWay (displayName) {
    await this.sendPublicMessage({ text: `I'm on my way, ${displayName}!` });
  }

  async handleOkay (messageId) {
    const deleted = await authorizedDelete('/public-messages', 'id=' + messageId, token);
    if (deleted.success.acknowledged) {
      $(`#${messageId}-container`)[0].remove();
    }
  }

  static async appendMedicalAlertToPublicWall (message) {
    const curr_user = $(".public-wall-container")[0].id;
    const formattedTimeStamp = moment(message.timestamp).format("MM.DD.YYYY, h:mm A");
    const id = message._id;
    const address = await PublicWall.getAddress(message.user.username);
    if (!address) {
      const messageHTML = PublicWall.getNoMapMedicalAlert(message, curr_user, formattedTimeStamp, id);
      $(".list-container").append(messageHTML);
      return;
    }
    const address_final = address.streetline1 + "," + address.streetline2 + "," + address.city + "," + address.zipcode;
    const longLat = await PublicWall.getLongLat(address_final); const long = longLat[0]; const lat = longLat[1];

    const messageHTML = await PublicWall.getMapMedicalAlert(message, curr_user, formattedTimeStamp, lat, long, id);
    $(".list-container").append(messageHTML);

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: id,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [long, lat],
      zoom: 14,
      projection: 'globe',
      dragPan: false,
      dragRotate: false,
      doubleClickZoom: false,
      boxZoom: false,
      scrollZoom: false,
      touchZoomRotate: false
    });

    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true }, trackUserLocation: true, showUserHeading: true
    }));

    map.on('style.load', () => { map.setFog({}); });
    // Create a new marker.
    new mapboxgl.Marker().setLngLat([long, lat]).addTo(map);
  }

  static getNoMapMedicalAlert (message, curr_user, formattedTimeStamp, id) {
    let messageHTML =
            "<div id='" + id + "-container' class='public-message-card'>" +
            "<div class='public-message-card-header'> <div class='name'>" + message.user.displayName + "</div> <div class='status'> " + Component.getStatusIcon(message.status) + " </div> </div>" +
            "<div class='public-message-card-message'>" + message.text + "</div>" +
            "<div class='public-message-card-footer'>" + formattedTimeStamp + "</div>" +
            "<div class='public=message-card-buttons'>";
    if (curr_user === message.user.username) {
      messageHTML += "<button class='btn btn-success' onclick='public_wall.handleOkay(\"" + id + "\")'>I'm okay</button>";
    } else {
      messageHTML += "<button class='btn btn-success' onclick='public_wall.onWay(\"" + message.user.displayName + "\")'>I'm on my way</button>";
    }
    messageHTML += "</div></div>";
    return messageHTML;
  }

  static async getMapMedicalAlert (message, curr_user, formattedTimestamp, lat, long, id) {
    let messageHTML =
            "<div id='" + id + "-container' class='public-message-card'>" +
            "<div class='public-message-card-header'> <div class='name'>" + message.user.displayName + "</div> <div class='status'> " + Component.getStatusIcon(message.status) + " </div> </div>" +
            "<div id='" + id + "' class='medical-alert-map' onclick='tap(public_wall.openMap, " + lat + ", " + long + ")'></div>" +
            "<div class='public-message-card-footer'>Double Click to expand - " + formattedTimestamp + "</div>";
    if (curr_user === message.user.username) {
      messageHTML += "<button class='btn btn-success' onclick='public_wall.handleOkay(\"" + id + "\")'>I'm okay</button>";
    } else {
      messageHTML += "<button class='btn btn-success' onclick='public_wall.onWay(\"" + message.user.displayName + "\")'>I'm on my way</button>";
    }
    messageHTML += "</div></div>";
    return messageHTML;
  }

  async naiveGetLatestPublicMessages (amount = 10) {
    const loader_wrapper = $(".loader-wrapper");
    loader_wrapper.show();
    $(".list-container").empty(); // empty the chat container first;
    try {
      const publicMessages = await this.getLatestPublicMessages(amount);
      loader_wrapper.hide(); // This might not happen if getLatestMessages fails
      for (const message of publicMessages) {
        // Check if message sent by an active account
        if (message.user.accountStatus === "active") {
          await this.appendMessageToPublicMessageWall(message);
        }
      }
    } catch (err) {
      console.log("naviveGetError", err); // add error pop up?
    }
  }

  async sendPublicMessage (data) {
    const token = window.localStorage.getItem('jwttoken');
    if (!token) {
      return resolve({ valid: false });
    }
    return await authorizedPost('/public-messages', JSON.stringify(data), '', token);
  }

  static async getLongLat (location) {
    const response = await $.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${mapboxToken}`);
    return response.features[0].center;
  }

  static async getAddress (username) {
    return await authorizedGet('/address', 'username=' + username, token);
  }

  onViewFocus () {
    this.naiveGetLatestPublicMessages();
  }

  onUserDisconnected (username) {
    console.log('user disconnect', username);
  }

  onUserConnected (username) {
    console.log('user connect', username);
  }
}

const public_wall = new PublicWall();
public_wall.register();

const doubletapDeltaTime_ = 700;
let doubletap2Function = null;
let doubletapTimer = null;

function tap (doubleTapFunc, lat, long) { // eslint-disable-line no-unused-vars
  if (doubletapTimer == null) {
    // First tap, we wait X ms to the second tap
    doubletapTimer = setTimeout(doubletapTimeout, doubletapDeltaTime_);
    doubletap2Function = doubleTapFunc;
  } else {
    // Second tap
    clearTimeout(doubletapTimer);
    doubletapTimer = null;
    doubletap2Function(lat, long);
  }
}
function doubletapTimeout () {
  doubleTapTimer = null;
}
