let portFromCS;

function connected(port) {
  console.log('connected', port)
  portFromCS = port;
  portFromCS.onMessage.addListener((message) => {
    const { type, payload } = message
    console.log('recieved in background', { type, payload })
    switch (type) {
      case 'fetch':
        break
      default:
        () => { }
    }
  });
}

browser.runtime.onConnect.addListener(connected);

browser.runtime.onInstalled.addListener(() => {
  console.clear()
  console.log('Extension installed');
});
