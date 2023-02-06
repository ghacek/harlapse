'use strict';

// A DevTools extension adds functionality to the Chrome DevTools.
// For more information on DevTools,
// See https://developer.chrome.com/extensions/devtools

// Create a panel named `My Panel`
chrome.devtools.panels.create('HarBin', '', 'panel.html', (panel) => {
  console.log('Panel was successfully created!');
});
