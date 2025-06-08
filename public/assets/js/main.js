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
  const sections = document.querySelectorAll("section");
  const header = document.querySelector("header");

  menuIcon.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  document.body.onscroll = () => {
    navLinks.classList.remove("open");
  };

  for (let i = 0; i < sections.length; i++) {
    sections[i].onclick = () => {
      navLinks.classList.remove("open");
    };
  }

  header.onclick = () => {
    navLinks.classList.remove("open");
  };

  navItems.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  renderServices();
  renderTrainers();
  renderTestimonials();
  renderSubscriptions();
  renderBlogPosts();
});

// عرض الخدمات
function renderServices() {
  const container = document.querySelector(".service-cards");
  if (!container) return;
  const services = JSON.parse(localStorage.getItem("spider_services_data") || "[]");

  container.innerHTML = "";
  if (services.length === 0) {
    container.innerHTML = `<p>لا توجد خدمات حالياً.</p>`;
    return;
  }
  services.forEach(([title, desc]) => {
    container.innerHTML += `
      <div class="card">
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>`;
  });
}

// عرض المدربين
function renderTrainers() {
  const container = document.querySelector(".trainers-grid");
  if (!container) return;
  const trainers = JSON.parse(localStorage.getItem("spider_trainers_data") || "[]");

  container.innerHTML = "";
  if (trainers.length === 0) {
    container.innerHTML = `<p>لا يوجد مدربين حالياً.</p>`;
    return;
  }
  trainers.forEach(([name, desc]) => {
    container.innerHTML += `
      <div class="trainer">
        <img src="https://randomuser.me/api/portraits/lego/${Math.floor(Math.random() * 10)}.jpg" alt="${name}" />
        <h4>${name}</h4>
        <p>${desc}</p>
      </div>`;
  });
}

// عرض شهادات العملاء (Testimonials) مع Carousel
function renderTestimonials() {
  const container = document.querySelector(".carousel");
  if (!container) return;
  
  const testimonials = JSON.parse(localStorage.getItem("spider_testimonials_data") || "[]");

  if (testimonials.length === 0) {
    container.innerHTML = `<p>لا توجد شهادات حالياً.</p>`;
    return;
  }

  container.innerHTML =
    testimonials
      .map(
        ([author, text]) => `
      <div class="slide">
        <p>"${text}"</p>
        <h5>- ${author}</h5>
      </div>`
      )
      .join("") +
    `
    <button class="prev">&#10094;</button>
    <button class="next">&#10095;</button>`;

  const slides = container.querySelectorAll(".slide");
  if (slides.length > 0) slides[0].classList.add("active");

  initCarousel();
}


// عرض باقات الاشتراك
function renderSubscriptions() {
  const container = document.querySelector(".subscription-cards");
  if (!container) return;
  const plans = JSON.parse(localStorage.getItem("spider_subscriptions_data") || "[]");

  container.innerHTML = "";
  if (plans.length === 0) {
    container.innerHTML = `<p>لا توجد باقات حالياً.</p>`;
    return;
  }

  plans.forEach(([title, price, feature1, feature2, feature3]) => {
    container.innerHTML += `
      <div class="subscription-card">
        <h3>${title}</h3>
        <div class="price">${price} جنية</div>
        <ul class="features">
          <li>${feature1}</li>
          <li>${feature2}</li>
          <li>${feature3}</li>
        </ul>
      </div>`;
  });
}

// عرض أخبار المدونة
function renderBlogPosts() {
  const container = document.querySelector(".blog-posts");
  if (!container) return;
  const posts = JSON.parse(localStorage.getItem("spider_lastnews_data") || "[]");

  if (posts.length === 0) {
    container.innerHTML = `<p>لا توجد أخبار حالياً.</p>`;
    return;
  }

  container.innerHTML = posts
    .map(
      ([title, snippet, link]) => `
    <article class="post">
      <h3>${title}</h3>
      <p>${snippet}</p>
      <a href="${link}" target="_blank" rel="noopener">اقرأ المزيد</a>
    </article>`
    )
    .join("");
}

// تهيئة Carousel لشهادات العملاء
function initCarousel() {
  let currentSlide = 0;
  const slides = document.querySelectorAll(".slide");
  const next = document.querySelector(".next");
  const prev = document.querySelector(".prev");

  if (!next || !prev || slides.length === 0) return;

  function showSlide(index) {
    slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
  }

  next.addEventListener("click", () => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  });

  prev.addEventListener("click", () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  });

  showSlide(currentSlide);
}
