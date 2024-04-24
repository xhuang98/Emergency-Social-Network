class MedicalWall extends Component {
  constructor () {
    super('medical-wall-view');
  }

  onContainerRegister () {
    this.registerFocusedSocketTopic('medical-request', this.appendMessageToMedicalRequests);
    // To resize the chat textarea automatically (snippet taken from blog)
    onMessageScroll();
  }

  handleOpenModal () {
    this.searchModal = new bootstrap.Modal('#medicalRequestModal', {
      keyboard: false
    });
    this.searchModal.show();
  }

  handleOpenUnjoinModal () {
    this.searchModal = new bootstrap.Modal('#medicalRequestUnjoinModal', {
      keyboard: false
    });
    this.searchModal.show();
  }

  handleOpenJoinModal () {
    this.searchModal = new bootstrap.Modal('#medicalRequestJoinModal', {
      keyboard: false
    });
    this.searchModal.show();
  }

  async handlePost () {
    const number = $("#medical-request-input-number")[0].value;
    const text = $("#medical-request-input-text")[0].value;
    await this.sendMedicalRequest({ helpersRequired: number, description: text });
    this.searchModal.hide();
  }

  async getLatestMedicalRequests (amount) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      const params = "?amount=" + amount;
      authorizedGet('/medical-requests', params, token)
        .done(getData => {
          resolve(getData);
        }).fail(error => {
          reject(error);
        });
    });
  }

  async handleJoinMedicalRequest (id, joined, username) {
    const body = { id, joined };
    await authorizedPut('/medical-requests', JSON.stringify(body), '', token)
      .done(async (putData) => { // eslint-disable-line no-unused-vars
        this.naiveGetLatestMedicalRequests();
      });

    const curr_user = $('.medical-requests-container')[0].id;
    if (!joined) {
      this.handleOpenUnjoinModal();
      await authorizedPost('/private-messages/' + username.toLowerCase(),
        JSON.stringify({ text: `Medical Help Update: User ${curr_user} just unjoined your Help Request.` }), '', token).done((res) => {
        console.log(res);
      });
    } else {
      this.handleOpenJoinModal();
      await authorizedPost('/private-messages/' + username.toLowerCase(),
        JSON.stringify({ text: `Medical Help Update: User ${curr_user} just joined your Help Request.` }), '', token).done((res) => { // eslint-disable-line no-unused-vars
      });
    }
  }

  async handleDeleteMedicalRequest (id) {
    await authorizedDelete('/medical-requests', 'medicalId=' + id, token)
      .done(deleteData => { // eslint-disable-line no-unused-vars
        this.naiveGetLatestMedicalRequests();
      });
  }

  appendMessageToMedicalRequests (message) {
    let found = false;
    for (const elem of message.helperList) {
      if (elem === this.user_id) {
        found = true;
        break;
      }
    }
    const curr_user = $('.medical-requests-container')[0].id;
    const in_helper = found;

    let messagehtml =
            "<div class='medical-request-card'>" +
            "<div class='medical-request-card-headers'>Help Description</div>" +
            "<div class='medical-request-card-message'>" + message.description + "</div>" +
            "<div class='medical-request-card-headers'>Helpers Response</div>" +
            "<div class='medical-request-card-message'>" + message.helperList.length + " out of " + message.helpersRequired + "</div>" +
            "<div class='medical-request-card-headers'>Status</div>" +
            "<div class='medical-request-card-message'>" + message.status + "</div>";
    if (message.user.username !== curr_user) {
      if (in_helper) {
        messagehtml += "<button class=\"btn btn-warning\" onclick=\"medical_wall.handleJoinMedicalRequest('" + message._id + "',false,'" + message.user.username + "')\">Cancel</button>";
      } else {
        if (message.status === 'Active') messagehtml += "<button class=\"btn btn-success\" onclick=\"medical_wall.handleJoinMedicalRequest('" + message._id + "',true,'" + message.user.username + "')\">Join and help</button>";
      }
    } else {
      messagehtml += "<button class=\"btn btn-danger\" onclick=\"medical_wall.handleDeleteMedicalRequest('" + message._id + "')\">Delete</button>";
    }
    messagehtml += "</div>";
    $(".list-container").append(messagehtml);
    const overflow_wrapper = $(".overflow-wrapper");
    overflow_wrapper.scrollTop(overflow_wrapper[0].scrollHeight);
  }

  async naiveGetLatestMedicalRequests (amount = 5) {
    const loader_wrapper = $(".loader-wrapper");
    loader_wrapper.show();
    $(".list-container").empty(); // empty the chat container first;
    try {
      const medicalRequests = await this.getLatestMedicalRequests(amount);
      loader_wrapper.hide(); // This might not happen if getLatestMedicalRequests fails
      medicalRequests.forEach(message => {
        this.appendMessageToMedicalRequests(message);
      });
    } catch (err) {
      console.log("naviveGetError", err); // add error pop up?
    }
  }

  sendMedicalRequest (data) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      authorizedPost('/medical-requests', JSON.stringify(data), '', token)
        .done(postData => {
          resolve(postData);
        }).fail(error => {
          reject(error);
        });
    });
  }

  onViewFocus () {
    this.user_id = $('#user_id')[0].classList[0];
    this.naiveGetLatestMedicalRequests();
  }
}

const medical_wall = new MedicalWall();
medical_wall.register();
