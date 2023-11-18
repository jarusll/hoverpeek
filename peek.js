let HEIGHT = 600
let WIDTH = 500
const HOVERPEEK_ID = 'hoverpeek';
const CLOSEBUTTON_ID = 'hoverpeek_close';
const width = window.innerWidth;
const height = window.innerHeight;

if (document.readyState == 'loading') {
  document.addEventListener('DOMContentLoaded', getSettings);
} else {
  getSettings();
}

const DEBUG_MODE = false

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
    hoverPeek.height = settings?.height ?? HEIGHT;
    hoverPeek.width = settings?.width ?? WIDTH;
  });
}

function strip(dom) {
  const strippedText = dom.body.textContent || "";
  return strippedText.replace(/(\r\n|\n|\r)/gm, "");
}

function killHoverPeek() {
  const hoverPeek = document.getElementById(HOVERPEEK_ID)
  const closeButton = document.getElementById(CLOSEBUTTON_ID)
  hoverPeek.style.display = 'none'
  closeButton.style.display = 'none'
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
    killHoverPeek()
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
        body {
          padding: auto 1rem;
          margin: auto 1rem;
        }
        `
        doc.head.prepend(customStyles)
      }
      hoverPeek.srcdoc = new XMLSerializer().serializeToString(doc);
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
const hoverPeekContainer = document.createElement('div');
hoverPeekContainer.position = 'absolute';
hoverPeekContainer.top = 0;
hoverPeekContainer.left = 0;
hoverPeekContainer.width = '100%';
hoverPeekContainer.height = '100%';

const hoverPeek = document.createElement('iframe')
hoverPeek.id = HOVERPEEK_ID
hoverPeek.style.position = 'absolute'
hoverPeek.style.background = 'white'
hoverPeek.style.zIndex = 2147483646
hoverPeek.style.border = '2px solid black'
hoverPeek.style.borderRadius = '0.5rem'
hoverPeek.style.display = 'none'

const closeButton = document.createElement('button');
closeButton.id = CLOSEBUTTON_ID
closeButton.textContent = 'x';
closeButton.style.position = 'absolute';
closeButton.style.top = '0';
closeButton.style.left = '0';
closeButton.style.background = 'red';
closeButton.style.width = '2rem'
closeButton.style.height = '2rem'
closeButton.style.color = 'white';
closeButton.style.border = '2px solid white';
closeButton.style.display = 'none';
closeButton.style.zIndex = 2147483646
closeButton.addEventListener('click', () => {
  hoverPeek.style.display = 'none';
  closeButton.style.display = 'none'
});

hoverPeekContainer?.prepend(closeButton)
hoverPeekContainer?.prepend(hoverPeek)
document?.body?.prepend(hoverPeekContainer)

let visible = false
let peek = false

closeButton.addEventListener('mouseenter', debounce(() => {
  peek = true
  visible = true
}))

closeButton.addEventListener('mouseover', debounce(() => {
  peek = true
  visible = true
}))

// Dont destroy peek if user hovers back in 250ms
hoverPeek.addEventListener('mouseenter', debounce(() => {
  peek = true
  visible = true
}))

hoverPeek.addEventListener('mouseover', debounce(() => {
  peek = true
  visible = true
}))

hoverPeek.addEventListener('mouseout', debounce(() => {
  peek = false
  abortControllers.forEach(controller => controller.abort())
  abortControllers = []
  visible = false
  setTimeout(() => {
    if (!visible) {
      killHoverPeek()
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
    let previewBottom = parseInt(y, 10) + parseInt(hoverPeek.height, 10);
    if (previewBottom > height) {
      const extra = previewBottom - height
      topAnchor -= extra
    }
    const previewRight = parseInt(x, 10) + parseInt(hoverPeek.width, 10);
    if (previewRight > width) {
      const extra = previewRight - width
      leftAnchor -= extra
    }
    hoverPeek.style.top = topAnchor - 16 + 'px'
    hoverPeek.style.left = leftAnchor - 16 + 'px'
    closeButton.style.top = topAnchor - 16 + 'px'
    closeButton.style.left = leftAnchor - 16 + 'px'

    if (anchorTag?.href) {
      hoverPeek.style.display = 'block'
      closeButton.style.display = 'block'
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

