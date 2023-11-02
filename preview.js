const width = window.innerWidth;
const height = window.innerHeight;

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
  }, 250)
})

hoverFlow.height = 600
hoverFlow.width = 400
hoverFlow.style.background = 'white'
hoverFlow.style.position = 'absolute'
hoverFlow.style.zIndex = 2147483647
hoverFlow.position = 'relative';
hoverFlow.sandbox = ""
hoverFlow.style.resize = "both"
hoverFlow.overflow = 'hidden';
hoverFlow.paddingTop = '56.25%'; /* 16:9 Aspect Ratio */

document.addEventListener('mouseover', debounce((event) => {
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
          hoverFlow.srcdoc = new XMLSerializer().serializeToString(doc)
        })
        .catch(() => {
          console.log('Failed to fetch')
        });
    }
  }
}, 1000));
