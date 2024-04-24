const token = window.localStorage.getItem('jwttoken');
let componentController;
let accountSettingsChangedMessageModal;

function getComponentController() { // eslint-disable-line no-unused-vars
  if (!componentController) {
    componentController = new ComponentController();
    setTimeout(() => {
      componentController.setupSocket();
    }, 300);
  }
  return componentController;
}

const validateJWT = async function () {
  if (!token) {
    return { valid: false };
  }
  return await authorizedPost('/users/token-validation', null, '', token);
};

// When index page loads
window.onload = async (event) => { // eslint-disable-line no-unused-vars
  const response = await validateJWT();
  if (!response.valid) {
    window.location = getBackendURL(backendURL, '/');
    return;
  }
  setUsernameTextInDropdown();
  showAdminSettingsFromUserSettingDropdown(response);
  announcements.saveUserRole(response);
  await updateChatsUnreadMessageIcon();
  accountSettingsChangedMessageModal = new bootstrap.Modal('#accountDeactivatedStaticBackdropModal', {
    keyboard: false
  });
};

const socket = io({
  extraHeaders: {
    Authorization: "Bearer " + token
  }
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

const ContextType = { // eslint-disable-line no-unused-vars
  ESNList: 'esn-list',
  PublicWall: 'public-wall',
  Chats: 'chats', // private chat list
  PrivateChat: 'private-chat', // private chat window
  Announcement: 'announcements-view',
  MedicalWall: 'medical-wall-view',
  FirstAid: 'first-aid',
  UsersProfileSettings: 'users-profile-settings',
  MyMedicalSupplies: "my-medical-supplies",
  MedicalSuppliesExchange: "medical-supplies-exchange"
};

const StatusType = { // eslint-disable-line no-unused-vars
  OK: "OK",
  Help: "Help",
  Emergency: "Emergency"
};

const SearchKeyword = { // eslint-disable-line no-unused-vars
  Status: "status"
};

const MessageClassType = { // eslint-disable-line no-unused-vars
  Announcement: 'announcement',
  PrivateMessage: 'private-message',
  PublicMessage: 'public-message',
  MedicalRequest: 'medical-request'
};

function onMessageScroll() { // eslint-disable-line no-unused-vars
  $(".chat-textarea").each(function () {
    this.setAttribute("style", "height:" + (this.scrollHeight) + "px;overflow-y:hidden;");
  }).on("input", function () {
    this.style.height = 0;
    this.style.height = (this.scrollHeight) + "px";
  });
}

function showAdminSettingsFromUserSettingDropdown(userInfo) {
  if (userInfo.role === 'administrator') {
    $('.admin-setting-dropdown-wrapper').removeClass('d-none');
  }
}

function showAccountSettingsChangedMessageModal() { // eslint-disable-line no-unused-vars
  accountSettingsChangedMessageModal.show();
  localStorage.clear();
}

function handleInactiveLogoutButtonClick() { // eslint-disable-line no-unused-vars
  window.location.href = "/";
}


async function postMessage(tag, sendFunction) { // eslint-disable-line no-unused-vars
  const messageText = $(tag).val();
  if (messageText.length === 0) {
    console.log("Missing message text!"); // add error pop up?
    return;
  }
  const data = { text: messageText };
  try {
    await sendFunction(data);
    $(".chat-textarea").val(''); // chat text area reset
  } catch (err) {
    console.log(err); // add error pop up?
  }
}
