class MyMedicalSupplies extends Component {
  constructor () {
    super('my-medical-supplies');
  }

  showElement (element) {
    if (element.hasClass("d-none")) element.removeClass('d-none');
  }

  hideElement (element) {
    if (!element.hasClass("d-none")) element.addClass('d-none');
  }

  // Pre-fill the update form with current selected supply info
  setupCurrentSupplyInfo (supply) {
    $('#my-supply-creation-name-input').val(supply.supplyName);
    $('#my-supply-creation-quantity-input').val(supply.supplyQuantity);
    $('#my-supply-creation-type-' + supply.supplyType.toLowerCase()).prop("checked", true);
    $('#my-supply-creation-exchange-' + supply.exchangeType.toLowerCase()).prop("checked", true);
  }

  setupSupplyCardButtonEventHandlers (supply, isSearchResult) {
    const mySupplyBtnsContainer = `#${supply._id}${isSearchResult ? '-search' : ''} .my-supply-modification .my-supply-modification-icons`;

    // Set up supply card update button click event handler
    $(`${mySupplyBtnsContainer} .my-supply-initiate-update-btn`).on('click', () => {
      this.displayMyMedicalSupplyForm(FORM_TYPE.UPDATE, supply);
    });
    // Set up supply card delete button click event handler
    $(`${mySupplyBtnsContainer} .my-supply-initiate-deletion-btn`).on('click', () => {
      this.handleMySupplyDeletion(supply._id, isSearchResult);
    });
  }

  sanityCheckMySupplyFormData (formData) {
    if (!formData || formData.length !== MY_SUPPLY_FORM_DATA_LENGTH) return false;
    for (const data of formData) {
      if (!data.value || data.value.length === 0) return false;
    }
    return true;
  }

  displayMyMedicalSupplyCreationForm (creationButton, updateButton, formLabel) {
    this.showElement(creationButton);
    this.hideElement(updateButton);
    // Set up creation form header
    formLabel.html('Create A New Supply Request/Offer');
    // Clear out form data
    const form = $('#my-supply-form');
    form.trigger('reset');
  }

  displayMyMedicalSupplyUpdateForm (creationButton, updateButton, formLabel) {
    this.showElement(updateButton);
    this.hideElement(creationButton);
    // Set up update form header
    formLabel.html('Update A Supply Request/Offer');
  }

  displayMyMedicalSupplyForm (formType, supplyInfo) {
    // Hide Error Message Box
    const errorMsgBox = $('#my-supply-from-error-msg-box');
    this.hideElement(errorMsgBox);

    // Only show one button and corresponding form label depending on formType
    const creationButton = $('#my-supply-creation-btn');
    const updateButton = $('#my-supply-update-btn');
    const formLabel = $('#my-supply-form-modal-label');
    switch (formType) {
      case FORM_TYPE.CREATION:
        this.displayMyMedicalSupplyCreationForm(creationButton, updateButton, formLabel);
        break;
      case FORM_TYPE.UPDATE:
        this.displayMyMedicalSupplyUpdateForm(creationButton, updateButton, formLabel);
        // Update current supply info
        currSupply = supplyInfo;
        // Pre-fill the update form with current supply info
        this.setupCurrentSupplyInfo(supplyInfo);
    }

    formModal = new bootstrap.Modal('#my-supply-form-modal', { keyboard: false });
    formModal.show();
  }

  hideMyMedicalSupplyForm () {
    formModal.hide();
  }

