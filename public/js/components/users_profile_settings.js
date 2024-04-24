class UsersProfileSettings extends Component {

  constructor() {
    super('users-profile-settings');
    // keep track of the old username of the selected user
    this.username = '';
    this.searchModalControl = {};
  }

  onContainerRegister() {
  }

  onActive() {
  }

  onInactive() {
  }

  onViewFocus() {
    this.displayAllUsersList();
  }

  toggleLoader() {
    $('.users-profile-settings-container .loader-wrapper').toggleClass('show');
  }


  showUserProfilePage() {
    $('.users-list-page').addClass('d-none'); // hide users list page
    $('.user-profile-page').removeClass('d-none'); // show user profile page
    $('.user-profile-page .error-message-box').addClass('d-none');
  }

  showUserListPage() {
    $('.users-list-page').removeClass('d-none'); // hide users list page
    $('.user-profile-page').addClass('d-none'); // show user profile page

  }

  async displayAllUsersList() {
    this.toggleLoader(); // show loader
    let usersListData;
    try {
      usersListData = await this.getAllUsersList(); // get the users list data from backend
    } catch (error) {
      console.log('Could not fetch users list data with error: ', error);
      return;
    }
    $('.passwordForm').val('');
    const listContainer = $('.users-profile-settings-container .users-list-page');
    this.appendUsersListToListContainer(usersListData, listContainer); // append all user list into the container
    this.toggleLoader(); // hide loader
  }

  async getAllUsersList() {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      authorizedGet('/users', '', token)
        .done(backendUsersListData => {
          resolve(backendUsersListData);
        }).fail(error => {
          reject(error);
        });
    });
  }

  appendUsersListToListContainer(usersListData, listContainer, searchModal = {}) {
    this.searchModalControl = searchModal; // get the search modal object
    listContainer.html(''); // empty the list container before adding anything new
    for (const item of usersListData) {
      if (item.username != 'esnadmin') {
        listContainer.append(`<div class="user-profile-card shadow-sm d-flex justify-content-between align-items-center p-2 mb-3">
        <div class="d-flex align-item-center">
          <img src="/icons/list-user-avatar.svg" height="34px" width="34px"/>
        <div class="user-name d-flex align-items-center ms-2">${item.displayName}</div>
        </div>
        <div class="profile-setting-icon" id="profile-setting-icon-${item._id}" >
          <button class="btn btn-sm btn-outline-secondary me-2">
          <i class="bi bi-pencil-square"></i>
          </button>
        </div></div>`);
        $(`#profile-setting-icon-${item._id}`).on('click', () => {
          this.handleUserProfileEditButtonClick(item);
        });
      }
    }
  }

  prefillUserProfileInfo(userInfo) {
    this.username = userInfo.username;
    $('#statusSelectForm').val(userInfo.accountStatus);
    $('#privilegeLevelSelectForm').val(userInfo.role);
    $('#usernameForm').val(userInfo.displayName);
    $('#passwordForm').val('');
  }

  handleUserProfileEditButtonClick(userInfo) {
    if (!jQuery.isEmptyObject(this.searchModalControl)) {
      this.searchModalControl.hide(); // if card is clicked inside the search modal then hide the search modal first
    }
    this.prefillUserProfileInfo(userInfo);
    this.showUserProfilePage();
  }

  handleUserProfileCancelButtonClick() {
    this.showUserListPage();
  }

  async changeAccountStatus(username, newAccountStatus) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      const data = { username, newAccountStatus };
      authorizedPut('/profile/active', JSON.stringify(data), '', token)
        .done(changeResult => {
          resolve(changeResult);
        }).fail(error => {
          reject(error);
        });
    });
  }

  async changePrivilegeLevel(username, newRole) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      const data = { username, newRole };
      authorizedPut('/profile/role', JSON.stringify(data), '', token)
        .done(changeResult => {
          resolve(changeResult);
        }).fail(error => {
          reject(error);
        });
    });
  }

  async changeUsername(username, newUsername) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      const data = { username, newUsername };
      authorizedPut('/profile/username', JSON.stringify(data), '', token)
        .done(changeResult => {
          resolve(changeResult);
        }).fail(error => {
          reject(error);
        });
    });
  }

  async changePassword(username, newPassword) {
    return new Promise((resolve, reject) => {
      const token = window.localStorage.getItem('jwttoken');
      if (!token) {
        return resolve({ valid: false });
      }
      const data = { username, newPassword };
      authorizedPut('/profile/password', JSON.stringify(data), '', token)
        .done(changeResult => {
          resolve(changeResult);
        }).fail(error => {
          reject(error);
        });
    });
  }

  showErrorMessageBox(message) {
    $('.user-profile-page .error-message-box').removeClass('d-none');
    $('.user-profile-page .error-message-box').html(message);
  }

  async handleUserProfileSaveButtonClick() {
    // Retrieve form data
    const newAccountStatus = $('#statusSelectForm').val();
    const newRole = $('#privilegeLevelSelectForm').val();
    const newUsername = $('#usernameForm').val();
    const newPassword = $('#passwordForm').val();

    // Note: we intentionally change all user settings "before" changing the username
    // so the change order matters and it relates to log out the user in real time if any user setting is changed
    // (this relates to sending the socket topic "account_settings_changed")
    await this.changeAccountStatus(this.username, newAccountStatus);
    await this.changePrivilegeLevel(this.username, newRole);

    try {
      if (newPassword.length !== 0) { 
        await this.changePassword(this.username, newPassword);
      }
    } catch (error) {
      console.log("password error: ", error);
      let errorMessage = error.responseJSON.error;
      this.showErrorMessageBox(errorMessage);
      return errorMessage;
    }

    try {
      // Check if the username is unchanged
      if (this.username !== newUsername) {
        await this.changeUsername(this.username, newUsername);
      }
    } catch (error) {
      let errorMessage = error.responseJSON.error;
      this.showErrorMessageBox(errorMessage);
      return errorMessage;
    }
    
    // Render the result
    this.showUserListPage();
    await this.displayAllUsersList(); 
  }
}

const users_profile_settings = new UsersProfileSettings();
users_profile_settings.register();