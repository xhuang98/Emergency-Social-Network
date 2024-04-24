class MedicalSuppliesExchange extends Component {
  constructor () {
    super('medical-supplies-exchange');
  }

  showElement (element) {
    if (element.hasClass("d-none")) element.removeClass('d-none');
  }

  hideElement (element) {
    if (!element.hasClass("d-none")) element.addClass('d-none');
  }

  onContainerRegister () {
  }

  onUserConnected () {
  }

  onUserDisconnected () {
  }

  onActive () {
  }

  onInactive () {
  }

  appendSupplyToListContainer (supply, listContainer, isSearchResult, isCurrentUser) {
    const formattedTimeStamp = moment(supply.timestamp).format("MM.DD.YYYY, h:mm A");
    const supplyInfoContainerHTMLString = `<div class="my-supply-info-container">
                    <div class="my-supply-name-container"><i class="fa-solid fa-kit-medical" style="font-size:20px; margin-right: 8px;"></i><span class="my-supply-name">${supply.supplyName}</span></div>
                    <div class="my-supply-badge-container">
                        <span class="my-supply-supply-type my-supply-badge badge bg-primary">${supply.supplyType}</span>
                        <span class="my-supply-exchange-type my-supply-badge badge ${supply.exchangeType === 'Offer' ? 'bg-success' : 'bg-danger'}">From: ${supply.user.displayName}</span>
                        <span class="my-supply-quantity my-supply-badge badge bg-secondary">Qty: ${supply.supplyQuantity}</span></div></div>`;
    const supplyTimeStampHTMLString = `<div class="my-supply-modification-time"><span>${formattedTimeStamp}</span></div>`;
    const supplyModificationBtnHTMLString = `<div class="my-supply-modification"><div class="my-supply-modification-icons">
          <button class="supply-exchange-interaction-btn btn btn-primary btn-sm">${supply.exchangeType === 'Offer' ? 'Request' : 'Provide'}</button></div>${supplyTimeStampHTMLString}</div>`;
    listContainer.append(`<div class="my-supply-card" id="${supply._id}-exchange${isSearchResult ? '-search' : ''}">
                    ${supplyInfoContainerHTMLString}${isCurrentUser ? `<div class="my-supply-modification">`+supplyTimeStampHTMLString+`</div>` : supplyModificationBtnHTMLString}</div>`);
  }

  async getMedicalSupplyByIDAndTimestamp (supplyID, timestamp) {
    const token = window.localStorage.getItem('jwttoken');
    if (!token) return resolve({ valid: false });

    const params = `supplyID=${supplyID}&timestamp=${timestamp}`;
    return await authorizedGet('/medical-supplies', params, token);
  }

  // Test if the medical supply in database was updated (check if timestamps match)
  async isSupplyUnchangedInDatabase (supplyID, timestamp) {
    let medicalSupply;
    try {
      medicalSupply = await this.getMedicalSupplyByIDAndTimestamp(supplyID, timestamp);
      if (!medicalSupply) throw "medical supply doesn't exist";
    } catch (error) {
      // console.log("medical supply doesn't exist");
      return false;
    }
    return true;
  }

  // Send an automated message to the supply provider/requester
  async sendAutomatedMedicalSupplyExchangeMessage (supplyDisplayName, supplyName, supplyUsername, supplyExchangeType) {
    const token = window.localStorage.getItem('jwttoken');
    if (!token) return resolve({ valid: false });
    const requestMessageText = `Hey ${supplyDisplayName}, can I get some ${supplyName} from you?`;
    const offerMessageText = `Hey ${supplyDisplayName}, I have some ${supplyName} at my place. Do you need some?`;
    const messageText = {
      text: supplyExchangeType === 'Offer' ? requestMessageText : offerMessageText
    };
    return await authorizedPost(`/private-messages/${supplyUsername}`, JSON.stringify(messageText), '', token);
  }

  // Handle medical supply exchange btn click
  async handleExchangeActivity (supplyUsername, supplyDisplayName, supplyName, supplyExchangeType, exchangeInteractionButton) {
    // Send an automated message to the supply provider/requester
    await this.sendAutomatedMedicalSupplyExchangeMessage(supplyDisplayName, supplyName, supplyUsername, supplyExchangeType);

    // Disable exchangeInteraction button
    exchangeInteractionButton.attr('disabled', 'disabled');
    exchangeInteractionButton.html(`${supplyExchangeType === 'Offer' ? 'Requested' : 'Provided'}`);
  }

  setupSupplyCardButtonEventHandlers (supply, isSearchResult) {
    const mySupplyBtnsContainer = `#${supply._id}-exchange${isSearchResult ? '-search' : ''} .my-supply-modification .my-supply-modification-icons`;

    // Set up supply card interation (request/provide) button click event handler
    const exchangeInteractionButton = $(`${mySupplyBtnsContainer} .supply-exchange-interaction-btn`);
    exchangeInteractionButton.on('click', async () => {
      const isSupplyUnchanged = await this.isSupplyUnchangedInDatabase(supply._id, supply.timestamp);
      if (isSupplyUnchanged) {
        await this.handleExchangeActivity(supply.user.username, supply.user.displayName, supply.supplyName, supply.exchangeType, exchangeInteractionButton);
      } else {
        supplyNotAvailableAlertModal.show();
        this.renderMedicalSuppliesByExchangeType(supply.exchangeType);
      }
    });
  }

  async getMedicalSuppliesByExchangeType (exchangeType, amount = 10) {
    const token = window.localStorage.getItem('jwttoken');
    if (!token) return resolve({ valid: false });
    const params = `exchangeType=${exchangeType}&amount=${amount}`;
    return await authorizedGet('/medical-supplies/supplies-by-exchange-type', params, token);
  }

  // Render all medical supplies by type (Request, Offer)
  async renderMedicalSuppliesByExchangeType (exchangeType) {
    // Display loading animation
    const loaderWrapper = $(".loader-wrapper");
    loaderWrapper.show();

    // Fetch all my medical supplies from database
    const exchangeSuppliesContainer = $('#supply-exchange-cards-container');
    const exchangeSuppliesData = await this.getMedicalSuppliesByExchangeType(exchangeType);

    // Render all my medical supplies
    exchangeSuppliesContainer.empty();
    loaderWrapper.hide();
    const listContainer = $('#supply-exchange-cards-container');
    const isSearchResult = false;
    exchangeSuppliesData.forEach(async (supplyData) => {
      const currentUser = window.localStorage.getItem('current_user');
      const isCurrentUser = supplyData.user.username === currentUser;
      if (supplyData.user.accountStatus === 'active') {
        this.appendSupplyToListContainer(supplyData, listContainer, isSearchResult, isCurrentUser);
        if (!isCurrentUser) this.setupSupplyCardButtonEventHandlers(supplyData, isSearchResult);
      }
    });
  }

  // Set up click event handlers for tabs at the top switching exchange type
  setupExchangeTypeSwitchTabClickEventHandlers () {
    const supplyExchangeGetTab = $('#supply-exchange-get-tab');
    const supplyExchangeProvideTab = $('#supply-exchange-provide-tab');
    supplyExchangeGetTab.on('click', () => {
      supplyExchangeGetTab.prop("checked", true);
      this.renderMedicalSuppliesByExchangeType("Offer");
    });
    supplyExchangeProvideTab.on('click', () => {
      supplyExchangeProvideTab.prop("checked", true);
      this.renderMedicalSuppliesByExchangeType("Request");
    });
  }

  // Adjust height of medical supply exchange cards
  // adjustSupplyExchangeCardsHeight () {
  //   const typeSwitchRadioGroupHeight = $('#supply-exchange-type-switch-container').height();
  //   const overflowWrapperHeight = $('#supply-exchange-overflow-wrapper').height();
  //   const supplyExchangeCards = $('#supply-exchange-cards-container');
  //   const expectedHeightPercentage = (1 - 1.0 * typeSwitchRadioGroupHeight / overflowWrapperHeight) * 100;
  //   supplyExchangeCards.height(expectedHeightPercentage.toString() + '%');
  // }

  onViewFocus () {
    // Set up supply NA alert modal
    supplyNotAvailableAlertModal = new bootstrap.Modal('#supply-exchange-na-alert-modal', { keyboard: false });

    // By deafult, "Get Medical Supply" tab is chosen when user opens the page
    $('#supply-exchange-get-tab').prop("checked", true);
    this.renderMedicalSuppliesByExchangeType("Offer");
    this.setupExchangeTypeSwitchTabClickEventHandlers();
    // this.adjustSupplyExchangeCardsHeight();
  }
}

const medical_supplies_exchange = new MedicalSuppliesExchange();
medical_supplies_exchange.register();

/* Medical supplies exchange vairables */
let supplyNotAvailableAlertModal;
