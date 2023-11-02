const width = window.innerWidth;
const height = window.innerHeight;

// UTILS
function killHoverflow() {
  const hoverFlow = document.getElementById('hoverflow')
  hoverFlow?.remove()
}

function isRelativeHref(href) {
  try {
    const url = new URL(href);
    return url.protocol === '' && url.hostname === '' && url.pathname !== '';
  } catch (error) {
    // Invalid URL, consider it as relative
    return true;
  }
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
  let anchorTag
  if (event.target?.parentNode?.parentNode?.tagName.toLowerCase() === 'a') {
    anchorTag = event.target.parentNode.parentNode;
  }
  if (event.target?.parentNode.tagName.toLowerCase() === 'a') {
    anchorTag = event.target.parentNode;
  }
  if (event.target.tagName.toLowerCase() === 'a') {
    anchorTag = event.target;
  }
  return anchorTag;
}

function getPageAndPreview(anchorTag) {
  if (anchorTag in cache) {
    killHoverflow()
    return cache[anchorTag]
  }
  fetch(anchorTag.href)
    .then((response) => {
      return response.text();
    })
    .then((html) => {
      var doc = parser.parseFromString(html, "text/html");
      cache[anchorTag] = doc
      hoverFlow.srcdoc = new XMLSerializer().serializeToString(doc);
    })
    .catch(() => {
      console.log('Failed to fetch');
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
hoverFlow.height = 600
hoverFlow.width = 400
hoverFlow.style.background = 'white'
hoverFlow.style.position = 'absolute'
hoverFlow.style.zIndex = 2147483647
hoverFlow.position = 'relative';
hoverFlow.sandbox = ""
hoverFlow.style.border = '2px solid black'


let visible = false

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
  }, 250);
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
      // if (isRelativeHref(anchorTag.href)) {
      //   const basePath = new URL(document.URL).hostname
      //   anchorTag.href = new URL(anchorTag.href, basePath).toString()
      // }
      hoverflowContainer.prepend(hoverFlow)
      document.body.prepend(hoverflowContainer)
    }
  }
}, 50));

// prefetch on hover
document.addEventListener('mouseover', (event) => {
  const anchorTag = getAnchorTag(event);
  console.log('Sending fetch')
  getPageAndPreview(anchorTag);
})

