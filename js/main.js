window.addEventListener("DOMContentLoaded", function () {
  const menu = new Menu({
    menu: document.querySelector(".header__menu"),
    burger: document.querySelector(".burger"),
    overlay: document.querySelector(".header__overlay"),
    burgerCaption: "Открыть меню",
    burgerActiveCaption: "Закрыть меню",
    transitionDelay: 300,
    breakpoint: 991,
  });

  const modals = new SimpleModal();
  modals?.init();
  
  initPageTabs(".hero__tab");
  initTabs(".earn__tabs-1 .earn__tab", ".earn__tabs-1 .earn__content-item");
  initTabs(".earn__tabs-2 .earn__tab", ".earn__tabs-2 .earn__content-item");
  initTabs(".auth__tab", ".auth__content-item", true);
  initRangeSlider();

  function initRangeSlider() {
    const slider = document.querySelector("#partner-program-slider");

    if (!slider) return;

    const sliderValue = document.querySelector(
      ".partner-program__slider-value span"
    );
    const rewardValue = document.querySelector(
      ".partner-program__reward-value span"
    );

    noUiSlider.create(slider, {
      start: 500,
      connect: [true, false],
      range: {
        min: -5, // padding + needed min value (105 + -5 = 100)
        max: 1000,
      },
      padding: [105, 0],
      step: 1,
    });

    slider.noUiSlider.on("update", function (values, handle) {
      sliderValue.textContent = values[handle];
      rewardValue.textContent = +values[handle] / 2;
    });
  }
});
