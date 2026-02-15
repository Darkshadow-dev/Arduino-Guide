//------------------------------------
// MOBILE JS FOR TOUCH SUPPORT
//------------------------------------

// Add tap support for mobile elements
function enableTouchClick(selector){
  document.querySelectorAll(selector).forEach(item=>{
    item.addEventListener('touchstart', e=>{
      e.stopPropagation();
      item.click();
    });
  });
}

// Dropdowns
enableTouchClick('.dropdown-btn');
enableTouchClick('.side-btn');

// Examples menu items
enableTouchClick('.example-item');
