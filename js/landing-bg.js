document.addEventListener("DOMContentLoaded", function () {
  const landing = document.querySelector(".landing-bg");

  // You can change this URL to any other background image
  const imageUrl = "https://www.pixelstalk.net/wp-content/uploads/image12/A-serene-aesthetic-green-desktop-wallpaper-with-a-subtle-gradient-effect-creating-a-calm-and-sophisticated-ambiance.jpg"
  if (landing) {
    landing.style.backgroundImage = `url(${imageUrl})`;
  }
});
