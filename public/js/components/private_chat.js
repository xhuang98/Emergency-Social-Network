class PrivateChat extends Subcomponent {
  constructor() {
    super('private-chat', 'chats');
  }

  onContainerRegister() {
    // This is actually like a event listener registration step, so that when socket hears
    // a message with the event named 'private_message', it will call the callback appendMessageToPrivateChat(message)
    // message here as the parameter is exactly the private message sent from the server to all clients
    this.registerFocusedSocketTopic('private_message', this.appendMessageToPrivateChat);
    
    // To resize the chat textarea automatically (snippet taken from blog)
    onMessageScroll();
  }

  async handlePostMessageButtonClick() {
    await postMessage("#private-message-text", this.sendPrivateMessage);
  }

  // By default params is set to 'amount=10', check ../../models/private_message.js/getLatestPrivateMessages()
  async getLatestPrivateMessages(amount) {
    const token = window.localStorage.getItem('jwttoken');
    if (!token) {
      return resolve({ valid: false });
    }
    const params = "amount=" + amount;
    const receiverDisplayname = window.localStorage.getItem('private_chat_receiver');
    return await authorizedGet('/private-messages/' + receiverDisplayname.toLowerCase(), params, token);
  }

  static appendMessageToListContainer(message, listContainer) {
    const formattedTimeStamp = moment(message.timestamp).format("MM.DD.YYYY, h:mm A");
    listContainer.append(
      "<div class='private-message-card'>" +
        "<div class='private-message-card-header'> <div class='name'>" + message.originUser.displayName + "</div> <div class='status'> " + Component.getStatusIcon(message.status) + " </div> </div>" +
        "<div class='private-message-card-message'>" + message.text + "</div>" +
        "<div class='private-message-card-footer'>" + formattedTimeStamp + "</div>" +
      "</div>");
  }

  // here the message is a private message, so we need to figure out sender and receiver from
  // this message such that we only append this message to the private chat between the sender
  // and the receiver (rather than appending this message to other private chats)
  // Note: check models/private_message.js/savePrivateMessage for what message contains
  appendMessageToPrivateChat(message) {
    const expectedSender = message.originUser.username;
    const expectedReceiver = message.destinationUser.username;
    // console.log(`===>>> expectedSender: ${expectedSender}; expecetedReceiver: ${expectedReceiver}`);

    // Only append this message when current private chat is between the sender and the receiver
    // indicated by the private message
    const actualSender = window.localStorage.getItem('current_user');
    const actualReceiver = window.localStorage.getItem('private_chat_receiver').toLowerCase();
    // console.log(`===>>> actualSender: ${actualSender}; actualReceiver: ${actualReceiver}`);

    // Sanity check
    if (actualSender === null || typeof actualSender !== 'string' || actualSender.length === 0 ||
            actualReceiver === null || typeof actualReceiver !== 'string' || actualReceiver.length === 0) {
      return;
    }

    // It's possible that current private chat is either from message sender to receiver or
    // from message receiver to sender
    if ((expectedSender === actualSender && expectedReceiver === actualReceiver) ||
            (expectedSender === actualReceiver && expectedReceiver === actualSender)) {
      const listContainer = $("#private-chat-list-container");
      PrivateChat.appendMessageToListContainer(message, listContainer);
      const overflow_wrapper = $(".overflow-wrapper");
      overflow_wrapper.scrollTop(overflow_wrapper[0].scrollHeight);
    }
  }

  async naiveGetLatestPrivateMessages(amount = 10) {
    const loader_wrapper = $(".loader-wrapper");
    loader_wrapper.show();
    $(".list-container").empty(); // empty the chat container first;
    try {
      const privateMessages = await this.getLatestPrivateMessages(amount);
      loader_wrapper.hide(); // This might not happen if getLatestMessages fails
      privateMessages.forEach(message => {
        // Check if message sent by an active account
        if (message.originUser.accountStatus === "active") {
          this.appendMessageToPrivateChat(message);
        }
      });
    } catch (err) {
      console.log("naviveGetError", err); // add error pop up?
    }
  }

  async sendPrivateMessage(data) {
    const token = window.localStorage.getItem('jwttoken');
    if (!token) {
      return resolve({ valid: false });
    }
    const receiverDisplayname = window.localStorage.getItem('private_chat_receiver');
    return await authorizedPost('/private-messages/' + receiverDisplayname.toLowerCase(), JSON.stringify(data), '', token);
  }

  onViewFocus(on_view_focus_args) {
    // Set up the private chat window with receiver name on top
    if (on_view_focus_args && on_view_focus_args.length > 0) {
      const receiverDisplayname = on_view_focus_args[0];
      $('#private-chat-receiver').html(receiverDisplayname);
      window.localStorage.setItem('private_chat_receiver', receiverDisplayname);
    } else {
      const receiverDisplayname = window.localStorage.getItem('private_chat_receiver');
      $('#private-chat-receiver').html(receiverDisplayname);
    }
    this.naiveGetLatestPrivateMessages();
  }

  onUserDisconnected(username) {
    console.log('user disconnect', username);
  }

  onUserConnected(username) {
    console.log('user connect', username);
  }

  onActive() {
    $(`#chats`).addClass('active');
  }

  onInactive() {
    $(`#chats`).removeClass('active');
  }

  async newUnreadMessage(messageSenderUsername) {
    const private_chat_receiver = window.localStorage.getItem('private_chat_receiver');
    if (private_chat_receiver.toLowerCase() !== messageSenderUsername) {
      await super.newUnreadMessage(messageSenderUsername);
    }
  }
}

const private_chat = new PrivateChat();
private_chat.register();
