class Subcomponent extends Component { // eslint-disable-line no-unused-vars
  constructor (name, parent_name) {
    super(name);
    this.parent_name = parent_name;
  }

  setActive () {
    this.active = true;
    const parent_component_item = $(`#${this.parent_name}`);
    parent_component_item.removeClass('active');
    parent_component_item.addClass('active');
    for (const socketCallback in this.focusedSocketTopics) {
      // to avoid duplicates
      socket.removeListener(socketCallback, this.focusedSocketTopics[socketCallback]);
      socket.on(socketCallback, this.focusedSocketTopics[socketCallback]);
    }
    this.onActive();
  }

  setInactive () {
    this.active = false;
    this.onInactive();
    $(`#${this.parent_name}`).removeClass('active');
    for (const socketCallback in this.focusedSocketTopics) {
      socket.removeListener(socketCallback, this.focusedSocketTopics[socketCallback]);
    }
  }
}
