document.getElementById('save').addEventListener('click', (event) => {
  event.preventDefault();
  var height = document.getElementById('height').value;
  var width = document.getElementById('width').value;
  console.log('saving', height, width);
  browser.runtime.sendMessage({
    type: "save-settings",
    payload: {
      height, width,
    }
  }, response => {
    console.log(response.status)
  })
});

