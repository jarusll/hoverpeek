browser.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message
  console.log('recieved in background', {type, payload})
  switch (type) {
    default:
      () => { }
  }
});
