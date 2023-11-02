let portFromCS;

function connected(port) {
  console.log('connected', port)
  portFromCS = port;
  portFromCS.onMessage.addListener((message) => {
    const { type, payload } = message
    console.log('recieved in background', { type, payload })
    switch (type) {
      case 'fetch':
        fetch(payload)
          .then((response) => {
            return response.text()
          })
          .then((html) => {
            var parser = new DOMParser();
            var doc = parser.parseFromString(html, "text/html");
            console.log('parsed : ', doc);
            portFromCS.postMessage({ type: 'fetch', payload: JSON.parse(JSON.stringify(doc)) })
          })
          .catch((err) => {
            console.log('Failed to fetch page: ', err);
          });
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
