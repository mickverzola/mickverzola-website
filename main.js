'use strict';

/** Site entry point — add interactive behavior here as the site grows. */
function init() {
  // Reserved for future features (nav, lightbox, analytics, etc.).
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
