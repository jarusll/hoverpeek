let HEIGHT = 600
let WIDTH = 500
const width = window.innerWidth;
const height = window.innerHeight;

if (document.readyState == 'loading') {
  document.addEventListener('DOMContentLoaded', getSettings);
} else {
  getSettings();
}

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
  static debug(obj) {
    if (DEBUG_MODE)
      console.debug(obj)
  }
}

function getSettings() {
  browser.storage.local.get(['height', 'width']).then(settings => {
    Logger.debug({
      settings
    })
    hoverFlow.height = settings?.height ?? HEIGHT;
    hoverFlow.width = settings?.width ?? WIDTH;
  });
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
  let timeout;
  return function () {
    let context = this, args = arguments;
    let later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
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
  // before pushing to abort queue, abort other requests
  const controller = new AbortController();
  abortControllers.push(controller)
  fetch(url, {
    signal: controller.signal,
    mode: 'no-cors',
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    }
  })
    .then((response) => {
      return response.text();
    })
    .then((html) => {
      let doc = parser.parseFromString(html, "text/html");
      Logger.log({
        url,
        response: doc
      })
      cache.set(anchorTag, doc)
      const urlObj = new URL(url)
      removeHeadersAndFooters(doc);

      if (urlObj.hash) {
        const hashAnchor = document.createElement('a')
        hashAnchor.id = 'jumptocontent'
        hashAnchor.href = urlObj.hash
        hashAnchor.textContent = 'Jump to content'
        doc.body.prepend(hashAnchor)
        const customStyles = document.createElement('style')
        customStyles.textContent = `
        img {
          max-width: ${WIDTH} !important;
        }
        `
        doc.head.prepend(customStyles)
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
let abortControllers = []
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
hoverFlow.style.position = 'absolute'
hoverFlow.style.zIndex = 2147483647
hoverFlow.position = 'relative';
hoverFlow.style.border = '2px solid black'
hoverFlow.style.display = 'none'

hoverflowContainer?.prepend(hoverFlow)
document?.body?.prepend(hoverflowContainer)

let visible = false
let peek = false

// Dont destroy peek if user hovers back in 250ms
hoverFlow.addEventListener('mouseenter', debounce(() => {
  peek = true
  visible = true
}))

hoverFlow.addEventListener('mouseover', debounce(() => {
  peek = true
  visible = true
}))

hoverFlow.addEventListener('mouseout', debounce(() => {
  peek = false
  abortControllers.forEach(controller => controller.abort())
  abortControllers = []
  visible = false
  setTimeout(() => {
    if (!visible) {
      killHoverflow()
    }
  }, 500);
}))

document.addEventListener('keydown', (event) => {
  if (event.key === 'Control') {
    Logger.debug("CONTROL DOWN")
    peek = true
  }
})

document.addEventListener('keyup', (event) => {
  if (event.key === 'Control') {
    Logger.debug("CONTROL UP")
    peek = false
  }
})

document.addEventListener('mouseover', debounce((event) => {
  if (!peek)
    return

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
  if (!peek)
    return
  const anchorTag = getAnchorTag(event);
  getPageAndCache(anchorTag);
})

function removeHeadersAndFooters(doc) {
  let headers = doc.getElementsByTagName("header");
  for (let i = 0; i < headers.length; i++) {
    headers[i].remove();
  }

  let footers = doc.getElementsByTagName("footer");
  for (let i = 0; i < footers.length; i++) {
    footers[i].remove();
  }
}

