let currentIndex = 0;
const slides = document.querySelectorAll('.slides img');
const dots = document.querySelectorAll('.dot');
let slideTimer;

function showSlide(index) {
  if (index >= slides.length) {
    currentIndex = 0;
  } else if (index < 0) {
    currentIndex = slides.length - 1;
  } else {
    currentIndex = index;
  }

  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    dots[i].classList.remove('active');
  });

  slides[currentIndex].classList.add('active');
  dots[currentIndex].classList.add('active');
}

function changeSlide(step) {
  showSlide(currentIndex + step);
  resetTimer();
}

function currentSlide(index) {
  showSlide(index - 1);
  resetTimer();
}

function autoPlay() {
  currentIndex++;
  showSlide(currentIndex);
}

function resetTimer() {
  clearInterval(slideTimer);
  slideTimer = setInterval(autoPlay, 5000); // Change every 5 seconds
}

// Initialize the first slide  
document.addEventListener("DOMContentLoaded", () => {
  showSlide(currentIndex);
  slideTimer = setInterval(autoPlay, 5000);


  const modal = document.getElementById("modal");
  const openModal = document.getElementById("openModal");
  const closeModal = document.querySelector(".close");
  const blogForm = document.getElementById("blogForm");
  const postContainer = document.getElementById("postContainer");
  const postsSection = document.getElementById("postsSection"); // include default posts

  // ---- Local Storage Helpers ----
  function savePosts() {
    localStorage.setItem("posts", postContainer.innerHTML);
  }

  function loadPosts() {
    const saved = localStorage.getItem("posts");
    if (saved) {
      postContainer.innerHTML = saved;
    } else {
      // First-time setup: add all default posts
      const defaultPosts = `
      <div class="post">
        <div class="post-header">
          <img src="JiaXuan/images/user1.png" alt="User" class="avatar">
          <span class="username">Connie</span>
          <span class="date">Aug 20, 2025</span>
        </div>
        <img src="JiaXuan/images/nasilemak.jpg" alt="Nasi Lemak" class="post-img">
        <h3 class="post-title">The Breakfast of Champions – Nasi Lemak!</h3>
        <div class="post-caption">
          <p>Malaysia’s national dish 🇲🇾 — Nasi Lemak with sambal, fried anchovies, and boiled egg. Truly the ultimate way to kickstart the morning!</p>
        </div>
        <div class="post-actions">
          <button class="like-btn"><i class="fa-regular fa-heart"></i></button>
          <span class="like-count">27 likes</span>
          <button class="comment-btn"><i class="fa-regular fa-comment"></i></button>
          <span class="comment-count">2 comments</span>
          <button class="share-btn"><i class="fa-solid fa-share"></i></button>
          <div class="share-menu hidden">
            <a href="#" class="share-option" data-platform="facebook">Facebook</a>
            <a href="#" class="share-option" data-platform="whatsapp">WhatsApp</a>
            <a href="#" class="share-option" data-platform="copy">Copy Link</a>
          </div>
        </div>
        <div class="comments">
          <p><strong>Rahim</strong> Best way to start the day!</p>
          <p><strong>Sophia</strong> Nasi lemak + teh tarik = ❤️</p>
        </div>
        <form class="comment-form" style="display:none;">
          <input type="text" placeholder="Add a comment...">
          <button type="submit">Post</button>
        </form>
      </div>

      <div class="post">
        <div class="post-header">
          <img src="JiaXuan/images/user2.png" alt="User" class="avatar">
          <span class="username">Raj</span>
          <span class="date">Aug 18, 2025</span>
        </div>
        <img src="JiaXuan/images/satay.jpg" alt="Satay" class="post-img">
        <h3 class="post-title">🍢 Satay Nights Under the Stars ✨</h3>
        <div class="post-caption">
          <p>Juicy chicken skewers grilled to perfection, dipped in rich peanut sauce. Satay isn’t just food – it’s a Malaysian street food experience!</p>
        </div>
        <div class="post-actions">
          <button class="like-btn"><i class="fa-regular fa-heart"></i></button>
          <span class="like-count">38 likes</span>
          <button class="comment-btn"><i class="fa-regular fa-comment"></i></button>
          <span class="comment-count">1 comment</span>
          <button class="share-btn"><i class="fa-solid fa-share"></i></button>
          <div class="share-menu hidden">
            <a href="#" class="share-option" data-platform="facebook">Facebook</a>
            <a href="#" class="share-option" data-platform="whatsapp">WhatsApp</a>
            <a href="#" class="share-option" data-platform="copy">Copy Link</a>
          </div>
        </div>
        <div class="comments">
          <p><strong>Aisha</strong> Satay night is the best night 🥳</p>
        </div>
        <form class="comment-form" style="display:none;">
          <input type="text" placeholder="Add a comment...">
          <button type="submit">Post</button>
        </form>
      </div>

      <div class="post">
        <div class="post-header">
          <img src="JiaXuan/images/user3.png" alt="User" class="avatar">
          <span class="username">Mei Ling</span>
          <span class="date">Aug 15, 2025</span>
        </div>
        <img src="JiaXuan/images/tehtarik.jpg" alt="Teh Tarik" class="post-img">
        <h3 class="post-title">A Frothy Hug in a Cup – Teh Tarik</h3>
        <div class="post-caption">
          <p>Malaysia’s favourite “pulled tea” — smooth, sweet, and frothy! Every sip feels like comfort in a cup.</p>
        </div>
        <div class="post-actions">
          <button class="like-btn"><i class="fa-regular fa-heart"></i></button>
          <span class="like-count">184 likes</span>
          <button class="comment-btn"><i class="fa-regular fa-comment"></i></button>
          <span class="comment-count">1 comment</span>
          <button class="share-btn"><i class="fa-solid fa-share"></i></button>
          <div class="share-menu hidden">
            <a href="#" class="share-option" data-platform="facebook">Facebook</a>
            <a href="#" class="share-option" data-platform="whatsapp">WhatsApp</a>
            <a href="#" class="share-option" data-platform="copy">Copy Link</a>
          </div>
        </div>
        <div class="comments">
          <p><strong>Kevin</strong> I always order this with roti canai 😍</p>
        </div>
        <form class="comment-form" style="display:none;">
          <input type="text" placeholder="Add a comment...">
          <button type="submit">Post</button>
        </form>
      </div>

      <div class="post">
        <div class="post-header">
          <img src="JiaXuan/images/user4.png" alt="User" class="avatar">
          <span class="username">Kevin</span>
          <span class="date">Aug 12, 2025</span>
        </div>
        <img src="JiaXuan/images/laksa.jpg" alt="Laksa Penang" class="post-img">
        <h3 class="post-title">Sour, Spicy & Addictive – Penang Laksa Love</h3>
        <div class="post-caption">
          <p>Tangy tamarind soup, fresh herbs, and thick rice noodles. Penang Laksa is a bowl of pure Malaysian soul food.</p>
        </div>
        <div class="post-actions">
          <button class="like-btn"><i class="fa-regular fa-heart"></i></button>
          <span class="like-count">135 likes</span>
          <button class="comment-btn"><i class="fa-regular fa-comment"></i></button>
          <span class="comment-count">2 comments</span>
          <button class="share-btn"><i class="fa-solid fa-share"></i></button>
          <div class="share-menu hidden">
            <a href="#" class="share-option" data-platform="facebook">Facebook</a>
            <a href="#" class="share-option" data-platform="whatsapp">WhatsApp</a>
            <a href="#" class="share-option" data-platform="copy">Copy Link</a>
          </div>
        </div>
        <div class="comments">
          <p><strong>Mei Ling</strong> Penang has the best laksa hands down! 😋</p>
          <p><strong>Elvis</strong> I miss this so much 🤤</p>
        </div>
        <form class="comment-form" style="display:none;">
          <input type="text" placeholder="Add a comment...">
          <button type="submit">Post</button>
        </form>
      </div>

      <div class="post">
        <div class="post-header">
          <img src="JiaXuan/images/user5.png" alt="User" class="avatar">
          <span class="username">Siti</span>
          <span class="date">Aug 10, 2025</span>
        </div>
        <img src="JiaXuan/images/cendol.jpg" alt="Cendol" class="post-img">
        <h3 class="post-title">🍧 Sweet Escape – Cendol on a Hot Day</h3>
        <div class="post-caption">
          <p>Shaved ice, creamy coconut milk, pandan noodles, and gula melaka syrup. Cendol is Malaysia’s sweetest way to cool down.</p>
        </div>
        <div class="post-actions">
          <button class="like-btn"><i class="fa-regular fa-heart"></i></button>
          <span class="like-count">141 likes</span>
          <button class="comment-btn"><i class="fa-regular fa-comment"></i></button>
          <span class="comment-count">2 comments</span>
          <button class="share-btn"><i class="fa-solid fa-share"></i></button>
          <div class="share-menu hidden">
            <a href="#" class="share-option" data-platform="facebook">Facebook</a>
            <a href="#" class="share-option" data-platform="whatsapp">WhatsApp</a>
            <a href="#" class="share-option" data-platform="copy">Copy Link</a>
          </div>
        </div>
        <div class="comments">
          <p><strong>Hafiz</strong> Cendol on a hot day is heaven 😍</p>
          <p><strong>Anna</strong> I tried this in Melaka, sooo good!</p>
        </div>
        <form class="comment-form" style="display:none;">
          <input type="text" placeholder="Add a comment...">
          <button type="submit">Post</button>
        </form>
      </div>
    `;
      postContainer.innerHTML = defaultPosts;
      savePosts();
    }
  }

  // Load saved posts on startup
  loadPosts();

  // ---- Modal open / close ----
  openModal.addEventListener("click", () => (modal.style.display = "flex"));
  closeModal.addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // ---- Submit new blog post ----
  blogForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const title = document.getElementById("title").value;
    const caption = document.getElementById("caption").value;
    const imageFile = document.getElementById("image").files[0];

    if (!imageFile) return;

    // Convert image to Base64 for persistence
    const reader = new FileReader();
    reader.onload = function (event) {
      const imageUrl = event.target.result; // Base64 string

      function formatDate(date) {
        const options = { month: "short", day: "numeric", year: "numeric" };
        return date.toLocaleDateString("en-US", options);
      }

      const newPost = `
    <div class="post">
      <div class="post-header">
        <div class="auto-avatar" style="background:#009688">${username.charAt(0).toUpperCase()}</div>
        <span class="username">${username}</span>
        <span class="date">${formatDate(new Date())}</span>
      </div>
      <img src="${imageUrl}" alt="Post Image" class="post-img">
      <h3 class="post-title">${title}</h3>
      <div class="post-caption"><p>${caption}</p></div>
      <div class="post-actions">
        <button class="like-btn"><i class="fa-regular fa-heart"></i></button>
        <span class="like-count">0 likes</span>
        <button class="comment-btn"><i class="fa-regular fa-comment"></i></button>
        <span class="comment-count">0 comments</span>
        <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div class="comments"></div>
      <form class="comment-form" style="display:none;">
        <input type="text" placeholder="Write a comment..." />
        <button type="submit">Post</button>
      </form>
    </div>
  `;

      postContainer.insertAdjacentHTML("afterbegin", newPost);
      savePosts();
      blogForm.reset();
      modal.style.display = "none";
    };

    reader.readAsDataURL(imageFile); // converts to Base64
  });

  // ---- Post actions (delete, like, comment toggle) ----
  document.addEventListener("click", (e) => {
    if (e.target.closest(".delete-btn")) {
      const post = e.target.closest(".post");
      if (confirm("Delete this post?")) {
        post.remove();
        savePosts();
      }
    }

    if (e.target.closest(".like-btn")) {
      const btn = e.target.closest(".like-btn");
      const icon = btn.querySelector("i");
      const countEl = btn.nextElementSibling;
      let count = parseInt(countEl.textContent) || 0;

      if (icon.classList.contains("fa-regular")) {
        icon.classList.replace("fa-regular", "fa-solid");
        icon.style.color = "#e63946";
        countEl.textContent = `${count + 1} likes`;
      } else {
        icon.classList.replace("fa-solid", "fa-regular");
        icon.style.color = "inherit";
        countEl.textContent = `${count - 1} likes`;
      }
      savePosts();
    }

    if (e.target.closest(".comment-btn")) {
      const post = e.target.closest(".post");
      const form = post.querySelector(".comment-form");
      form.style.display = form.style.display === "none" ? "flex" : "none";
    }
  });

  // ---- Comment system ----
  document.addEventListener("submit", (e) => {
    if (e.target.classList.contains("comment-form")) {
      e.preventDefault();
      const input = e.target.querySelector("input");
      const text = input.value.trim();

      if (text) {
        const post = e.target.closest(".post");
        const commentsDiv = post.querySelector(".comments");
        const newComment = document.createElement("p");
        newComment.classList.add("comment-item");
        newComment.innerHTML = `<span><strong>You</strong> ${text}</span> <button class="delete-comment"><i class="fa-solid fa-trash"></i></button>`;
        commentsDiv.appendChild(newComment);

        const countEl = post.querySelector(".comment-count");
        let count = parseInt(countEl.textContent) || 0;
        countEl.textContent = `${count + 1} comments`;

        input.value = "";
        savePosts();
      }
    }
  });

  // ---- Delete comment ----
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-comment");
    if (btn) {
      const comment = btn.parentElement; // the <p>
      const post = btn.closest(".post");
      comment.remove();

      const countEl = post.querySelector(".comment-count");
      let count = parseInt(countEl.textContent) || 1;
      countEl.textContent = `${count - 1} comments`;

      savePosts();
    }
  });
});

