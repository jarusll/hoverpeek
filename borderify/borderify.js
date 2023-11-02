/*
Just draw a border round the document.body.
*/

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
};

console.clear()
document.body.style.border = "10px solid red";
const hoverflowContainer = document.createElement('div');
hoverflowContainer.position = 'absolute';
hoverflowContainer.top = 0;
hoverflowContainer.left = 0;
hoverflowContainer.width = '100%';
hoverflowContainer.height = '100%';
const hoverFlow = document.createElement('iframe')
hoverFlow.id = 'hoverflow'
// hoverFlow.src = 'https://www.google.com'
hoverFlow.addEventListener('mouseout', (event) => {
  setTimeout(() => {
    hoverFlow.remove()
  }, 500)
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
    console.log('hovering over : ', anchorTag.href)
    console.log('event : ', event)
    hoverFlow.src = anchorTag.href
    hoverflowContainer.prepend(hoverFlow)
    document.body.prepend(hoverflowContainer)
  }
}, 250));

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message
  console.log('recieved in content', { type, payload })
  switch (type) {
    case 'fetch':
      console.log('payload in content', payload)
      break
    default:
      () => { }
  }
})
