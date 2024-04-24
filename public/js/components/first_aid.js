
class FirstAid extends Component {
  constructor () {
    super('first-aid');
    this.uploadCertificateStaticBackdropModal = {};
    this.reportInstructionStaticBackdropModal = {};
    this.requestInstructionStaticBackdropModal = {};
    this.deleteInstructionStaticBackdropModal = {};
    this.noDoctorsFoundStaticBackdropModal = {};
    this.searchModalControl = {};
    this.isEditing = false;
    this.currentFirstAidId = '';
    this.currentFirstAidAuthor = '';
    this.currentFirstAidTitle = '';
    this.currentActiveUser = '';
  }

  onContainerRegister () {
  }

  onActive () {
  }

  onInactive () {
  }

  onViewFocus () {
    this.getFirstAidList();
    this.initializeAllModals();
    this.currentActiveUser = window.localStorage.getItem('current_user');
  }

  // Intializing all modals objects
  initializeAllModals () {
    this.uploadCertificateStaticBackdropModal = new bootstrap.Modal('#uploadCertificateStaticBackdropModal', {
      keyboard: false
    });
    this.reportInstructionStaticBackdropModal = new bootstrap.Modal('#reportInstructionStaticBackdropModal', {
      keyboard: false
    });
    this.requestInstructionStaticBackdropModal = new bootstrap.Modal('#requestInstructionStaticBackdropModal', {
      keyboard: false
    });
    this.deleteInstructionStaticBackdropModal = new bootstrap.Modal('#deleteInstructionStaticBackdropModal', {
      keyboard: false
    });
    this.noDoctorsFoundStaticBackdropModal = new bootstrap.Modal('#noDoctorsFoundStaticBackdropModal', {
      keyboard: false
    });
  }

  toggleLoader () {
    $('.first-aid-container .loader-wrapper').toggleClass('show');
  }

  showToastMessage (content) {
    const toastHomePageElement = $('#liveToast');
    const toast = new bootstrap.Toast(toastHomePageElement);
    $('#liveToast .toast-body').html(content);
    toast.show();
  }

  showFirstAidListPage () {
    this.isEditing = false;
    $('.first-aid-add-instructions-page').addClass('d-none'); // hide add/edit instructions page
    $('.first-aid-view-instructions-page').addClass('d-none'); // hide view instructions page
    $('.first-aid-back-container').addClass('invisible'); // hide back button
    $('.first-aid-add-list-page').removeClass('d-none'); // show list page
    this.getFirstAidList(); // get the first aid list from backend
  }

  showViewInstructionsPage () {
    $('.first-aid-add-list-page').addClass('d-none'); // hide first aid list page
    $('.first-aid-back-container').removeClass('invisible'); // show back button
    $('.first-aid-view-instructions-page').removeClass('d-none'); // show view instructions page
  }

  showAddEditInstructionsPage () {
    $('.first-aid-add-list-page').addClass('d-none'); // hide first aid list page
    $('.first-aid-add-instructions-page').removeClass('d-none'); // show add instructions page
    $('.first-aid-add-instructions-page .instructions-rule').removeClass('highlight'); // remove error highlighting
    if (this.isEditing) {
      $('#add-edit-common-button').html('Save');
    } else {
      $('#add-edit-common-button').html('Add');
    }
  }

  async getFirstAidList () {
    this.toggleLoader(); // show loader
    let firstAidListdata;
    try {
      firstAidListdata = await this.getFirstAid(); // get the first aid list data from backend
    } catch (error) {
      console.log("Could not fetch first aid list data with error: ", error);
      return;
    }
    const listContainer = $(".first-aid-cards-wrapper .overflow-wrapper");
    this.appendFirstAidListToListContainer(firstAidListdata, listContainer); // append all first aid into the container
    this.toggleLoader(); // hide loader
  }

