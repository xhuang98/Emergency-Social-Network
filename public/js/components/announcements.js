class Announcements extends Component {
  constructor () {
    super('announcements-view');
  }

  onContainerRegister () {
    this.registerFocusedSocketTopic('announcement', this.appendMessageToAnnouncements);
    // To resize the chat textarea automatically (snippet taken from blog)
    onMessageScroll();
  }

  async handlePostMessageButtonClick () {
    await postMessage("#announcement-text", this.sendAnnouncement);
  }

  async getLatestAnnouncements (amount) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      const params = "amount=" + amount;
      authorizedGet('/announcements', params, token)
        .done(getData => {
          resolve(getData);
        }).fail(error => {
          reject(error);
        });
    });
  }


  saveUserRole(userInfo) {
    this.userRole = userInfo.role;
  }

  hidePostAnnouncementTextArea() {
    console.log("hidePostAnnouncementTextArea", this.userRole);
    if (this.userRole === 'citizen') {
      $('.announcement-container').addClass('d-none');
    }
  }

  appendMessageToAnnouncements (message) {
    const formattedTimeStamp = moment(message.timestamp).format("MM.DD.YYYY, h:mm A");
    $(".list-container").append(
      "<div class='announcement-card'>" +
            "<div class='announcement-card-header'> <div class='name'>" + message.user.displayName + " </div> </div>" +
            "<div class='announcement-card-message'>" + message.text + "</div>" +
            "<div class='announcement-card-footer'>" + formattedTimeStamp + "</div>" +
            "</div>");
    const overflow_wrapper = $(".overflow-wrapper");
    overflow_wrapper.scrollTop(overflow_wrapper[0].scrollHeight);
  }

  async naiveGetLatestAnnouncements (amount = 10) {
    const loader_wrapper = $(".loader-wrapper");
    loader_wrapper.show();
    $(".list-container").empty(); // empty the chat container first;
    try {
      const announcements = await this.getLatestAnnouncements(amount);
      loader_wrapper.hide(); // This might not happen if getLatestAnnouncements fails
      announcements.forEach(message => {
        // Check if message sent by an active account
        if (message.user.accountStatus === "active") {
          this.appendMessageToAnnouncements(message);
        }
      });
    } catch (err) {
      console.log("naviveGetError", err); // add error pop up?
    }
  }

  sendAnnouncement (data) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      authorizedPost('/announcements', JSON.stringify(data), '', token)
        .done(postData => {
          resolve(postData);
        }).fail(error => {
          reject(error);
        });
    });
  }

  onViewFocus () {
    this.naiveGetLatestAnnouncements();
    this.hidePostAnnouncementTextArea();
  }

  onUserDisconnected (username) {
    console.log('user disconnect', username);
  }

  onUserConnected (username) {
    console.log('user connect', username);
  }
}

const announcements = new Announcements();
announcements.register();
