(function () {
  function extractGreenhouseJobData() {
    return {
      source: 'greenhouse',
      title: document.querySelector('[data-metadata-id="job-title"]')?.innerText?.trim() || '',
      body: document.body ? document.body.innerText || '' : '',
      url: window.location.href || ''
    };
  }

  window.CareerOSExtractors = window.CareerOSExtractors || {};
  window.CareerOSExtractors.greenhouse = extractGreenhouseJobData;
})();
