const baseUrl =
  "https://3151de04-72ef-4cfe-a32e-1b7d24b3f829-00-x6mg4vwn74xx.picard.replit.dev";

document.addEventListener("DOMContentLoaded", () => {
  renderServices();
  renderTrainers();
  renderTestimonials();
  renderSubscriptions();
  renderBlogPosts();
});

// عرض الخدمات
async function renderServices() {
  const container = document.querySelector(".service-cards");
  if (!container) return;

  try {
    const res = await fetch(`${baseUrl}/api/services`);
    const services = await res.json();

    container.innerHTML = services.length
      ? services
          .map(
            ({ title, description }) => `
        <div class="card">
          <h3>${title}</h3>
          <p>${description}</p>
        </div>`
          )
          .join("")
      : `<p>لا توجد خدمات حالياً.</p>`;
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p>فشل تحميل الخدمات.</p>`;
  }
}

// عرض المدربين
async function renderTrainers() {
  const container = document.querySelector(".trainers-grid");
  if (!container) return;

  try {
    const res = await fetch(`${baseUrl}/api/trainers`);
    const trainers = await res.json();

    container.innerHTML = trainers.length
      ? trainers
          .map(
            ({ name, specialization, imageUrl }) => `
        <div class="trainer">
          <img src="${imageUrl}" alt="${name}" />
          <h4>${name}</h4>
          <p>${specialization}</p>
        </div>`
          )
          .join("")
      : `<p>لا يوجد مدربين حالياً.</p>`;
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p>فشل تحميل بيانات المدربين.</p>`;
  }
}

// عرض شهادات العملاء
async function renderTestimonials() {
  const container = document.querySelector(".carousel");
  if (!container) return;

  try {
    const res = await fetch(`${baseUrl}/api/testimonials`);
    const testimonials = await res.json();

    if (testimonials.length === 0) {
      container.innerHTML = `<p>لا توجد شهادات حالياً.</p>`;
      return;
    }

    container.innerHTML =
      testimonials
        .map(
          ({ name, opinion }) => `
      <div class="slide">
        <p>"${opinion}"</p>
        <h5>- ${name}</h5>
      </div>`
        )
        .join("") +
      `
      <button class="prev">&#10094;</button>
      <button class="next">&#10095;</button>`;

    initCarousel();
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p>فشل تحميل الشهادات.</p>`;
  }
}

// عرض باقات الاشتراك
async function renderSubscriptions() {
  const container = document.querySelector(".subscription-cards");
  if (!container) return;

  try {
    const res = await fetch(`${baseUrl}/api/subscriptions`);
    const plans = await res.json();

    container.innerHTML = plans.length
      ? plans
          .map(
            ({ planName, price, desc1, desc2, desc3 }) => `
        <div class="subscription-card">
          <h3>${planName}</h3>
          <div class="price">${price} جنية</div>
          <ul class="features">
            <li>${desc1}</li>
            <li>${desc2}</li>
            <li>${desc3}</li>
          </ul>
        </div>`
          )
          .join("")
      : `<p>لا توجد باقات حالياً.</p>`;
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p>فشل تحميل الباقات.</p>`;
  }
}

// عرض الأخبار
async function renderBlogPosts() {
  const container = document.querySelector(".blog-posts");
  if (!container) return;

  try {
    const res = await fetch(`${baseUrl}/api/lastnews`);
    const posts = await res.json();

    container.innerHTML = posts.length
      ? posts
          .map(
            ({ title,  description, link}) => `
        <article class="post">
          <h3>${title}</h3>
          <p>${description}</p>
          <a href="${link}">أقراء المزيد</a>
        </article>`
          )
          .join("")
      : `<p>لا توجد أخبار حالياً.</p>`;
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p>فشل تحميل الأخبار.</p>`;
  }
}

// Carousel للشهادات
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

function toggleMenu() {
  document.getElementById("nav-links").classList.toggle("show");
}

document.querySelectorAll('#nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById("nav-links").classList.remove("show");
  });
});

const sections = document.querySelectorAll("section");
const header = document.querySelector("header");

header.onclick = () => {
  navLinks.classList.remove("show");
};

sections.forEach((section) => {
  section.onclick = () => {
    navLinks.classList.remove("show");
  };
});
