import MedicalProvider from '../models/medical_provider.js';

class MPSearcher {
  constructor (query) {
    this.query = query;
  }

  async searchByCoordinates (amount = 10) {
    const targetLongitude = this.query[0];
    const targetLatitude = this.query[1];
    let medicalProvidersFound = MPSearcher.sortByDistance(targetLongitude, targetLatitude, await MedicalProvider.getAllMedicalProviders());
    if (medicalProvidersFound.length > amount) {
      medicalProvidersFound = medicalProvidersFound.slice(0, amount);
    }
    return medicalProvidersFound.map(mp => {
      let item;
      if (mp._doc) {
        item = Object.assign({}, mp._doc);
      } else {
        item = Object.assign({}, mp);
      }
      item.distance = MPSearcher.calculateDistanceKM(targetLongitude, targetLatitude, mp.longitude, mp.latitude);
      return item;
    });
  }


  async searchByName (amount = 10) {
    let medicalProvidersFound = [];
    if (this.query !== "") {
      medicalProvidersFound = await MedicalProvider.findByPartialName(this.query);
      if (medicalProvidersFound.length > amount) {
        medicalProvidersFound = medicalProvidersFound.slice(0, amount);
      }
    }
    return medicalProvidersFound;
  }

  static sortByDistance (targetLongitude, targetLatitude, medicalProviders) {
    medicalProviders.sort((a, b) => MPSearcher.calculateDistanceKM(a.longitude, a.latitude, targetLongitude, targetLatitude) - MPSearcher.calculateDistanceKM(b.longitude, b.latitude, targetLongitude, targetLatitude));
    return medicalProviders;
  }


  static calculateDistanceKM (lon1, lat1, lon2, lat2) {
    // https://www.geeksforgeeks.org/program-distance-two-points-earth/
    // The math module contains a function
    // named toRadians which converts from
    // degrees to radians.
    lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula
    const dlon = lon2 - lon1;
    const dlat = lat2 - lat1;
    const a = Math.pow(Math.sin(dlat / 2), 2) +
                 Math.cos(lat1) * Math.cos(lat2) *
                 Math.pow(Math.sin(dlon / 2), 2);

    const c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    const r = 6371;

    // calculate the result
    return (c * r);
  }
}

export default MPSearcher;
