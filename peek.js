const HEIGHT = 600
const WIDTH = 400
const width = window.innerWidth;
const height = window.innerHeight;

const DEBUG_MODE = true

// UTILS
class Logger {
  static fail(obj) {
    if (DEBUG_MODE)
      console.error(obj)
  }
  static log(obj) {
    if (DEBUG_MODE)
      console.log(obj)
  }
}

function strip(dom) {
  const strippedText = dom.body.textContent || "";
  return strippedText.replace(/(\r\n|\n|\r)/gm, "");
}

function killHoverflow() {
  const hoverFlow = document.getElementById('hoverflow')
  hoverFlow.style.display = 'none'
}

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

function getAnchorTag(event) {
  let anchorTag = null
  if (event?.target?.parentNode?.parentNode?.tagName.toLowerCase() === 'a') {
    anchorTag = event.target.parentNode.parentNode;
  }
  if (event?.target?.parentNode?.tagName.toLowerCase() === 'a') {
    anchorTag = event.target.parentNode;
  }
  if (event?.target?.tagName.toLowerCase() === 'a') {
    anchorTag = event.target;
  }
  return anchorTag;
}

function getPageAndCache(anchorTag) {
  if (anchorTag === null)
    return
  const url = anchorTag.href;
  if (cache.has(anchorTag)) {
    Logger.log({
      url: anchorTag?.href,
      cacheHit: strip(cache.get(anchorTag))
    })
    killHoverflow()
    return cache.get(anchorTag)
  }
  Logger.log({
    fetch: url
  })
  fetch(url, {
    mode: 'no-cors',
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    }
  })
    .then((response) => {
      return response.text();
    })
    .then((html) => {
      var doc = parser.parseFromString(html, "text/html");
      Logger.log({
        url,
        response: doc
      })
      cache.set(anchorTag, doc)
      const urlObj = new URL(url)
      if (urlObj.hash) {
        const hashAnchor = document.createElement('a')
        hashAnchor.id = 'jumptocontent'
        hashAnchor.href = urlObj.hash
        hashAnchor.textContent = 'Jump to content'
        doc.body.prepend(hashAnchor)
      }
      hoverFlow.srcdoc = new XMLSerializer().serializeToString(doc);
    })
    .catch((err) => {
      Logger.fail({
        url,
        error: err,
        message: err.message
      })
    });
}


// GLOBALS
const cache = new WeakMap()
const parser = new DOMParser();
const hoverflowContainer = document.createElement('div');
hoverflowContainer.position = 'absolute';
hoverflowContainer.top = 0;
hoverflowContainer.left = 0;
hoverflowContainer.width = '100%';
hoverflowContainer.height = '100%';

const hoverFlow = document.createElement('iframe')
hoverFlow.id = 'hoverflow'
hoverFlow.height = HEIGHT
hoverFlow.width = WIDTH
hoverFlow.style.background = 'white'
hoverFlow.style.position = 'absolute'
hoverFlow.style.zIndex = 2147483647
hoverFlow.position = 'relative';
hoverFlow.sandbox = ""
hoverFlow.style.border = '2px solid black'
hoverFlow.style.display = 'none'

hoverflowContainer?.prepend(hoverFlow)
document?.body?.prepend(hoverflowContainer)

let visible = false

// Dont destroy peek if user hovers back in 250ms
hoverFlow.addEventListener('mouseenter', debounce(() => {
  visible = true
}))

hoverFlow.addEventListener('mouseover', debounce(() => {
  visible = true
}))

hoverFlow.addEventListener('mouseout', debounce(() => {
  visible = false
  setTimeout(() => {
    if (!visible)
      killHoverflow()
  }, 500);
}))

document.addEventListener('mouseover', debounce((event) => {
  const anchorTag = getAnchorTag(event);

  if (anchorTag) {
    visible = true
    const { clientX: x, clientY: y } = event;
    const scrollLeft = document.documentElement.scrollLeft;
    const scrollTop = document.documentElement.scrollTop;
    let leftAnchor = x + scrollLeft;
    let topAnchor = y + scrollTop;
    // Clamp the frame in viewport
    let previewBottom = parseInt(y, 10) + parseInt(hoverFlow.height, 10);
    if (previewBottom > height) {
      const extra = previewBottom - height
      topAnchor -= extra
    }
    const previewRight = parseInt(x, 10) + parseInt(hoverFlow.width, 10);
    if (previewRight > width) {
      const extra = previewRight - width
      leftAnchor -= extra
    }
    hoverFlow.style.top = topAnchor + 'px'
    hoverFlow.style.left = leftAnchor + 'px'

    if (anchorTag?.href) {
      hoverFlow.style.display = 'block'
    }
  }
}, 50));

// prefetch on hover
document.addEventListener('mouseover', (event) => {
  const anchorTag = getAnchorTag(event);
  getPageAndCache(anchorTag);
})

