const urlElement = document.getElementById('url');
const loadingElement = document.getElementById('loading');
const invalidElement = document.getElementById('invalid');
const domaininfoElement = document.getElementById('domaininfo');
const exportElement = document.getElementById('export');
let exportData = [];

exportElement.addEventListener('click', function (event) {
  if (exportData.length) {
    navigator.clipboard.writeText(exportData.join('\r\n'));
  }
});

// Get active tab in current window
if (chrome) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => process(tabs));
} else {
  browser.tabs.query({
    active: true,
    currentWindow: true
  }).then((process), (error) => {
    console.log(`Error: ${error}`);
  });
}

function process(tabs) {
  // Extract domain from url
  const urlParts = new URL(tabs[0].url).hostname.split('.');
  const url = urlParts.slice(urlParts.length - 2).join('.');
  urlElement.innerText = url;

  // Check if domain ends with .ge
  if (url.endsWith('.ge')) {
    fetch(`https://nic.ge/en/search?domain=${url}`)
      .then(response => response.text())
      .then(responseText => {
        const parser = new DOMParser();
        const htmlDocument = parser.parseFromString(responseText, 'text/html');
        const notRegisteredElement = htmlDocument.documentElement.querySelector('.domain-status--free');

        // Check if domain is not registered
        if (notRegisteredElement) {
          loadingElement.style.display = 'none';
          invalidElement.style.display = 'block';
          invalidElement.innerText = 'domain is not registered';
        }
        else {
          const infoElement = htmlDocument.documentElement.querySelector('.registereddomain-info p');
          const info = infoElement.textContent.split('TERMS OF USE')[0].trim().split('   ');

          info.forEach(record => {
            const parts = record.split(': ');
            const recordName = parts[0];
            const recordValue = parts[1];

            const recordNode = document.createElement('div');
            const recordNameNode = document.createElement('span');
            const recordValueNode = document.createElement('span');
            const ColonNode = document.createElement('span');

            recordNameNode.innerText = recordName;
            recordValueNode.innerText = recordValue;
            ColonNode.innerText = ': ';
            ColonNode.style.opacity = 0;

            recordNode.appendChild(recordNameNode);
            recordNode.appendChild(ColonNode);
            recordNode.appendChild(recordValueNode);
            document.getElementById('domaininfo').appendChild(recordNode);

            exportData.push(`${recordName}: ${recordValue}`);
          });

          urlElement.style.marginTop = '10px';
          loadingElement.style.display = 'none';
          domaininfoElement.style.display = 'block';
          exportElement.style.display = 'block';
        }
      });
  } else {
    loadingElement.style.display = 'none';
    invalidElement.style.display = 'block';
    invalidElement.innerText = 'is not a GE domain';
  }
}
