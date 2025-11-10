// src/scripts/utils/transition.js
export const applyPageTransition = () => {
  // ✅ Jika browser mendukung View Transition API
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      const content = document.querySelector(".main-content");
      if (content) {
        content.animate(
          [
            { opacity: 0, transform: "translateY(10px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 400,
            easing: "ease",
          }
        );
      }
    });
  } else {
    // 🔁 Fallback untuk browser lama (tanpa View Transition API)
    const content = document.querySelector(".main-content");
    if (!content) return;

    content.style.opacity = 0;
    content.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    content.style.transform = "translateY(10px)";

    setTimeout(() => {
      content.style.opacity = 1;
      content.style.transform = "translateY(0)";
    }, 50);
  }
};
