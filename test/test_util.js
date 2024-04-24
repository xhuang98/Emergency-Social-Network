import agent from 'superagent';

const PORT = 3000;
const HOST = 'http://localhost:' + PORT;

const registerUser = async (userCredential) => {
  return new Promise((resolve, reject) => {
    sendPost(HOST + "/users/registration", userCredential).then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      // we return the token so we can use it to authenticate other requests.
      resolve(res.body.token);
    });
  });
};

const sendPost = async (url, data, token) => {
  const request = agent.post(url);
  return await sendRequest({ token, request, data });
};

const sendDelete = async (url, data, token, params) => {
  const request = agent.delete(url);
  return await sendRequest({ token, request, data, params });
};

const sendPut = async (url, data, token) => {
  const request = agent.put(url);
  return await sendRequest({ token, request, data });
};

const sendPostForFile = async (url, token, imagePath) => {
  return new Promise((resolve, reject) => {
    const request = agent.post(url).attach('file', imagePath);
    if (token) request.set('Authorization', 'Bearer ' + token);
    request.then((res, err) => {
      if (err) reject(err);
      resolve(res);
    }).catch((err) => {
      reject(err);
    });
  });
};

const sendGet = async (url, params, token) => {
  const request = agent.get(url);
  return await sendRequest({ token, params, request });
};

const sendRequest = ({ token, params, request, data }) => {
  return new Promise((resolve, reject) => {
    if (token) request.set('Authorization', 'Bearer ' + token);

    // Edge case when we need to set query string for the GET request
    if (params !== '' && params !== undefined) {
      request.query(params).send(data).then((res, err) => {
        if (err) reject(err);
        resolve(res);
      }).catch((err) => reject(err));
    } else {
      request.send(data).then((res, err) => {
        if (err) reject(err);
        resolve(res);
      }).catch((err) => reject(err));
    }
  });
};

export { HOST, PORT, registerUser, sendGet, sendPost, sendPut, sendDelete, sendPostForFile };
