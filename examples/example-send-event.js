const co = require('co');
const phantomjs = require('../index');

// Tests whether SendEvent function works.
//
// If working, the following output should be:
//
// 1. Positions of Button { height: 27, left: 10, right: ~98, top: 10, width: ~88 }
// 2. Clicked on body
// 3. Clicked on button
// 4. Clicked on button
//
// 2 and 3 happens because of the `click()` function,
// where as 4 happens due to sendEvent
let generatorFn = function* () {
  let phantom = yield phantomjs.create();
  let html = '<html>' +
    '<head><title>Test</title></head>' +
    '<body style="width: 500px; height: 500px;"><button id="myButton">MyButton</button></body>' +
    '</html>';

  // Creating a page is as simple as this,
  // and can be done several times for all the pages you need.
  // Make sure to run page.close() or phantom.exit()
  // when you are done.
  let page = yield phantom.createPage();

  // Add listeners for console and error.
  // Console messages are sent when clicks happens,
  // errors if anything goes wrong
  page.onConsoleMessage(function(message) {
    console.log(message);
  });

  page.onError(function(message) {
    console.log(message);
  });

  yield page.openHtml(html); // then open google

  let positions = yield page.evaluate(function() {
    document.body.addEventListener('click', function() {
      console.log('Clicked on body');
    });

    // Retrieve the button we created
    var button = document.getElementById('myButton');

    // Add an event listener to it.
    button.addEventListener('click', function(e) {

      if (e.stopPropagation) {
        e.stopPropagation();
      }

      if (e.preventDefault) {
        e.preventDefault();
      }

      console.log('Clicked on button');
    });

    return button.getBoundingClientRect();
  });

  // Check the button positions
  console.log('Positions of myButton', positions);

  // Calculate the positions, clicking in the
  // middle of the button
  let x = positions.left + positions.width / 2;
  let y = positions.top + positions.height / 2;

  // Perform clicks with `click` function just to
  // make sure they work.
  yield page.evaluate(function() {
    document.body.click();
    document.getElementById('myButton').click();
  });

  // Send the event, it should work
  yield page.sendEvent('click', x, y, 'left');
  yield page.close();
  yield phantom.exit();
};

// Run the generatorFunction - returns a promise
co(generatorFn)
  .then(() => console.log('Done'))
  .catch(err => console.error(err || err.stack));
