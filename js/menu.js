
const menuButton = document.querySelector(".menu-toggle");
const navList = document.querySelector(".nav-list");

function toggleMenu() {
    navList.classList.toggle("open");
}

menuButton.addEventListener("click", toggleMenu);