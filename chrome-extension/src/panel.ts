'use strict';

// For more information on Panels API,
// See https://developer.chrome.com/extensions/devtools_panels

// We will create a panel to detect
// whether current page is using React or not.

import './panel.css';

document.getElementById("share-har")?.addEventListener('click', () => {
    (<any>window).har_share();
});
