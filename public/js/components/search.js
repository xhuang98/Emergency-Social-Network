
class Search extends Component {
  constructor () {
    super("search");
  }

  toggleLoader () {
    $('.loader-wrapper').toggleClass('show');
    $('.no-results-found-image-wrapper').toggleClass('show');
  }

  async handleSearchButtonClick () {
    this.toggleLoader();
  }

  async handleStopSearchButtonClick () {
    this.toggleLoader();
  }

  onContainerRegister () {
  }

  onViewFocus () {
  }
}

const search = new Search();
search.register();
