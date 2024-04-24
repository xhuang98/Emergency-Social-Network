class Chats extends Component {
  constructor () {
    super('chats');
  }

  async getChatList () {
    return await authorizedGet('/users', '', token);
  }

  async getUnreadMessageCount (senderUsername) {
    const token = window.localStorage.getItem('jwttoken');
    if (!token) {
      return { valid: false };
    }
    return await authorizedGet(`/private-notifications/unread-message-count/${senderUsername}`, '', token);
  }

  async getAllNonZeroUnreadMessageCounts () {
    const token = window.localStorage.getItem('jwttoken');
    if (!token) {
      return resolve({ valid: false });
    }
    return await authorizedGet(`/private-notifications/unread-message-nonzero-counts`, '', token);
  }

  async resetUnreadMessageCount (senderUsername) {
    const token = window.localStorage.getItem('jwttoken');
    if (!token) {
      return { valid: false };
    }
    const data = { unreadMessageCount: 0 };
    await authorizedPost(`/private-notifications/${senderUsername}`, JSON.stringify(data), '', token);
  }

  // nonzeroUnreadMessageCounts is the GET result of getAllNonZeroUnreadMessageCounts()
  extractSendersWithUnreadMessageCounts (nonzeroUnreadMessageCounts) {
    const nonzeroUnreadMessageCountsMap = new Map();
    for (const privateNotification of nonzeroUnreadMessageCounts) {
      const sender = privateNotification.originUser.username;
      if (!nonzeroUnreadMessageCountsMap.has(sender)) {
        const count = privateNotification.unreadMessageCount;
        nonzeroUnreadMessageCountsMap.set(sender, count);
      }
    }
    return nonzeroUnreadMessageCountsMap;
  }

  onContainerRegister () {
    this.registerFocusedSocketTopic('user_status', this.renderChatList());
  }

  async renderChatList () {
    const loaderWrapper = $(".loader-wrapper");
    loaderWrapper.show();
    const list_container = $(".list-container");
    const chatListData = await this.getChatList();
    const nonzeroUnreadMessageCounts = await this.getAllNonZeroUnreadMessageCounts();
    const nonzeroUnreadMessageCountsMap = this.extractSendersWithUnreadMessageCounts(nonzeroUnreadMessageCounts);
    list_container.empty();
    loaderWrapper.hide();

    for (const item of chatListData) {
      // Issue a post request to get unread message count between current user and the destinationUser
      const senderUsername = item.username;
      const unreadMesageCount = nonzeroUnreadMessageCountsMap.has(senderUsername)
        ? nonzeroUnreadMessageCountsMap.get(senderUsername)
        : 0;
      const hideUnreadMessageCount = (unreadMesageCount === 0) ? "invisible" : "visible";
      if (item.accountStatus === 'active'){
        list_container.append(
          `<div class="list-item shadow-sm ${item.active ? 'online' : 'chat-list-offline'}" id="private-chat-${senderUsername}-card"
              onclick="changeView('private-chat', '${item.displayName}')">
              <div class="status">
                  <img src="/icons/list-user-avatar.svg" height="34px" width="34px"/>
              </div>
              <div class="name">${item.displayName}</div>
              <div class="unread-private-msg-cnt ${hideUnreadMessageCount}" id="unread-private-msg-cnt-${senderUsername}">${unreadMesageCount}</div>
              <div class="ms-auto private-chat-user-status text-center">${Component.getStatusIcon(item.status)}</div>
          </div>`);
      }
      

      // add event listener to clear unreadMessageCount when user opens the private chat window
      $(`#private-chat-${senderUsername}-card`).on("click", async () => {
        const unreadMesageCount = await this.getUnreadMessageCount(senderUsername);
        if (unreadMesageCount > 0) {
          await this.resetUnreadMessageCount(senderUsername);
        }
        
        await updateChatsUnreadMessageIcon();
      });
    }
  }

  onViewFocus () {
    this.renderChatList();
  }

  onUserDisconnected (username) { // eslint-disable-line no-unused-vars
    this.renderChatList();
  }

  onUserConnected (username) { // eslint-disable-line no-unused-vars
    this.renderChatList();
  }

  onPrivateNotification (messageSenderUsername) {
    const unreadMessageCntElement = $(`#unread-private-msg-cnt-${messageSenderUsername}`);
    try {
      let unreadMessageCnt = parseInt(unreadMessageCntElement.text());
      unreadMessageCnt++;
      unreadMessageCntElement.html(unreadMessageCnt.toString());
      unreadMessageCntElement.removeClass("invisible");
      unreadMessageCntElement.addClass("visible");
    } catch (err) {
      console.log(err);
    }
  }

  onInactive () {
    return true;
  }

  onActive () {
    $('#chats').addClass('active');
    return true;
  }
}

const chats = new Chats();
chats.register();

const addOneToUnreadMessageCount = async function (senderUsername) { // eslint-disable-line no-unused-vars
  const token = window.localStorage.getItem('jwttoken');
  if (!token) {
    return resolve({ valid: false });
  }
  return await authorizedPost(`/private-notifications/${senderUsername}`, null, '', token);
};

// Check if current user has unread messages from other users
const hasUnreadMessageForCurrentUser = async function () {
  const token = window.localStorage.getItem('jwttoken');
  if (!token) {
    return resolve({ valid: false });
  }
  return await authorizedGet('/private-notifications/unread-message-existence', '', token);
};

const updateChatsUnreadMessageIcon = async function () {
  // initiate get request to check if current user has any unread messages
  const hasUnreadMessageCheck = await hasUnreadMessageForCurrentUser();
  const hasUnreadMessages = hasUnreadMessageCheck.unreadMessageExists;
  const chatsNotificationIcon = $('#chats-notification-icon');
  if (hasUnreadMessages) {
    // has unread messages => show icon
    console.log("==>> current user still has unread messages!");
    chatsNotificationIcon.removeClass('d-none');
  } else {
    // doesn't has unread messages && current icon is shown => hide icon
    if (!chatsNotificationIcon.hasClass('d-none')) {
      console.log("==>> current user has no unread messages anymore!");
      chatsNotificationIcon.addClass('d-none');
    }
  }
};
