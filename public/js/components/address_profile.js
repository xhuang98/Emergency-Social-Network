class AddressProfile extends Component {
  constructor () {
    super("address-profile");
  }

  onContainerRegister () {
  }

  onViewFocus () {

  }

  async createAddress () {
    const streetline1 = $('#streetline1')[0].value;
    const streetline2 = $('#streetline2')[0].value;
    const city = $('#city')[0].value;
    const zipCode = $('#zipCode')[0].value;

    if (!/^\d+$/.test(zipCode)) {
      this.measurePerformanceModal = new bootstrap.Modal('#checkZipCode', {
        keyboard: false
      });
      this.measurePerformanceModal.show();
      return;
    }

    const data = { streetline1, streetline2, city, zipCode };

    await authorizedPost('/address', JSON.stringify(data), '', token);
    await changeView("esn-list");
  }

  closeModal () {
    this.measurePerformanceModal.hide();
  }

  async updateAddress () {
    const streetline1 = $('#streetline1')[0].value;
    const streetline2 = $('#streetline2')[0].value;
    const city = $('#city')[0].value;
    const zipCode = $('#zipCode')[0].value;
    if (!/^\d+$/.test(zipCode)) {
      this.measurePerformanceModal = new bootstrap.Modal('#checkZipCode', {
        keyboard: false
      });
      this.measurePerformanceModal.show();
      return;
    }

    const data = { streetline1, streetline2, city, zipCode };

    await authorizedPut('/address', JSON.stringify(data), '', token);
    await changeView("esn-list");
  }

  deleteAddressConfirm () {
    this.measurePerformanceModal = new bootstrap.Modal('#deleteAddressModal', {
      keyboard: false
    });
    this.measurePerformanceModal.show();
  }

  async deleteAddress () {
    await authorizedDelete('/address', '', token);
    await changeView("esn-list");
    if (this.measurePerformanceModal) { this.measurePerformanceModal.hide(); }
  }
}
const address = new AddressProfile();
address.register();
