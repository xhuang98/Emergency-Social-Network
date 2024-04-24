let currentStatus;

let searchResults;
let searchType;
let searchContext = '';

const changeStatusStaticBackdropModal = new bootstrap.Modal('#statusChangeStaticBackdropModal', {
  keyboard: false
});

const measurePerformanceModal = new bootstrap.Modal('#measurePerformanceStaticBackdropModal', {
  keyboard: false
});

const searchModal = new bootstrap.Modal('#searchStaticBackdropModal', {
  keyboard: false
});

const handleLogout = () => { // eslint-disable-line no-unused-vars
  localStorage.clear();
  window.location.href = "/";
};

const setUsernameTextInDropdown = () => { // eslint-disable-line no-unused-vars
  let username = window.localStorage.getItem('current_user');
  $('.current-username').html('Hi, ' + username);
};

async function changeView(newView, ...change_view_args) {
  const componentController = getComponentController();
  await componentController.changeView(newView, change_view_args);
}

const getStatus = async function () {
  const token = window.localStorage.getItem('jwttoken');
  return await authorizedGet('users/status', '', token);
};

const postStatus = async (data) => {
  const token = window.localStorage.getItem('jwttoken');
  return await authorizedPost('/users/status', data, '', token);
};

const handleShareStatus = () => { // eslint-disable-line no-unused-vars
  changeStatusStaticBackdropModal.show();
  getStatus().then(data => {
    currentStatus = data.status;
    handleShareStatusButtonClick(currentStatus);
  }).catch(err => { console.log(err); });
};

const postMedicalAlert = async () => {
  return await authorizedPost('/medical-alerts', {}, '', token);
};

const handleShareStatusConfirmButtonClick = () => { // eslint-disable-line no-unused-vars
  postStatus(JSON.stringify({ status: currentStatus }))
    .then(data => { // eslint-disable-line no-unused-vars
      changeStatusStaticBackdropModal.hide();
      if (currentStatus === 'emergency') postMedicalAlert();
    })
    .catch(err => {
      console.log(err);
    });
};

const handleShareStatusButtonClick = (statusName) => {
  currentStatus = statusName;
  $('.status-row').removeClass('active');
  $('.' + statusName).addClass('active');
};

const handleAdminSettings = () => { // eslint-disable-line no-unused-vars
  measurePerformanceModal.show();
};

/** *************** Search Logics *****************/
const SearchType = {
  UserByStatus: "userByStatus",
  UserByUsername: "userByUsername",
  AnnouncementByText: "announcementsByText",
  PublicMessageByText: "publicByText",
  PrivateMessageByText: "privateByText",
  PrivateByStatus: "privateByStatus",
  FirstAidByMedicalInjury: "firstAidByMedicalInjury",
  MyMedicalSuppliesByText: "myMedicalSuppliesByText",
  MedicalSuppliesExchangeByText: "medicalSuppliesExchangeByText"
};

const DefaultSearchAmount = 10;

const showLoadingAnimation = () => {
  if (!$('.search-loader-wrapper').hasClass('show')) {
    $('.search-loader-wrapper').addClass('show');
  }
};

const hideLoadingAnimation = () => {
  if ($('.search-loader-wrapper').hasClass('show')) {
    $('.search-loader-wrapper').removeClass('show');
  }
};

const showNoResultsFoundImage = () => {
  const searchResultsContainer = $("#search-result-overflow-wrapper");
  searchResultsContainer.empty();
  if (!$('.no-results-found-image-wrapper').hasClass('show')) {
    $('.no-results-found-image-wrapper').addClass('show');
  }
};

const hideNoResultsFoundImage = () => {
  if ($('.no-results-found-image-wrapper').hasClass('show')) {
    $('.no-results-found-image-wrapper').removeClass('show');
  }
};

const getSearchResults = async (searchData) => {
  return new Promise((resolve, reject) => {
    const token = window.localStorage.getItem('jwttoken');
    if (!token) {
      return resolve({ valid: false });
    }
    authorizedPost('/search', JSON.stringify(searchData), '', token)
      .done(postData => {
        resolve(postData);
      })
      .fail(function (error) {
        reject(error);
      });
  });
};

const handleSearchClick = () => { // eslint-disable-line no-unused-vars
  const currentView = window.localStorage.getItem('active_view');
  $('#searchStaticBackdropModal .modal-title').html('Search ' + currentView);
  searchModal.show();
  const searchResultsContainer = $("#search-result-overflow-wrapper");
  searchResultsContainer.empty();
  showNoResultsFoundImage();
};