  getFirstAid () {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      authorizedGet('/first-aid-instructions', '', token)
        .done(getbackendFirstAidData => {
          resolve(getbackendFirstAidData);
        }).fail(err => {
          reject(err);
        });
    });
  }

  appendFirstAidListToListContainer (firstAidListData, listContainer, searchModal = {}) {
    this.searchModalControl = searchModal; // get the search modal object
    listContainer.html(''); // empty the list container before adding anything new
    for (const firstAidItem of firstAidListData) {
      const formattedTimeStamp = moment(firstAidItem.timestamp).format('MM.DD.YYYY, h:mm A');
      if (this.currentActiveUser === firstAidItem.user.username) {
        // If the user who added the first aid instructions is logged in then show the edit and delete button
        listContainer.append(
          `<div class="first-aid-card" onclick="first_aid.handleFirstAidCardClick('${firstAidItem._id}','${firstAidItem.user.displayName}','${firstAidItem.medicalInjury}')"><div class="d-flex py-2 "><div class="d-flex flex-grow-1" ><span class="medical-injury-title">${firstAidItem.medicalInjury}</span></div><button class="btn btn-outline-success me-2" onclick="first_aid.handleFirstAidCardEditIconClick('${firstAidItem._id}', event)"><i class="bi bi-pencil-square"></i></button><button class="btn btn-outline-danger" onclick="first_aid.handleFirstAidCardDeleteIconClick('${firstAidItem._id}', event)"><i class="bi bi-trash3-fill"></i></button>
             </div><div class="d-flex justify-content-between"><div class="first-aid-author">By ${firstAidItem.user.displayName}</div><div class="first-aid-timestamp">Updated on ${formattedTimeStamp}</div></div></div>`);
      } else {
        // remove the edit and delete button and dont show inactive users instructions
        if (firstAidItem.user.accountStatus === 'active') {
          listContainer.append(
            `<div class="first-aid-card" onclick="first_aid.handleFirstAidCardClick('${firstAidItem._id}','${firstAidItem.user.displayName}','${firstAidItem.medicalInjury}')"><div class="d-flex py-2 "><div class="d-flex flex-grow-1" ><span class="medical-injury-title">${firstAidItem.medicalInjury}</span></div>
               </div><div class="d-flex justify-content-between"><div class="first-aid-author">By ${firstAidItem.user.displayName}</div><div class="first-aid-timestamp">Updated on ${formattedTimeStamp}</div></div></div>`);
        }
      }
    }
  }

  async handleFirstAidCardClick (cardId, authorName, injuryName) {
    if (!jQuery.isEmptyObject(this.searchModalControl)) {
      this.searchModalControl.hide(); // if card is clicked inside the search modal then hide the search modal first
    }
    this.currentFirstAidTitle = injuryName;
    this.toggleLoader(); // show loader
    let firstAidCardDetails;
    try {
      firstAidCardDetails = await this.getSingleFirstAid(cardId); 
    } catch (err) {
      console.log("Could not get the first aid with error: ", err);
      return;
    }
    const formattedTimeStamp = moment(firstAidCardDetails.timestamp).format("MM.DD.YYYY, h:mm A");
    this.showViewInstructionsPage();
    const certiData = await this.getCertificateImage(authorName.toLowerCase());
    this.currentFirstAidAuthor = authorName;
    if (authorName.toLowerCase() === window.localStorage.getItem('current_user')) {
      $('#report-instructions-button').addClass('d-none'); // the author of first aid instructions cannot report himself
    } else {
      $('#report-instructions-button').removeClass('d-none');
    }
    $('.first-aid-view-instructions-page .page-header .text').html(firstAidCardDetails.medicalInjury);
    $('.first-aid-view-instructions-page .instructions-description').html(firstAidCardDetails.instructions);
    $('.first-aid-view-instructions-page .author').html("By " + firstAidCardDetails.user.displayName);
    $('.first-aid-view-instructions-page .datetime').html(formattedTimeStamp);
    this.toggleLoader(); // hide loader
    $('.certi').html('');
    $('.certi').append(`<a href="${certiData.image}" download='ds'><i class="bi bi-journal-medical"></i></a>`);
  }

  getSingleFirstAid (id) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      authorizedGet('/first-aid-instructions/' + id, '', token)
        .done(getSingleFirstAidData => {
          resolve(getSingleFirstAidData);
        }).fail(error => {
          reject(error);
        });
    });
  }

  async handleFirstAidCardEditIconClick (cardId, event) {
    event.stopPropagation();
    if (!jQuery.isEmptyObject(this.searchModalControl)) {
      this.searchModalControl.hide(); // if card is clicked inside the search modal then hide the search modal first
    }
    this.toggleLoader(); // show loader
    this.isEditing = true; // user is in editing mode
    this.currentFirstAidId = cardId; // set the id of the current first aid card
    let firstAidEditCardDetails;
    try {
      firstAidEditCardDetails = await this.getSingleFirstAid(cardId);
    } catch (error) {
      console.log("Could not get the first aid details with error: ", error);
      return;
    }
    this.showAddEditInstructionsPage();
    $('#medicalInjuryForm').val(firstAidEditCardDetails.medicalInjury);
    $('#firstAidInstructionsForm').val(firstAidEditCardDetails.instructions);
    this.toggleLoader(); // hide loader
  }

  async handleFirstAidInstructionsSubmitButtonClick () {
    if ($('#medicalInjuryForm').val().trim().length <= 2 || $('#firstAidInstructionsForm').val().trim().length <= 270) {
      // Instructions rule check
      $('.first-aid-add-instructions-page .instructions-rule').addClass('highlight');
      return;
    }
    const firstAidData = {
      medical_injury: $('#medicalInjuryForm').val().toLowerCase(),
      description: $('#firstAidInstructionsForm').val()
    };
    this.toggleLoader(); // show loader
    $('.first-aid-add-instructions-page .instructions-rule').removeClass('highlight');
    try {
      if (this.isEditing) {
        await this.updateFirstAid(firstAidData, this.currentFirstAidId);
      } else {
        await this.postFirstAid(firstAidData);
      }
    } catch (err) {
      console.log("Could not update or add first aid instructions with error: ", err);
      this.toggleLoader(); // hide loader
      $('.first-aid-add-instructions-page .instructions-rule').addClass('highlight');
      return;
    }
    this.showFirstAidListPage(); // move back to first aid list page
    this.toggleLoader(); // hide loader
  }

  postFirstAid (data) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      authorizedPost('/first-aid-instructions', JSON.stringify(data), '', token)
        .done(postFistAidData => {
          resolve(postFistAidData);
        }).fail(error => {
          reject(error);
        });
    });
  }

  updateFirstAid (data, id) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      authorizedPost('/first-aid-instructions/' + id, JSON.stringify(data), '', token)
        .done(updatedData => {
          resolve(updatedData);
        }).fail(error => {
          reject(error);
        });
    });
  }

  handleFirstAidCardDeleteIconClick (id, event) {
    event.stopPropagation();
    if (!jQuery.isEmptyObject(this.searchModalControl)) {
      this.searchModalControl.hide(); // if card is clicked inside the search modal then hide the search modal first
    }
    this.currentFirstAidId = id;
    this.deleteInstructionStaticBackdropModal.show();
  }

  async handleDeleteInstructionsConfirmationButtonClick () {
    this.deleteInstructionStaticBackdropModal.hide();
    this.toggleLoader(); // show loader
    try {
      await this.deleteSingleFirstAid(this.currentFirstAidId);
    } catch (error) {
      console.log("Could not delete the first aid with error: ", error);
      return;
    }
    this.toggleLoader(); // hide loader
    this.getFirstAidList(); // load first aid list again
  }

  deleteSingleFirstAid (id) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      authorizedDelete('/first-aid-instructions/' + id, '', token)
        .done(deletedData => {
          resolve(deletedData);
        }).fail(error => {
          reject(error);
        });
    });
  }

  async validateMedicalInjuryText () {
    const element = document.getElementById('medicalInjuryForm');
    element.value = element.value.replace(/[^a-zA-Z ]+/, '');
  }

  async handleAddFirstAidClick () {
    this.toggleLoader(); // show loader
    const username = window.localStorage.getItem('current_user');
    let verifyCertificate;
    try {
      verifyCertificate = await this.getCertificateImage(username);
    } catch (error) {
      console.log("Could not verify certificate with error:", error);
      return;
    }
    if (!verifyCertificate.image) {
      // if certificate of the user is found
      $('#uploadCertificateStaticBackdropModal .error-message-box').removeClass('show');
      this.uploadCertificateStaticBackdropModal.show();
    } else {
      this.showAddEditInstructionsPage();
      $('#medicalInjuryForm').val("");
      $('#firstAidInstructionsForm').val("");
    }
    this.toggleLoader(); // hide loader
  }

  getCertificateImage (username) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      authorizedGet('/medical-certificates/' + username, '', token)
        .done(getCertificateData => {
          resolve(getCertificateData);
        }).fail(error => {
          reject(error);
        });
    });
  }

  async handleUploadCertificateButtonClick () {
    const formData = new FormData();
    const file = $('#medicalCertificateFile')[0].files[0];
    const maximumFileSizeLimit = 110000;
    if (file) {
      if (file.size >= maximumFileSizeLimit || file.type !== 'image/jpeg') {
        $('#uploadCertificateStaticBackdropModal .error-message-box').addClass('show');
        return;
      }
      formData.append('file', file);
      this.uploadCertificateStaticBackdropModal.hide();
      this.toggleLoader(); // show loader
      try {
        await this.postMedicalCertificate(formData);
      } catch (error) {
        console.log("Could not upload medical certificate with error: ", error);
        return;
      }
      this.showAddEditInstructionsPage();
      this.toggleLoader(); // hide loader
    } else {
      $('#uploadCertificateStaticBackdropModal .error-message-box').addClass('show');
    }
  }

  postMedicalCertificate (data) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      authorizedPostForFiles('/medical-certificates', data, '', token)
        .done(postCertificateData => {
          resolve(postCertificateData);
        }).fail(error => {
          reject(error);
        });
    });
  }

  handleRequestFirstAidClick () {
    $('#requestInstructionStaticBackdropModal .error-message-box').removeClass('show');
    this.requestInstructionStaticBackdropModal.show();
  }

  async handleSendRequestInstructionButtonClick () {
    if ($('#requestInstructionsForm').val().trim().length >= 100) {
      const requestDescription = {
        text: "[Request for First Aid Instructions]: " + $('#requestInstructionsForm').val()
      };
      this.requestInstructionStaticBackdropModal.hide();
      let doctorList;
      try {
        doctorList = await this.getAllDoctorsList();
      } catch (error) {
        console.log("Cannot retreive doctors list with error:", error);
        return;
      }
      if (doctorList.length === 0) {
        this.noDoctorsFoundStaticBackdropModal.show();
        return;
      }
      for (const item of doctorList) {
        await this.sendRequestInstructionsPrivateMessage(requestDescription, item.user.displayName);
      }
      this.showToastMessage('Request sent successfully!');
    } else {
      $('#requestInstructionStaticBackdropModal .error-message-box').addClass('show');
    }
  }

  getAllDoctorsList () {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      authorizedGet('/medical-certificates', '', token)
        .done(getDoctorListData => {
          resolve(getDoctorListData);
        }).fail(error => {
          reject(error);
        });
    });
  }

  sendRequestInstructionsPrivateMessage (data, username) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      authorizedPost('/private-messages/' + username.toLowerCase(), JSON.stringify(data), '', token)
        .done(postRequestData => {
          resolve(postRequestData);
        }).fail(error => {
          reject(error);
        });
    });
  }

  handleReportInstructionsButtonClick () {
    $('#reportInstructionStaticBackdropModal .error-message-box').removeClass('show');
    this.reportInstructionStaticBackdropModal.show();
  }

  async handleSendReportInstructionButtonClick () {
    if ($('#reportInstructionsForm').val().trim().length < 100) {
      $('#reportInstructionStaticBackdropModal .error-message-box').addClass('show');
      return;
    }
    const reportDescription = {
      text: "[First Aid report instructions for " + this.currentFirstAidTitle + "]: " + $('#reportInstructionsForm').val()
    };
    this.reportInstructionStaticBackdropModal.hide();
    try {
      await this.sendReportInstructionsPrivateMessage(reportDescription);
    } catch (error) {
      console.log("Could not send the report with error: ", error);
      return;
    }
    this.showToastMessage(`Report sent succesfully to ${this.currentFirstAidAuthor}`);
  }

  sendReportInstructionsPrivateMessage (data) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      const receiverDisplayname = this.currentFirstAidAuthor;
      authorizedPost('/private-messages/' + receiverDisplayname.toLowerCase(), JSON.stringify(data), '', token)
        .done(postReportData => {
          resolve(postReportData);
        }).fail(error => {
          reject(error);
        });
    });
  }
}

const first_aid = new FirstAid();
first_aid.register();
