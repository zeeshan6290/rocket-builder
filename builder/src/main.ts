import './style.css'
import { onDragStart, onDragEnd, onDragOver, onDrop, onClear, onSave, onRestore, setupGlobalEvents} from './dnd.ts'

//fetch('http://127.0.0.1:5000/kits/bs5/div.html') 
//.then(response => response.text())               // response.text() has the component that needs to be saved in  
//.then(text => console.log(text))                 // builder-components
//.catch(error => console.error(error));

// Using Promise syntax:
function downloadComponents() {
    let loading = document.querySelector('#overlay') as HTMLElement;
    //return fetch('http://localhost:5000/kits/bs5/')
    let localStorageData = window.localStorage.getItem('components');
    if (localStorageData) {
      let localStorageParsedData = JSON.parse(<string>window.localStorage.getItem('components'));
      return new Promise((resolve) => {
        // Simulating an asynchronous operation
        resolve(drawComponents(localStorageParsedData));
      });
    } else {
      loading.style.display = 'flex';
      return fetch('https://components-server.onrender.com/kits/bs5/')
        .then(response => response.text())
        .then( response_raw => {
          loading.style.display = 'none';
          let response_json = JSON.parse( response_raw );
          window.localStorage.setItem('components', JSON.stringify(response_json))
          drawComponents(response_json);
        })
        .catch(error => console.error(error));
    }
}

function drawComponents(response_json:any) {
  let components = response_json['content']['components'];
  let component = '';
  for (let item in components) {
    let subComponents = components[item];
    let gridStr = '';
    for (let subItem in subComponents) {
      let component_grid_base64 = subComponents[subItem];
      gridStr += atob( component_grid_base64 );

    }
    var gridSize = Object.keys(subComponents).length;
    component += `
      <div class="accordion-item">
      <h2 class="accordion-header" id="headingTwo2-${item}">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
          data-bs-target="#collapseTwo2-${item}" aria-expanded="false" aria-controls="collapseTwo2-${item}">
          ${item}
          <span class="forNumbers">${gridSize}</span>
        </button>
      </h2>
      <div id="collapseTwo2-${item}" class="accordion-collapse collapse" aria-labelledby="headingTwo2-${item}"
        data-bs-parent="#accordionComponents">
        <div class="accordion-body">
          ${gridStr}
        </div>
      </div>
    </div>`;
  }
  let componentsContainer = document.getElementsByClassName('components_contain')[0];
  var div = document.createElement('div');
  div.innerHTML = component.trim();
  componentsContainer.appendChild(<Node>div);
}


let builderContainer = document.querySelector('#layout')!.innerHTML;
document.querySelector<HTMLDivElement>('#app')!.innerHTML = builderContainer;

// SETUP Navigation
document.querySelector('#action_clear')!.addEventListener('click', (event) => { onClear(event) });
document.querySelector('#action_save')!.addEventListener('click', (event) => { onSave(event) });
document.querySelector('#action_restore')!.addEventListener('click', (event) => { onRestore(event) });
document.querySelector('#action_undo')!.addEventListener('click', (event) => { onRestore(event) });

// SETUP Preview
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#action_preview')!.addEventListener('click', openPreviewModal);
    document.querySelector('#closeModal')!.addEventListener('click', closePreviewModal);
    document.querySelector('#fullScreenOption')!.addEventListener('click', () => setPreviewMode('fullScreen'));
    document.querySelector('#tabletOption')!.addEventListener('click', () => setPreviewMode('tablet'));
    document.querySelector('#mobileOption')!.addEventListener('click', () => setPreviewMode('mobile'));
});

// PULL Components 
downloadComponents().then(misc)

// SETUP Components
function misc() {

    let draggableElems = document.querySelectorAll('.draggable');

    for (let i = 0; i < draggableElems.length; i++) {
        draggableElems[i].addEventListener('dragstart', (event) => { onDragStart(event) });
        draggableElems[i].addEventListener('dragend', (event) => { onDragEnd(event) });
    }   
}

function openPreviewModal() {
    let previewModal = document.querySelector('#previewModal') as HTMLElement;
    let previewFrame = document.querySelector('#previewFrame') as HTMLIFrameElement;
    let dropzone = document.querySelector('#dropzone');
  
    // Load the content of the dropzone into the iframe
    let iframeContent = `
      <html>
        <head>
          <style>
            ${Array.from(document.styleSheets)
              .map(sheet => {
                try {
                  return Array.from(sheet.cssRules)
                    .map(rule => rule.cssText)
                    .join('\n');
                } catch (e) {
                  console.warn('Cannot load styles from stylesheet', e);
                  return '';
                }
              })
              .join('\n')}
          </style>
        </head>
        <body style="padding: 15px;">
          ${dropzone?.innerHTML}
        </body>
        <script>
          // Disable contentEditable for all elements
          const allElements = document.getElementsByTagName('*');
          for (let i=0; i<allElements.length; i++) {
            allElements[i].contentEditable = "false";
          }

          // Ensure all links open in a new tab
          const allLinks = document.getElementsByTagName('a');
          for (let i=0; i<allLinks.length; i++) {
            allLinks[i].target = "_blank";
          }
        </script>
      </html>
    `;
    previewFrame.srcdoc = iframeContent;
  
    // Show the modal
    previewModal.style.display = "block";
}
  
  function closePreviewModal() {
    let previewModal = document.querySelector('#previewModal') as HTMLElement;
  
    // Hide the modal
    previewModal.style.display = "none";
  }
  
  function setPreviewMode(mode: 'fullScreen' | 'tablet' | 'mobile') {
    let previewFrame = document.querySelector('#previewFrame') as HTMLElement;
  
    // Set the width of the iframe based on the selected mode
    switch (mode) {
      case 'fullScreen':
        previewFrame.style.width = "100%";
        break;
      case 'tablet':
        previewFrame.style.width = "768px";
        break;
      case 'mobile':
        previewFrame.style.width = "375px";
        break;
    }
  }

// SETUP Master DROP Zone
document.querySelector('#dropzone')!.addEventListener('dragover', (event) => { onDragOver(event) });
document.querySelector('#dropzone')!.addEventListener('drop', (event) => { onDrop(event) });

// SETUP GRID Drop Zones
let dropZones = document.getElementsByClassName('dropzone-elem');
for (let i = 0; i < dropZones.length; i++) {
    dropZones[i].addEventListener('dragover', (event) => { onDragOver(event) });
    dropZones[i].addEventListener('dragend', (event) => { onDragEnd(event) });
    dropZones[i].addEventListener('drop', (event) => { onDrop(event) });
}

onRestore(null);

setupGlobalEvents();
