class PerformanceTester { // eslint-disable-line no-unused-vars
  constructor (duration, interval) {
    this.duration = duration * 1000;
    this.interval = interval;
    this.correct_get = 0;
    this.correct_post = 0;
    this.get_finished = false;
    this.post_finished = false;
    this.started = false;
    this.post_requests = [];
  }

  async blockWebsite () {
    await this.postBlock(true, this.duration);
  }

  async unblockWebsite () {
    await this.postBlock(false, this.duration);
  }

  async stopTest () {
    this.started = false;
    await this.unblockWebsite();
  }

  isTesting () {
    return this.started;
  }

  async startTesting (callback) {
    this.started = true;
    await this.blockWebsite();
    await this._sendPostRequests();

    if (!this.started) {
      callback({ post_per_second: 'NA', get_per_second: 'NA', error: true });
      return;
    }

    this._sendGetRequests();

    await this.waitFor(this.getGetDuration());
    this.get_finished = true;

    await this.stopTest();
    callback(this.getResults());
  }

  async _sendPostRequests () {
    this._postCycle();
    await this.waitFor(this.getPostDuration());
    this.post_finished = true;
    this.post_requests.forEach(request => {
      request.abort();
    });
  }

  _postCycle () {
    const postCycle = setInterval(async () => {
      if (this.correct_post > 999) {
        this.started = false;
        clearInterval(postCycle);
        return;
      }
      if (this.started && !this.post_finished) {
        await this.sendPostRequest();
        this.correct_post += 1;
        return;
      }
      clearInterval(postCycle);
    }, this.getPostInterval());
  }

  _sendGetRequests () {
    const getCycle = setInterval(async () => {
      if (this.get_finished || !this.started) {
        clearInterval(getCycle);
        return;
      }
      await this.sendGetRequest();
      this.correct_get += 1;
    }, this.getGetInterval());
  }

  async sendPostRequest () {
    const token = window.localStorage.getItem('jwttoken');
    const data = { text: 'aaaaabbbbbcccccddddd' };
    const request = authorizedPost('/public-messages', JSON.stringify(data), 'admin=true&test=true', token);
    this.post_requests.push(request);
  }

  async waitFor (duration) {
    return new Promise((resolve, reject) => { // eslint-disable-line no-unused-vars
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  async sendGetRequest () {
    const token = window.localStorage.getItem('jwttoken');

    return await authorizedGet('/public-messages', 'admin=true&test=true', token);
  }

  async postBlock (value, duration) {
    const token = window.localStorage.getItem('jwttoken');
    let params = 'set=' + value;
    if (duration) {
      params += '&duration=' + duration;
    }
    return await authorizedPost('/block', null, params, token);
  }

  getResults () {
    return {
      correct_get: this.correct_get,
      correct_post: this.correct_post,
      post_per_second: this.getPostPerSecond(),
      get_per_second: this.getGetPerSecond()
    };
  }

  getPostInterval () {
    return this.interval;
  }

  getGetInterval () {
    return this.interval;
  }

  getPostDuration () {
    return this.duration / 2;
  }

  getGetDuration () {
    return this.duration / 2;
  }

  getPostPerSecond () {
    return (this.correct_post * 1000 / this.duration).toFixed(2);
  }

  getGetPerSecond () {
    return (this.correct_get * 1000 / this.duration).toFixed(2);
  }
}
