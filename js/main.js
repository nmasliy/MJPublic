window.addEventListener("DOMContentLoaded", function () {
  const modals = new SimpleModal();
  modals?.init();
  
  initMenu();
  initPageTabs(".hero__tab");
  initTabs(".earn__tabs-1 .earn__tab", ".earn__tabs-1 .earn__content-item");
  initTabs(".earn__tabs-2 .earn__tab", ".earn__tabs-2 .earn__content-item");
  initTabs(".auth__tab", ".auth__content-item", true);
  initRangeSlider();

  moveElementOnBreakpoint(
    '.hero__info--1 .hero__text',
    { fromSelector: '.hero__info--1 .hero__title', fromPosition: 'afterend' },
    { toSelector: '.hero__img--1', toPosition: 'afterend' },
    991
  );
  moveElementOnBreakpoint(
    '.hero__info--2 .hero__text',
    { fromSelector: '.hero__info--2 .hero__title', fromPosition: 'afterend' },
    { toSelector: '.hero__img--2', toPosition: 'afterend' },
    991
  );
  moveElementOnBreakpoint(
    '.hero__btn',
    { fromSelector: '.hero__tabs', fromPosition: 'afterend' },
    { toSelector: '.hero__inner', toPosition: 'beforeend' },
    991
  );
  moveElementOnBreakpoint(
    '.registration__img',
    { fromSelector: '.registration__inner', fromPosition: 'afterbegin' },
    { toSelector: '.registration__title', toPosition: 'afterend' },
    768
  );

  function initMenu() {
    const header =  document.querySelector(".header");
    const burger = document.querySelector(".burger");
    const breakpoint =  991;

    if (!header) return;

    document.body.addEventListener('click', e => {
      if (window.innerWidth > breakpoint) return;

      if (e.target.closest('.burger')) {
        header.classList.toggle('is-active');
        burger.classList.toggle('is-active');
      } else {
        header.classList.remove('is-active');
        burger.classList.remove('is-active');
      }
    })
  }

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
        min: -5, 
        max: 1000,
      },
      padding: [105, 0],
      step: 1,
    });

    slider.noUiSlider.on("update", function (values, handle) {
      sliderValue.textContent = values[handle];
      rewardValue.textContent = (values[handle] / 2).toFixed(2);
    });
  }
});
