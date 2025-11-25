/////////// Toggle button

let menu = document.querySelector('.nav_menu');
let menuBtn = document.querySelector('#open-menu-btn')
let closeBtn = document.querySelector('#close-menu-btn')

menuBtn.addEventListener('click', () => {
    menu.style.display = "flex";
    closeBtn.style.display = "inline-block";
    menuBtn.style.display = "none";

})
closeBtn.addEventListener('click', () => {
    menu.style.display = "none";
    menuBtn.style.display = "inline-block";
    closeBtn.style.display = "none";

})


    // ==== Intersection Observer pour effet "lazy fade-in" ====

    // Sélectionne tous les éléments que tu veux observer
    const lazyElements = document.querySelectorAll(
      ".text-image, #footer, .auth-container"
    );

    // Ajoute la classe de base
    lazyElements.forEach(el => el.classList.add("lazy-element"));

    // Crée un nouvel observateur
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("lazy-visible");
          observer.unobserve(entry.target); // Stoppe l’observation une fois visible
        }
      });
    }, {
      threshold: 0.1, // Déclenche quand 10% de l’élément est visible
    });

    // Observe chaque élément
    lazyElements.forEach(el => observer.observe(el));
  
