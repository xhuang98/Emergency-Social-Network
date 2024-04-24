class ESNList extends Component {
  constructor() {
    super('esn-list');
  }

  async getESNList() {
    return await authorizedGet('/users', '', token);
  }

  onContainerRegister() {
    this.registerFocusedSocketTopic('user_status', this.renderESNList());
  }

  onActive() {
  }

  onInactive() {
  }

  appendESNListItemsToListContainer(esnListData, listContainer) {
    for (const item of esnListData) {
      if (item.accountStatus === "active") {
        listContainer.append(
          `<div class="list-item ${item.active ? 'online' : 'offline'}">
            <div class="status">
                <img src="/icons/list-user-avatar.svg" height="34px" width="34px"/>
            </div>
            <div class="name">${item.displayName}</div>
            <div class="esn-list-user-status text-center">${Component.getStatusIcon(item.status)}</div>
        </div>`);
      }
    }
  }

  async renderESNList() {
    const loaderWrapper = $(".loader-wrapper");
    loaderWrapper.show();
    const listContainer = $(".list-container");
    const esnListData = await this.getESNList();
    listContainer.empty();
    loaderWrapper.hide();
    this.appendESNListItemsToListContainer(esnListData, listContainer);
  }

  onViewFocus() {
    this.renderESNList();
  }

  onUserDisconnected(username) { // eslint-disable-line no-unused-vars
    this.renderESNList();
  }

  onUserConnected(username) { // eslint-disable-line no-unused-vars
    this.renderESNList();
  }
}
const esn_list = new ESNList();
esn_list.register();
