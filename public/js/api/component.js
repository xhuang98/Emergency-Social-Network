/**
 * Abstract Class ViewContainer.
 *
 * @class ViewContainer
 */
class Component { // eslint-disable-line no-unused-vars
  constructor (name) {
    if (this.constructor === Component) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    this.name = name;
    this.active = false;
    this.focusedSocketTopics = {};
  }

  onContainerRegister () {
    throw new Error("Method 'onContainerRegister()' must be implemented.");
  }

  register () {
    const controller = getComponentController();
    controller.registerView(this);
  }

  getName () {
    return this.name;
  }

  isActive () {
    return this.active;
  }

  static getStatusIcon (userStatus) {
    switch (userStatus) {
      case 'ok':
        return '<i class="bi bi-check-circle-fill" style="color:#4caf50;"></i>';
      case 'help':
        return '<i class="bi bi-exclamation-circle-fill" style="color:#fdd835; "></i>';
      case 'emergency':
        return '<i class="bi bi-plus-circle-fill" style="color:#f44336;"></i>';
      default:
        return '<i class="bi bi-dash-circle-fill" style="color:#e0e0e0;"></i>';
    }
  }

  setInactive () {
    this.active = false;
    this.onInactive();
    $(`#${this.name}`).removeClass('active');
    for (const socketCallback in this.focusedSocketTopics) {
      socket.removeListener(socketCallback, this.focusedSocketTopics[socketCallback]);
    }
  }

  setActive () {
    this.active = true;
    this.onActive();
    if (this.name === 'private_chat') {
      $(`#chats`).addClass('active');
    } else {
      $(`#${this.name}`).addClass('active');
    }
    for (const socketCallback in this.focusedSocketTopics) {
      socket.on(socketCallback, this.focusedSocketTopics[socketCallback]);
    }
  }

  onActive () {} // To be extended.

  onInactive () {} // To be extended.

  onUserDisconnected (username) { // eslint-disable-line no-unused-vars
  }

  onUserConnected (username) { // eslint-disable-line no-unused-vars
  }

  onPrivateNotification (notification) { // eslint-disable-line no-unused-vars
  }

  async newUnreadMessage (messageSenderUsername) {
    const toastHomePageElement = $('#liveToast');
    const toast = new bootstrap.Toast(toastHomePageElement);
    $('#liveToast .toast-body').html(`You have got a new message from  <strong>${messageSenderUsername}</strong>`);
    toast.show();

    this.onPrivateNotification(messageSenderUsername);
    await addOneToUnreadMessageCount(messageSenderUsername);
    await updateChatsUnreadMessageIcon();
  }

  async userAccountSettingsChanged () {
    showAccountSettingsChangedMessageModal();
  }

  registerFocusedSocketTopic (publicMessage, callback) {
    this.focusedSocketTopics[publicMessage] = callback;
  }
}
