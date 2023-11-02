let connection = browser.runtime.connect({ name: "port-from-cs" });

connection.onMessage.addListener((message) => {
  console.log('recieved document', message)
  const element = message.getElementByTagName('html')
  console.log('html doc', element[0].innerHTML);
})

function debounce(func, wait, immediate = false) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

console.clear()
const hoverflowContainer = document.createElement('div');
hoverflowContainer.position = 'absolute';
hoverflowContainer.top = 0;
hoverflowContainer.left = 0;
hoverflowContainer.width = '100%';
hoverflowContainer.height = '100%';
const hoverFlow = document.createElement('iframe')
hoverFlow.id = 'hoverflow'
hoverFlow.addEventListener('mouseout', () => {
  setTimeout(() => {
    hoverFlow.remove()
  }, 1000)
})

hoverFlow.height = 400
hoverFlow.width = 400
hoverFlow.style.position = 'absolute'
hoverFlow.style.zIndex = 2147483647
hoverFlow.position = 'relative';
hoverFlow.sandbox = ""
hoverFlow.style.resize = "both"
hoverFlow.overflow = 'hidden';
hoverFlow.paddingTop = '56.25%'; /* 16:9 Aspect Ratio */

document.addEventListener('mouseover', debounce((event) => {
  console.log('tag : ', event.target.tagName.toLowerCase())
  let anchorTag = null
  if (event.target?.parentNode.tagName.toLowerCase() === 'a') {
    anchorTag = event.target.parentNode
  }
  if (event.target.tagName.toLowerCase() === 'a') {
    anchorTag = event.target
  }

  if (anchorTag) {
    const { clientX: x, clientY: y } = event;
    const scrollLeft = document.documentElement.scrollLeft;
    const scrollTop = document.documentElement.scrollTop;
    hoverFlow.style.top = y + scrollTop + 'px'
    hoverFlow.style.left = x + scrollLeft + 'px'
    // hoverFlow.src = anchorTag.href
    hoverflowContainer.prepend(hoverFlow)
    document.body.prepend(hoverflowContainer)

    if (anchorTag?.href) {
      console.log('Sending fetch')
      fetch(anchorTag.href)
        .then((response) => {
          return response.text()
        })
        .then((html) => {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, "text/html");
          console.log('parsed', new XMLSerializer().serializeToString(doc))
          hoverFlow.srcdoc = new XMLSerializer().serializeToString(doc)
        })
        .catch((err) => {
          console.log('Failed to fetch page: ', err);
        });
    }
  }
}, 300));