const getSearchType = (searchText, searchContext) => {
  let searchType = '';

  switch (searchContext) {
    case ContextType.FirstAid:
      searchType = SearchType.FirstAidByMedicalInjury;
      break;
    case ContextType.UsersProfileSettings:
      searchType = SearchType.UserByUsername;
      break;
    case ContextType.ESNList:
      // Search users by status or by username substring
      if (searchText in StatusType) searchType = SearchType.UserByStatus;
      else searchType = SearchType.UserByUsername;
      break;
    case ContextType.Announcement:
      // Search public announcements
      searchType = SearchType.AnnouncementByText;
      break;
    case ContextType.PublicWall:
      // Search public messages
      searchType = SearchType.PublicMessageByText;
      break;
    case ContextType.PrivateChat:
      // Search the status histories of the other citizen involved in this private chat or search private messages
      if (searchText === SearchKeyword.Status) searchType = SearchType.PrivateByStatus;
      else searchType = SearchType.PrivateMessageByText;
      break;
    case ContextType.MyMedicalSupplies:
      // Search my medical supplies
      searchType = SearchType.MyMedicalSuppliesByText;
      break;
    case ContextType.MedicalSuppliesExchange:
      // Search medical supplies exchange
      searchType = SearchType.MedicalSuppliesExchangeByText;
      break;
    default:
      // by default search for users
      searchType = SearchType.UserByUsername;
  }
  return searchType;
};

const appendMessageCardsToListContainer = (messageClassType, messages, listContainer) => {
  for (const message of messages) {
    const formattedTimeStamp = moment(message.timestamp).format("MM.DD.YYYY, h:mm A");
    const user = messageClassType === MessageClassType.PrivateMessage ? message.originUser : message.user;
    if (user.accountStatus === 'active') {
      listContainer.append(
        `<div class='${messageClassType}-card'>
              <div class='${messageClassType}-card-header'> 
              <div class='name'>${user.displayName}</div>
              <div class='status ${messageClassType === MessageClassType.Announcement ? 'd-none' : ''}'>${Component.getStatusIcon(message.status)}</div>
            </div>
              <div class='${messageClassType}-card-message'>${message.text}</div>
              <div class='${messageClassType}-card-footer'>${formattedTimeStamp}</div>
          </div>`);
    }
  }
};

const appendStatusRecordsToListContainer = (userStatusRecords, listContainer) => {
  for (const userStatusRecord of userStatusRecords) {
    const formattedTimeStamp = moment(userStatusRecord.timestamp).format("MM.DD.YYYY, h:mm A");
    listContainer.append(
      `<div class="list-item">
        <div class="private-by-status-user-icon">
          <img src="/icons/list-user-avatar.svg" height="34px" width="34px"/>
        </div>
        <div class="private-by-status-name">${userStatusRecord.user.displayName}</div>
        <div class="private-by-status-timestamp">${formattedTimeStamp}</div>
        <div class="private-by-status-user-status text-center">${Component.getStatusIcon(userStatusRecord.status)}</div>
      </div>`);
  }
};

const renderSearchResults = (searchResults, searchType) => {
  const isSearchResult = true;
  // If no results found, just show no results found image
  const searchResultsContainer = $("#search-result-overflow-wrapper");
  searchResultsContainer.empty();
  if (!searchResults || searchResults.length === 0) {
    hideLoadingAnimation();
    showNoResultsFoundImage();
    return;
  }
  // Render the search results based on the serachType
  switch (searchType) {
    case SearchType.FirstAidByMedicalInjury:
      first_aid.appendFirstAidListToListContainer(searchResults, searchResultsContainer, searchModal);
      break;
    case SearchType.UserByUsername:
      if (searchContext === ContextType.UsersProfileSettings) {
        users_profile_settings.appendUsersListToListContainer(searchResults, searchResultsContainer, searchModal);
      }
      break;
    case SearchType.UserByStatus:
      esn_list.appendESNListItemsToListContainer(searchResults, searchResultsContainer);
      break;
    case SearchType.AnnouncementByText:
      appendMessageCardsToListContainer(MessageClassType.Announcement, searchResults, searchResultsContainer);
      break;
    case SearchType.PublicMessageByText:
      appendMessageCardsToListContainer(MessageClassType.PublicMessage, searchResults, searchResultsContainer);
      break;
    case SearchType.PrivateMessageByText:
      appendMessageCardsToListContainer(MessageClassType.PrivateMessage, searchResults, searchResultsContainer);
      break;
    case SearchType.PrivateByStatus:
      appendStatusRecordsToListContainer(searchResults, searchResultsContainer);
      break;
    case SearchType.MyMedicalSuppliesByText:
      searchResults.forEach(medicalSupply => {
        my_medical_supplies.appendSupplyToListContainer(medicalSupply, searchResultsContainer, isSearchResult);
        my_medical_supplies.setupSupplyCardButtonEventHandlers(medicalSupply, isSearchResult);
      });
      break;
    case SearchType.MedicalSuppliesExchangeByText:
      searchResults.forEach(medicalSupply => {
        medical_supplies_exchange.appendSupplyToListContainer(medicalSupply, searchResultsContainer, isSearchResult);
        medical_supplies_exchange.setupSupplyCardButtonEventHandlers(medicalSupply, isSearchResult);
      });
  }
};


