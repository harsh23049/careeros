(function () {
  function extractGenericJobData() {
    return {
      source: 'generic',
      title: document.title || '',
      body: document.body ? document.body.innerText || '' : '',
      url: window.location.href || ''
    };
  }

  window.CareerOSExtractors = window.CareerOSExtractors || {};
  window.CareerOSExtractors.generic = extractGenericJobData;
})();
