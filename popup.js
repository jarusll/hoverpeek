document.getElementById('save').addEventListener('click', (event) => {
  event.preventDefault();
  var height = document.getElementById('height').value;
  var width = document.getElementById('width').value;
  var blockJs = document.getElementById('blockJS').checked;
  console.log('saving', height, width, blockJs);
  browser.runtime.sendMessage({
    type: "save-settings",
    payload: {
      height, width, blockJs
    }
  }, response => {
    console.log(response.status)
  })
});

