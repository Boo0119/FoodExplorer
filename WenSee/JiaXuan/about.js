// FAQ accordion
document.addEventListener("DOMContentLoaded", () => {
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach(q => {
    q.addEventListener("click", () => {
      const isActive = q.classList.contains("active");

      // close all
      faqQuestions.forEach(el => {
        el.classList.remove("active");
        el.nextElementSibling.classList.remove("active");
      });

      // toggle current
      if (!isActive) {
        q.classList.add("active");
        q.nextElementSibling.classList.add("active");
      }
    });
  });

  // Animate stats numbers
  const stats = document.querySelectorAll(".stat-number");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStats();
        observer.disconnect(); // run only once
      }
    });
  }, { threshold: 0.5 });

  if (stats.length) {
    observer.observe(stats[0].parentElement.parentElement);
  }

  function animateStats() {
    stats.forEach(stat => {
      const finalValue = parseInt(stat.textContent.replace(/\D/g, ""));
      let current = 0;
      const suffix = stat.textContent.replace(/[\d,]/g, "");
      const step = Math.ceil(finalValue / 50);
      const timer = setInterval(() => {
        current += step;
        if (current >= finalValue) {
          stat.textContent = finalValue.toLocaleString() + suffix;
          clearInterval(timer);
        } else {
          stat.textContent = current.toLocaleString() + suffix;
        }
      }, 30);
    });
  }
});

// Sitemap Accordion Toggle
document.addEventListener("DOMContentLoaded", () => {
  const headers = document.querySelectorAll(".sitemap-header");

  headers.forEach(header => {
    header.addEventListener("click", () => {
      header.classList.toggle("active");
      const body = header.nextElementSibling;
      body.classList.toggle("active");
    });
  });
});