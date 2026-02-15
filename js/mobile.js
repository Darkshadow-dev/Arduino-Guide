//------------------------------------
// MOBILE JS (touch support for dropdowns)
//------------------------------------

// --- Make PC dropdown functions work with touch ---
document.querySelectorAll(".dropdown-btn").forEach(btn => {
  btn.addEventListener("touchstart", e => {
    e.preventDefault();  // prevent ghost click
    toggleDropdown(btn, e);
  });
});

document.querySelectorAll(".side-btn").forEach(btn => {
  btn.addEventListener("touchstart", e => {
    e.preventDefault();
    toggleSideMenu(btn, e);
  });
});

// Optional: make example items tap-friendly
document.querySelectorAll(".example-item").forEach(item => {
  item.addEventListener("touchstart", e => {
    e.preventDefault();
    item.click();
  });
});