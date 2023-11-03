const HEIGHT = 600
const WIDTH = 400

browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.set({
    height: HEIGHT,
    width: WIDTH
  }).then(
    () => console.log('Set global values'),
    () => console.log('Setting global values failed'))
})
