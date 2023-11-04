const HEIGHT = 600
const WIDTH = 500

function saveSettings(settings) {
  browser.storage.local.set({
    height: parseInt(settings?.height, 10),
    width: parseInt(settings?.width, 10),
  }).then(
    () => console.log('Set global values'),
    () => console.log('Setting global values failed'))
}

browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.set({
    height: HEIGHT,
    width: WIDTH,
  }).then(
    () => console.log('Set global values'),
    () => console.log('Setting global values failed'))
})

browser.runtime.onMessage.addListener((message, _, sendResponse) => {
  console.log(message);
  const { type, payload } = message
  switch (type) {
    case "save-settings":
      saveSettings(payload)
      sendResponse({ status: "saved" });
      break
    default:
      sendResponse({ status: "nothing" });
  }
});