  appendSupplyToListContainer (supply, listContainer, isSearchResult) {
    const formattedTimeStamp = moment(supply.timestamp).format("MM.DD.YYYY, h:mm A");
    listContainer.append(`<div class="my-supply-card" id="${supply._id}${isSearchResult ? '-search' : ''}">
                <div class="my-supply-info-container">
                    <div class="my-supply-name-container"><i class="fa-solid fa-kit-medical" style="font-size:20px; margin-right: 8px;"></i><span class="my-supply-name">${supply.supplyName}</span></div>
                    <div class="my-supply-badge-container">
                        <span class="my-supply-exchange-type my-supply-badge badge ${supply.exchangeType === 'Offer' ? 'bg-success' : 'bg-danger'}">${supply.exchangeType}</span>
                        <span class="my-supply-supply-type my-supply-badge badge bg-primary">${supply.supplyType}</span>
                        <span class="my-supply-quantity my-supply-badge badge bg-secondary">Qty: ${supply.supplyQuantity}</span>
                    </div>
                </div>
                <div class="my-supply-modification">
                    <div class="my-supply-modification-icons">
                        <button class="my-supply-modification-btn my-supply-initiate-update-btn btn btn-sm btn-outline-primary" style="margin-right: 10px;"><i class="bi bi-pencil-square"></i></button>
                        <button class="my-supply-modification-btn my-supply-initiate-deletion-btn btn btn-sm btn-outline-danger"><i class="bi bi-trash-fill"></i></button>
                    </div>
                    <div class="my-supply-modification-time"><span>${formattedTimeStamp}</span></div>
                </div></div>`
    );
  }

  async createMedicalSupply (supplyName, supplyQuantity, supplyType, exchangeType) {
    const token = window.localStorage.getItem('jwttoken');
    if (!token) return resolve({ valid: false });
    const data = { supplyName, supplyQuantity, supplyType, exchangeType };
    return await authorizedPost('/medical-supplies', JSON.stringify(data), '', token);
  }

  async getMyMedicalSupplies () {
    const token = window.localStorage.getItem('jwttoken');
    if (!token) return resolve({ valid: false });
    return await authorizedGet('/medical-supplies/supplies-by-creator', '', token);
  }

  async updateMedicalSupplyByID (supplyID, newSupply) {
    const token = window.localStorage.getItem('jwttoken');
    if (!token) return resolve({ valid: false });
    const data = { supplyID, newSupply };
    return await authorizedPut('/medical-supplies', JSON.stringify(data), '', token);
  }

  async deleteMedicalSupplyByID (supplyID) {
    const token = window.localStorage.getItem('jwttoken');
    if (!token) return resolve({ valid: false });
    const params = `supplyID=${supplyID}`;
    return await authorizedDelete('/medical-supplies', params, token);
  }

  async handleMySupplyFormSubmit (formType) {
    const errorMsgBox = $('#my-supply-from-error-msg-box');
    const form = $('#my-supply-form');
    const formData = form.serializeArray();

    // Sanity check form data
    if (!this.sanityCheckMySupplyFormData(formData)) {
      errorMsgBox.html('No empty form input allowed');
      this.showElement(errorMsgBox);
      return;
    }

    // Parse form data
    const [supplyName, supplyQuantity, supplyType, exchangeType] = formData.map(data => data.value);

    // Handle either creation form or update form submit
    switch (formType) {
      case FORM_TYPE.CREATION:
        this.handleMySupplyCreationFormSubmit(errorMsgBox, supplyName, supplyQuantity, supplyType, exchangeType);
        break;
      case FORM_TYPE.UPDATE:
        this.handleMySupplyUpdateFormSubmit(errorMsgBox, supplyName, supplyQuantity, supplyType, exchangeType);
    }

    // Reset the form data (get ready for the next supply creation/update)
    form.trigger("reset");
    this.hideElement(errorMsgBox);
    this.hideMyMedicalSupplyForm();
  }

  async handleMySupplyCreationFormSubmit (errorMsgBox, supplyName, supplyQuantity, supplyType, exchangeType) {
    let newSupply;
    try {
      newSupply = await this.createMedicalSupply(supplyName, supplyQuantity, supplyType, exchangeType);
    } catch (createError) {
      // Creation failure
      errorMsgBox.html('No duplicate supply request/offer allowed');
      this.showElement(errorMsgBox);
      return;
    }

    // Creation success
    const listContainer = $('#my-supply-cards-container');
    const isSearchResult = false;
    this.appendSupplyToListContainer(newSupply, listContainer, isSearchResult);
    this.setupSupplyCardButtonEventHandlers(newSupply, isSearchResult);
  }

