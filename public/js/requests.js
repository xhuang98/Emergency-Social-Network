$.ajaxSetup({
  contentType: "application/json;charset=utf-8"
});

function getBackendURL (backendURL, route, params) {
  let url = backendURL + route;
  if (params !== '' && params !== undefined) {
    url += '?' + params;
  }
  return url;
}

function post (apiUrl, data = null, params = '') { // eslint-disable-line no-unused-vars
  const url = getBackendURL(backendURL, apiUrl, params);
  return $.post(url, data);
}

function authorizedPost (apiUrl, data = null, params = '', token) { // eslint-disable-line no-unused-vars
  const url = getBackendURL(backendURL, apiUrl, params);
  return $.ajax({
    url,
    type: 'POST',
    data,
    headers: {
      Authorization: "Bearer " + token
    }
  });
}

function authorizedPut (apiUrl, data = null, params = '', token) { // eslint-disable-line no-unused-vars
  const url = getBackendURL(backendURL, apiUrl, params);
  return $.ajax({
    url,
    type: 'PUT',
    data,
    headers: {
      Authorization: "Bearer " + token
    }
  });
}

function authorizedGet (apiUrl, params, token) { // eslint-disable-line no-unused-vars
  const url = getBackendURL(backendURL, apiUrl, params);
  return $.ajax({
    url,
    type: 'GET',
    param: params,
    headers: {
      Authorization: "Bearer " + token
    }
  });
}

function authorizedPostForFiles (apiUrl, data = null, params = '', token) { // eslint-disable-line no-unused-vars
  const url = getBackendURL(backendURL, apiUrl, params);
  return $.ajax({
    url,
    type: 'POST',
    data,
    contentType: false,
    processData: false,
    headers: {
      Authorization: "Bearer " + token
    }
  });
}

function authorizedDelete (apiUrl, params, token) { // eslint-disable-line no-unused-vars
  const url = getBackendURL(backendURL, apiUrl, params);
  return $.ajax({
    url,
    type: 'DELETE',
    param: params,
    headers: {
      Authorization: "Bearer " + token
    }
  });
}
