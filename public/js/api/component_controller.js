class ComponentController { // eslint-disable-line no-unused-vars
  constructor () {
    this.views = {}; // map from view name to view object
  }

  async getActiveView () {
    for (const view_name in this.views) {
      const view = this.views[view_name];
      if (view.isActive()) {
        return view;
      }
    }
    return null;
  }

  getView (name) {
    for (const view_name in this.views) {
      if (view_name === name) {
        return this.views[view_name];
      }
    }
    return null;
  }

  registerView (view) {
    if (view.getName() in this.views) {
      // Already exists
      return;
    }

    const active = window.localStorage.getItem("active_view");
    if (view.getName() === active) {
      view.setActive();
    }
    this.views[view.getName()] = view;
    view.onContainerRegister();
  }

  async changeView (new_view, new_view_args) {
    const activeView = await this.getActiveView();
    if (activeView) activeView.setInactive();

    await this.replaceHTML('/' + new_view);
    const view = this.getView(new_view);
    view.setActive();
    window.localStorage.setItem("active_view", new_view);
    view.onViewFocus(new_view_args);
    $("#burger-button")[0].checked = false;
    return view;
  }

  async replaceHTML (route) {
    // now we load the html
    const response = await authorizedGet(route, '', token);
    const innerContainer = $(".router-wrapper");
    innerContainer[0].innerHTML = '';
    innerContainer[0].innerHTML = response;
  }

  setupSocket () {
    console.log('sockets have been setup.');
    socket.on('user_disconnected', (username) => {
      const active_view = this.getActiveView();
      active_view.onUserDisconnected(username);
    });
    socket.on('user_connected', async (username) => {
      try {
        const active_view = await this.getActiveView();
        active_view.onUserConnected(username);
      } catch (err) {
        console.error(err);
      }
    });
    socket.on('notification_private', async (messageSenderUsername) => {
      // check if client is at the private_chat window with messageSenderUsername
      const active_view = await this.getActiveView();
      await active_view.newUnreadMessage(messageSenderUsername);
    });

    socket.on('website_block', (data) => {
      if (data.block) {
        $(".blocker-modal").removeClass("hide");
      } else {
        $(".blocker-modal").addClass("hide");
      }
    });

    socket.on('account_settings_changed', async () => {
      const active_view = await this.getActiveView();
      await active_view.userAccountSettingsChanged();
    });
  }
}