  async handleMySupplyUpdateFormSubmit (errorMsgBox, supplyName, supplyQuantity, supplyType, exchangeType) {
    const newSupply = { supplyName, supplyQuantity, supplyType, exchangeType };
    const oldSupply = { supplyName: currSupply.supplyName, supplyQuantity: currSupply.supplyQuantity, supplyType: currSupply.supplyType, exchangeType: currSupply.exchangeType };

    // We don't need to update database if old and new info are the same
    if (JSON.stringify(oldSupply) === JSON.stringify(newSupply)) return;

    try {
      await this.updateMedicalSupplyByID(currSupply._id, newSupply);
    } catch (updateError) {
      // Update failure
      errorMsgBox.html('Update failed; No duplicate supply request/offer allowed');
      this.showElement(errorMsgBox);
      return;
    }

    // Update success - just naive re-render
    await this.renderMyMedicalSupplies();
    searchModal.hide();
  }

  // Handing my supply card's deletion
  async handleMySupplyDeletion (supplyID, isSearchResult) {
    // TODO: add deletion confirmation pop up

    try {
      await this.deleteMedicalSupplyByID(supplyID);
    } catch (deleteError) {
      // Deletion failure
      console.log("Deletion failed");
      return;
    }

    // Deletion success
    $(`#${supplyID}`).remove();
    if (isSearchResult) $(`#${supplyID}-search`).remove();
  }

  onContainerRegister () {
  }

  onActive () {
  }

  onInactive () {
  }

  // Render all my medical supplies
  async renderMyMedicalSupplies () {
    // Display loading animation
    const loaderWrapper = $(".loader-wrapper");
    loaderWrapper.show();

    // Fetch all my medical supplies from database
    const mySuppliesContainer = $('#my-supply-cards-container');
    const mySuppliesData = await this.getMyMedicalSupplies();

    // Render all my medical supplies
    mySuppliesContainer.empty();
    loaderWrapper.hide();
    const listContainer = $('#my-supply-cards-container');
    const isSearchResult = false;
    mySuppliesData.forEach(supplyData => {
      this.appendSupplyToListContainer(supplyData, listContainer, isSearchResult);
      this.setupSupplyCardButtonEventHandlers(supplyData, isSearchResult);
    });
  }

  // Set up medical supply creation and update form submit button click event handlers
  setupFormSubmitButtonClickEventHandlers (isSearchResult) { // eslint-disable-line no-unused-vars
    const mySupplyCreationBtn = $('#my-supply-creation-btn');
    const mySupplyUpdateBtn = $('#my-supply-update-btn');
    mySupplyCreationBtn.on('click', () => { this.handleMySupplyFormSubmit(FORM_TYPE.CREATION); });
    mySupplyUpdateBtn.on('click', () => { this.handleMySupplyFormSubmit(FORM_TYPE.UPDATE); });
  }

  // Adjust height of my supply cards
  adjustSupplyCardsHeight () {
    const openCreationFormBtnHeight = $('#my-supply-open-creation-form-btn-container').height();
    const overflowWrapperHeight = $('#my-supply-overflow-wrapper').height();
    const mySupplyCards = $('#my-supply-cards-container');
    const expectedHeightPercentage = (1 - 1.0 * openCreationFormBtnHeight / overflowWrapperHeight) * 100;
    mySupplyCards.height(expectedHeightPercentage.toString() + '%');
  }

  onViewFocus () {
    const isSearchResult = false;
    this.renderMyMedicalSupplies();
    this.setupFormSubmitButtonClickEventHandlers(isSearchResult);
    this.adjustSupplyCardsHeight();
  }
}

const my_medical_supplies = new MyMedicalSupplies();
my_medical_supplies.register();

/* My medical supplies vairables */
const MY_SUPPLY_FORM_DATA_LENGTH = 4;
const FORM_TYPE = {
  CREATION: 'creation',
  UPDATE: 'update'
};

let formModal;
// Keep track of current supply info (supply that is going to be updated)
let currSupply;
