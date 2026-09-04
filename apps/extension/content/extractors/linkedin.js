(function () {
  function extractLinkedInJobData() {
    return {
      source: 'linkedin',
      title: document.querySelector('h1')?.innerText?.trim() || '',
      body: document.body ? document.body.innerText || '' : '',
      url: window.location.href || ''
    };
  }

  window.CareerOSExtractors = window.CareerOSExtractors || {};
  window.CareerOSExtractors.linkedin = extractLinkedInJobData;
})();
