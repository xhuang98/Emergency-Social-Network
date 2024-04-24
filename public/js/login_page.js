// To suppress form default behavior
$("#join-community-form").on("submit", function (event) {
  event.preventDefault();
});

// When index page loads
window.onload = async (event) => { // eslint-disable-line no-unused-vars
  const response = await validateJWT();
  if (response.valid) {
    if (response.acknowledgedRules) {
      window.location = getBackendURL(backendURL, '/dashboard');
      return;
    }
    $(".loader-wrapper").removeClass('show');
    welcomeModal.show();
  }
};

const joinCommunityConfirmationModal = new bootstrap.Modal('#joinCommunityConfirmationStaticBackdropModal', {
  keyboard: false
});

const validateUser = async function (data) {
  return await post('/users/validation', JSON.stringify(data));
};

const validateJWT = async function () {
  const token = window.localStorage.getItem('jwttoken');
  if (!token) {
    return { valid: false };
  }
  return await authorizedPost('/users/token-validation', null, '', token);
};

const loginUser = async function (data) {
  return await post('/users/authentication', JSON.stringify(data));
};

const signupUser = async function (data) {
  return await post('/users/registration', JSON.stringify(data));
};

const acknowledgedRules = async function () {
  const token = window.localStorage.getItem('jwttoken');
  return await authorizedPost('/users/acknowledgment', null, '', token);
};

$(".join-button").on("click", async function () {
  $(".error-message-box").removeClass('show');
  $(".loader-wrapper").addClass('show');
  const formValue = $("form").serializeArray();
  if (formValue[0].value === '' || formValue[1].value === '') {
    return showErrorMessage("Username or password fields cannot be empty");
  }

  const data = { username: formValue[0].value, password: formValue[1].value };
  let userValidation;
  try {
    userValidation = await validateUser(data);
  } catch (error) {
    console.log(error.responseJSON);
    if (error.responseJSON.blocked) {
      return showErrorMessage('We are performing maintainence. Please try again after some time');
    } else {
      return showErrorMessage('Oops it seems we encountered a problem. Please try again after some time');
    }
  }

  if (!userValidation.validation_success) {
    // we display error
    return showErrorMessage(userValidation.message);
  }
  if (userValidation.user_exists) {
    // We can login.
    try {
      const loginData = await loginUser(data);
      window.localStorage.setItem('current_user', data.username.toLowerCase());
      window.localStorage.setItem('jwttoken', loginData.token);
      // check if they have acknowledge rules or not.
      if (loginData.acknowledgedRules) {
        window.location = getBackendURL(backendURL, '/dashboard');
        return;
      }
      // we show them the thing to accept.
      showWelcomeModal();
    } catch (err) {
      showErrorMessage(err.message);
    }
    return;
  }
  // Display registration confirmation
  showJoinCommunityConfirmationModal();
});

const welcomeModal = new bootstrap.Modal('#welcome-modal', {
  keyboard: false
});

$('#joinCommunityConfirmButton').on("click", async function () {
  const formValue = $("form").serializeArray();
  const data = { username: formValue[0].value, password: formValue[1].value };

  joinCommunityConfirmationModal.hide();
  $(".loader-wrapper").addClass('show');
  try {
    const signedUpUser = await signupUser(data);
    window.localStorage.setItem('current_user', data.username.toLowerCase());
    window.localStorage.setItem('jwttoken', signedUpUser.token);
    $("form")[0].reset();
    showWelcomeModal();
  } catch (err) {
    showErrorMessage(err.message);
  }
});

$('#acknowledge-button').on("click", async function () {
  welcomeModal.hide();
  $(".loader-wrapper").addClass('show');
  try {
    await acknowledgedRules();
    window.location = getBackendURL(backendURL, '/dashboard');
  } catch (err) {
    showErrorMessage(err.message);
  }
});

function showErrorMessage (message) {
  $(".loader-wrapper").removeClass('show');
  $(".error-message-box").addClass('show');
  if (message) {
    $(".error-message-box span").text(message);
  } else {
    $(".error-message-box span").text('Username or password is incorrect');
  }
}

function showWelcomeModal () {
  $(".loader-wrapper").removeClass('show');
  welcomeModal.show();
}

function showJoinCommunityConfirmationModal () {
  $(".loader-wrapper").removeClass('show');
  joinCommunityConfirmationModal.show();
}
