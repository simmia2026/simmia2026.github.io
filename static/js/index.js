// index.js

window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];

function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + "/" + String(i).padStart(6, "0") + ".jpg";
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  if (!image) return;

  image.ondragstart = function () { return false; };
  image.oncontextmenu = function () { return false; };

  $("#interpolation-image-wrapper").empty().append(image);
}

/**
 * Results carousel:
 * - left/right slide switching
 * - viewport height fixed to the WikiMIA-25 slide height (".results-height-ref")
 * - each slide contains a vertical scroll area (".results-scroll") to see tall images
 */
function initResultsCarouselFixedRefHeightWithScroll() {
  const container = document.querySelector(".carousel-container.results-carousel");
  const track = document.querySelector(".carousel-track-results");
  const nextBtn = document.querySelector(".next-results");
  const prevBtn = document.querySelector(".prev-results");

  if (!container || !track || !nextBtn || !prevBtn) return;

  const slides = Array.from(track.querySelectorAll(".carousel-slide"));
  if (slides.length === 0) return;

  const imgs = Array.from(track.querySelectorAll("img.result-image"));

  let index = 0;

  function updatePosition() {
    const w = container.getBoundingClientRect().width;
    if (!w || w <= 0) return;
    track.style.transform = `translateX(-${index * w}px)`;
  }

  function resetActiveScroll() {
    const active = slides[index];
    if (!active) return;
    const scroller = active.querySelector(".results-scroll");
    if (scroller) scroller.scrollTop = 0;
  }

  function setViewportHeightFromRef() {
    const refSlide =
      track.querySelector(".carousel-slide.results-height-ref") || slides[slides.length - 1];

    // Measure the slide content (caption + image)
    const refFigure = refSlide ? refSlide.querySelector("figure") : null;
    const rect = refFigure ? refFigure.getBoundingClientRect() : refSlide.getBoundingClientRect();
    const h = Math.max(1, Math.ceil(rect.height));

    container.style.height = `${h}px`;
    slides.forEach((s) => (s.style.height = `${h}px`));

    updatePosition();
  }

  function waitForImagesThenLayout() {
    const promises = imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    });

    Promise.all(promises).then(() => {
      requestAnimationFrame(() => {
        setViewportHeightFromRef();
        resetActiveScroll();
      });
    });
  }

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    updatePosition();
    resetActiveScroll();
  });

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    updatePosition();
    resetActiveScroll();
  });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setViewportHeightFromRef();
      resetActiveScroll();
    }, 120);
  });

  waitForImagesThenLayout();
}

document.addEventListener("DOMContentLoaded", () => {
  initResultsCarouselFixedRefHeightWithScroll();
});

$(document).ready(function () {
  // Navbar burger
  $(".navbar-burger").click(function () {
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
  });

  // Bulma carousel init (only affects elements with class ".carousel")
  var options = {
    slidesToScroll: 1,
    slidesToShow: 3,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
  };

  if (typeof bulmaCarousel !== "undefined") {
    bulmaCarousel.attach(".carousel", options);
  }

  // Interpolation slider logic
  preloadInterpolationImages();

  if ($("#interpolation-slider").length && $("#interpolation-image-wrapper").length) {
    $("#interpolation-slider").on("input", function () {
      setInterpolationImage(this.value);
    });

    setInterpolationImage(0);
    $("#interpolation-slider").prop("max", NUM_INTERP_FRAMES - 1);
  }

  if (typeof bulmaSlider !== "undefined") {
    bulmaSlider.attach();
  }
});
