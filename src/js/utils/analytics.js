// docs/control-analytics.js

/**
 * sends a custom event to google analytics.
 * @param {string} eventName - the name of the event to track (e.g., 'button_click').
 * @param {object} eventParams - an object containing data about the event.
 */
function trackEvent(eventName, eventParams) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, eventParams);
  } else {
    console.warn('google analytics (gtag.js) is not available.');
  }
}