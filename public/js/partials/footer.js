function initializeDefaultView () {
  // This is the default view.
  let activeView = window.localStorage.getItem("active_view");
  if (!activeView) activeView = "esn-list"; // default one.
  if (activeView === "map") activeView = "esn-list"; // we dont want to reload map tbh.
  changeView(activeView);
}

initializeDefaultView();