// Toggle share menu
document.addEventListener("click", e => {
  const shareBtn = e.target.closest(".share-btn");
  const shareMenu = e.target.closest(".share-menu");

  // If clicked on share button
  if (shareBtn) {
    const post = shareBtn.closest(".post");
    const menu = post.querySelector(".share-menu");
    menu.classList.toggle("hidden");
    return;
  }

  // If clicked on a share option
  if (e.target.classList.contains("share-option")) {
    e.preventDefault();
    const platform = e.target.dataset.platform;
    const post = e.target.closest(".post");
    const caption = post.querySelector(".post-caption p")?.textContent || "Malaysia Street Food Post";
    const url = window.location.href;

    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    } else if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(caption + " " + url)}`, "_blank");
    } else if (platform === "copy") {
      navigator.clipboard.writeText(caption + " " + url).then(() => {
        alert("Link copied to clipboard!");
      });
    }
    return;
  }

  // If click outside share menu → close it
  document.querySelectorAll(".share-menu").forEach(menu => {
    menu.classList.add("hidden");
  });
});


// Get the button
let scrollTopBtn = document.getElementById("scrollTopBtn");

// Show button when scrolling down 200px
window.onscroll = function () {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    scrollTopBtn.style.display = "block";
  } else {
    scrollTopBtn.style.display = "none";
  }
};

// Click event → smooth scroll to top
scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