const getSearchData = (searchText) => {
  searchContext = window.localStorage.getItem('active_view');
  searchType = getSearchType(searchText, searchContext);
  const searchData = { searchText, searchType };

  // The other citizen that the current user is talking to (note: this is the displayName)
  const privateChatReceiverDisplayName = window.localStorage.getItem('private_chat_receiver');
  if (privateChatReceiverDisplayName) searchData.otherCitizenUsername = privateChatReceiverDisplayName.toLowerCase();

  // Prepare search data for medical supplies exchange
  if (searchType === SearchType.MedicalSuppliesExchangeByText) {
    // Set up the exchangeType depends on the currently selected tab
    searchData.exchangeType = $('#supply-exchange-get-tab').is(':checked') ? 'Offer' : 'Request';
  }
  return searchData;
};

const handleSearchButtonClick = async () => { // eslint-disable-line no-unused-vars
  // Send the search request with a specific context (searchType) and search criteria (searchText)
  $('.load-more-button').addClass('d-none');
  const searchText = $("#search-input-text").val();
  if (searchText.length === 0) return;

  hideNoResultsFoundImage();
  showLoadingAnimation();
  const searchData = getSearchData(searchText);

  try {
    searchResults = await getSearchResults(searchData);

    // Check if the search is stoppped
    const isSearchStopped = window.localStorage.getItem('search_stopped');
    if (isSearchStopped) {
      // Search is stopped, so just show no results found image
      // console.log("Search is stopped");
      hideLoadingAnimation();
      showNoResultsFoundImage();
      $('.load-more-button').addClass('d-none');
      window.localStorage.removeItem('search_stopped');
      return;
    }

    // Search is NOT stopped, so render search results
    hideNoResultsFoundImage();
    hideLoadingAnimation();

    // For loading more results button
    endIndex = DefaultSearchAmount;
    if (searchResults.length > DefaultSearchAmount) $('.load-more-button').removeClass('d-none');
    renderSearchResults(searchResults.slice([0], [DefaultSearchAmount]), searchType);
  } catch (err) {
    console.log(err);
  }
};

const handleShowMoreButtonClick = () => { // eslint-disable-line no-unused-vars
  if (searchResults.length <= endIndex) {
    $('.load-more-button').addClass('d-none');
    renderSearchResults(searchResults.slice([0], [searchResults.length]), searchType);
  } else {
    endIndex += DefaultSearchAmount;
    if (searchResults.length <= endIndex) $('.load-more-button').addClass('d-none');
    renderSearchResults(searchResults.slice([0], [endIndex]), searchType);
  }
};

const handleSearchModalCloseButtonClick = () => { // eslint-disable-line no-unused-vars
  $("#search-input-text").val('');
};

const handleStopSearchButtonClick = () => { // eslint-disable-line no-unused-vars
  // Use local storage to indicate that we don't want the current search result to be rendered
  window.localStorage.setItem('search_stopped', 'true');
  hideLoadingAnimation();
  showNoResultsFoundImage();
};

/* Performance Testing Logics */
let performanceTester;
const handleTestButtonClick = async () => { // eslint-disable-line no-unused-vars
  if (!performanceTester) {
    $('.error-message').removeClass('show');
    const durationInput = $('#durationFormControlInput')[0];
    const intervalInput = $('#intervalFormControlInput')[0];
    if (durationInput.value === '') {
      $('.error-message').addClass('show');
      return;
    }
    if (intervalInput.value === '') {
      return;
    }
    performanceTester = new PerformanceTester(Number.parseInt(durationInput.value), Number.parseInt(intervalInput.value));
    performanceTester.startTesting((res) => {
      const postPerSecond = res.post_per_second;
      const getPerSecond = res.get_per_second;
      if (res.error) {
        alert('POST request limit hit. Do less requests.');
      }
      $('#get-metric').html(getPerSecond);
      $('#post-metric').html(postPerSecond);
      performanceTester = null;
      $('.loader').removeClass('show');
      $('.test-button').html('Start Test');
      $('.test-button').removeClass('btn-danger').addClass('btn-success');
    });

    $('.loader').addClass('show');
    $('.number').html('');
    $('.test-button').html('Stop Test');
    $('.test-button').removeClass('btn-success').addClass('btn-danger');
  } else {
    $('.loader').removeClass('show');
    $('.number').html('NA');
    $('.test-button').html('Start Test');
    $('.test-button').removeClass('btn-danger').addClass('btn-success');
  }
};

const handleMap = async () => { // eslint-disable-line no-unused-vars
  const lat = 50;
  const lon = 40;
  await changeView("map", lat, lon);
};

const handleProfile = async () => { // eslint-disable-line no-unused-vars
  await changeView("address-profile");
};
