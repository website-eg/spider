document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".testimonials .slide");
  const prevBtn = document.querySelector(".testimonials button.prev");
  const nextBtn = document.querySelector(".testimonials button.next");
  let current = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
  }

  function nextSlide() {
    current = (current + 1) % slides.length;
    showSlide(current);
  }

  function prevSlide() {
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
  }

  showSlide(current);

  let autoSlide = setInterval(nextSlide, 5000);

  nextBtn.addEventListener("click", () => {
    nextSlide();
    resetInterval();
  });

  prevBtn.addEventListener("click", () => {
    prevSlide();
    resetInterval();
  });

  function resetInterval() {
    clearInterval(autoSlide);
    autoSlide = setInterval(nextSlide, 5000);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const menuIcon = document.getElementById("menu-icon");
  const navLinks = document.querySelector(".nav-links");
  const navItems = document.querySelectorAll(".nav-links a");

  menuIcon.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navItems.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
});

