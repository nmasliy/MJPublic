class Menu {
  constructor(options) {
    this.root = document.querySelector(':root');
    this.html = document.querySelector('html');
    this.isInit = false;
    this.isAnimating = false;

    const defaultOptions = {
      menu: document.querySelector('[data-menu]'),
      burger: document.querySelector('[data-burger]'),
      close: document.querySelector('[data-menu-close]'),
      overlay: document.querySelector('[data-menu-overlay]'),
      navLinks: document.querySelectorAll('[data-menu-item]'),
      burgerCaption: 'Открыть меню',
      burgerActiveCaption: 'Закрыть меню',
      transitionDelay: 400,
      transitionEasing: 'ease-in-out',
      breakpoint: 1024,
      display: 'block',
      disableScroll: true,
      onOpen: () => {},
      onClose: () => {},
    };
    this.options = { ...defaultOptions, ...options };

    this.closeHandler = this.close.bind(this, options);
    this.toggleHandler = this.toggle.bind(this, options);

    this._init();
  }

  async open() {
    if (this.isAnimating) return;

    this.options.onOpen();
    this.options.menu.style.transition = this.options.transitionDelay /  1000 + 's' + this.options.transitionEasing;
    this.options.burger.style.transition = this.options.transitionDelay /  1000 + 's' + this.options.transitionEasing;


    if (this.options.overlay) {
      this.options.overlay.style.transition = this.options.transitionDelay /  1000 + 's' + this.options.transitionEasing;
      this.options.overlay.style.display = 'block';
    }

    this.options.menu.style.display = this.options.display;
    this.options.burger.setAttribute('aria-expanded', 'true');
    this.options.burger.setAttribute('aria-label', this.options.burgerActiveCaption);
    this.isAnimating = true;

    if (this.options.disableScroll) {
      this.html.classList.add('disable-scroll');
    }

    await waitFor(1);

    if (this.options.overlay) {
      this.options.overlay.classList.add('is-active');
    }

    this.options.menu.classList.add('is-active');
    this.options.burger.classList.add('is-active');

    await waitFor(this.options.transitionDelay);

    this.options.menu.style.transition = '';
    this.options.burger.style.transition = '';

    if (this.options.overlay) {
      this.options.overlay.style.transition = '';
    }

    this.isAnimating = false;
  }

  async close() {
    if (this.isAnimating) return;

    this.options.onClose();

    this.options.menu.style.transition = this.options.transitionDelay /  1000 + 's' + this.options.transitionEasing;
    this.options.burger.style.transition = this.options.transitionDelay /  1000 + 's' + this.options.transitionEasing;

    if (this.options.overlay) {
      this.options.overlay.style.transition = this.options.transitionDelay /  1000 + 's' + this.options.transitionEasing;
      this.options.overlay.classList.remove('is-active');
    }

    this.options.menu.classList.remove('is-active');
    this.options.burger.classList.remove('is-active');
    this.options.burger.setAttribute('aria-expanded', 'false');
    this.options.burger.setAttribute('aria-label', this.options.burgerCaption);

    if (this.options.disableScroll) {
      this.html.classList.remove('disable-scroll');
    }

    await waitFor(this.options.transitionDelay);

    if (this.options.overlay) {
      this.options.overlay.style.display = '';
      this.options.overlay.style.transition = '';
    }

    this.options.menu.style.display = '';

    this.options.menu.style.transition = '';
    this.options.burger.style.transition = '';

    this.isAnimating = false;
  }

  toggle() {
    this.options.menu.classList.contains('is-active') ? this.close() : this.open();
  }

  _init() {
    if (!this.options.menu) return;
    this.options.burger.setAttribute('aria-label', this.options.burgerCaption);
    this._events();
  }

  _addListeners() {
    this.options.burger?.addEventListener('click', this.toggleHandler);
    this.options.close?.addEventListener('click', this.closeHandler);
    this.options.overlay?.addEventListener('click', this.closeHandler);
    this.options.navLinks?.forEach((el) => el.addEventListener('click', this.closeHandler));
  }

  _removeListeners() {
    this.options.burger?.removeEventListener('click', this.toggleHandler);
    this.options.close?.removeEventListener('click', this.closeHandler);
    this.options.overlay?.removeEventListener('click', this.closeHandler);
    this.options.navLinks?.forEach((el) => el.removeEventListener('click', this.closeHandler));
  }

  _events() {
    const initEvents = () => {
      // Enable menu on screens <= breakpoint, otherwise disable it
      if (window.innerWidth <= this.options.breakpoint) {
        if (this.isInit) return;
        this._addListeners();
        this.isInit = true;
      } else {
        if (!this.isInit) return;
        this.close();
        this._removeListeners();
        this.isInit = false;
      }
    }

    initEvents();

    window.addEventListener('resize', throttle(initEvents));
  }
}

class SimpleModal {
  constructor(options) {
    const defaultOptions = {
      onInit: () => {},
      beforeOpen: () => {},
      onOpen: () => {},
      beforeClose: () => {},
      onClose: () => {},
      disableScroll: true,
      transitionDelay: 250,
      nested: true,
      overlayCloseAll: true,
      fixPageOffset: true,
      fixedBlocks: []
    };
    this.options = { ...defaultOptions, ...options };
    this.html = document.querySelector('html');
    this.body = document.querySelector('body');
    this.modalNodes = document.querySelectorAll('.modal');
    this.activeModalNodes = document.querySelectorAll('.modal.is-open');
    this.isAnimated = false;
  }
  init() {
    if (this.modalNodes.length > 0) {
      this.modalNodes.forEach((modalNode) => {
        modalNode.style.transitionDuration =
          this.options.transitionDelay / 1000 + 's';
      });
      this._events();
      this.options.onInit();
    }
  }
  async open(id) {
    if (this.isAnimated) return;

    if (this.activeModalNodes.length > 0) {
      await this.closeAll();
      await waitFor(this.options.transitionDelay + 100);
    }

    const modalNode = document.querySelector('#' + id);

    this.options.beforeOpen(modalNode);

    modalNode.setAttribute('aria-hidden', false);
    this.isAnimated = true;

    await waitFor(1);

    modalNode.classList.add('is-open');
    if (this.options.disableScroll) {
      this._disableScroll(modalNode);
    }

    await waitFor(this.options.transitionDelay);

    this.isAnimated = false;
    this.activeModalNodes = document.querySelectorAll('.modal.is-open');
    this.options.onOpen(modalNode);
  }
  async close(id) {
    if (this.isAnimated) return;

    const modalNode = document.querySelector('#' + id);

    this.options.beforeClose(modalNode);

    this.isAnimated = true;
    modalNode.classList.remove('is-open');

    if (this.options.disableScroll && this.activeModalNodes.length === 1) {
      this._enableScroll(modalNode);
    }

    await waitFor(this.options.transitionDelay);

    modalNode.setAttribute('aria-hidden', true);
    this.isAnimated = false;
    this.activeModalNodes = document.querySelectorAll('.modal.is-open');
    this.options.onClose(modalNode);
  }
  async closeAll() {
    this.activeModalNodes.forEach(async (modalNode) => {
      this.isAnimated = false;
      await this.close(modalNode.id);
    });
  }
  _events() {
    const initEvents = (e) => {
      const openTrigger = e.target.closest('[data-modal-open]');
      const closeTrigger = e.target.closest('[data-modal-close]');
      const modalNode = e.target.closest('.modal');
      const isOverlay = modalNode && !e.target.closest('.modal__inner');

      if (openTrigger) {
        e.preventDefault();
        const modalId = openTrigger.dataset.modalOpen;

        if (!this.options.nested && this.activeModalNodes.length > 0) {
          this.closeAll();
          waitFor(this.options.transitionDelay);
          this.open(modalId);
        } else {
          this.open(modalId);
        }
      } else if (closeTrigger) {
        e.preventDefault();
        const modalId = closeTrigger.dataset.modalClose || modalNode.id;
        this.close(modalId);
      } else if (isOverlay) {
        if (this.options.overlayCloseAll && this.activeModalNodes.length > 0) {
          this.closeAll();
        } else {
          this.close(modalNode.id);
        }
      }
    };

    document.body.addEventListener('click', initEvents);
  }

  _enableScroll(modalNode) {
    this.html.style.overflow = '';
    this.body.style.overflow = '';

    if (this.options.fixPageOffset) {
      this.options.fixedBlocks.forEach(el => el.style.paddingRight = '');

      modalNode.style.paddingRight = '';
      this.body.style.paddingRight = '';
    }
  }

  _disableScroll(modalNode) {
    this.html.style.overflow = 'hidden';
    this.body.style.overflow = 'hidden';

    if (this.options.fixPageOffset) {
      const scrollWidth = window.innerWidth - this.body.offsetWidth + 'px';

      this.options.fixedBlocks.forEach(el => el.style.paddingRight = scrollWidth);

      modalNode.style.paddingRight = scrollWidth;
      this.body.style.paddingRight = scrollWidth;
    }
  }
}

function initPageTabs(triggerSelector) {
  const triggerNodes = document.querySelectorAll(triggerSelector);

  if (triggerNodes.length > 0) {
    triggerNodes.forEach((triggerNode) => {
      triggerNode.addEventListener('click', (e) => {
        e.preventDefault();

        if (triggerNode.classList.contains('is-active')) return;

        const activeTrigger = document.querySelector(
          triggerSelector + '.is-active'
        );
        const activeBlocks = document.querySelectorAll(
          '.tabs-content-item.is-active'
        );

        const id = triggerNode.getAttribute('data-tabs');

        activeTrigger.classList.remove('is-active');

        activeBlocks.forEach(item => {
          item.classList.remove('is-active');
        })
        
        triggerNode.classList.add('is-active');

        const newActiveBlocks = document.querySelectorAll(
          '.tabs-content-item[data-tabs="' + id + '"]'
        );

        newActiveBlocks.forEach(item => {
          item.classList.add('is-active');
        })
      });
    });
    const hash = location.hash.replace(/^#/, "");
    if (hash) {
      const triggerEl = document.querySelector(`${triggerSelector}[data-tabs="${hash}"]`);
      triggerEl?.click();
    }

    triggerNodes.forEach(el => {
        el.addEventListener('click', (e) => {
            const targetId = el.dataset.tabs.replace(/^#/, "");

            if (targetId) {
              location.hash = targetId;
            }
        })
    })
  }
}

function initTabs(triggerSelector, parentSelector, needHash) {
  const triggerNodes = document.querySelectorAll(triggerSelector);
  const parentNodes = document.querySelectorAll(parentSelector);

  if (triggerNodes.length > 0 && parentNodes.length > 0) {
    const needInit = Array.from(triggerNodes).every(
      (triggerNode) => !triggerNode.classList.contains('is-active')
    );

    if (needInit) {
      triggerNodes[0].classList.add('is-active');
      parentNodes[0].classList.add('is-active');
    }

    triggerNodes.forEach((triggerNode) => {
      triggerNode.addEventListener('click', (e) => {
        e.preventDefault();

        if (triggerNode.classList.contains('is-active')) return;

        const activeTrigger = document.querySelector(
          triggerSelector + '.is-active'
        );
        const activeParent = document.querySelector(
          parentSelector + '.is-active'
        );

        const id = triggerNode.getAttribute('data-tabs');

        activeTrigger.classList.remove('is-active');
        activeParent.classList.remove('is-active');

        triggerNode.classList.add('is-active');

        const newActiveParent = document.querySelector(
          parentSelector + '[data-tabs="' + id + '"]'
        );

        newActiveParent.classList.add('is-active');
      });
    });

    if (!needHash) return;

    const hash = location.hash.replace(/^#/, "");

    if (hash) {
      const triggerEl = document.querySelector(`${triggerSelector}[data-tabs="${hash}"]`);
      triggerEl.click();
    }

    triggerNodes.forEach(el => {
        el.addEventListener('click', (e) => {
          const targetId = el.dataset.tabs.replace(/^#/, "");

          if (targetId) {
            location.hash = targetId;
          }
        })
    })
  }
}

function initAccordion(triggerSelector, parentSelector) {
  const triggerNodes = document.querySelectorAll(triggerSelector);

  if (!triggerNodes.length > 0) return;

  triggerNodes.forEach((el) => {
    el.addEventListener('click', function () {
      const parentNode = el.closest(parentSelector);

      parentNode.classList.toggle('is-active');
    });
  });
}

const waitFor = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const throttle = (func, delay = 250) => {
  let isThrottled = false;
  let savedArgs = null;
  let savedThis = null;

  return function wrap(...args) {
    if (isThrottled) {
      savedArgs = args,
      savedThis = this;
      return;
    }

    func.apply(this, args);
    isThrottled = true;

    setTimeout(() => {
      isThrottled = false;

      if (savedThis) {
        wrap.apply(savedThis, savedArgs);
        savedThis = null;
        savedArgs = null;
      }

    }, delay);
  }
};
const changeHeight = () => {
  document.querySelector(':root').style.setProperty('--window-height', `${window.innerHeight}px`);
};

changeHeight();

window.addEventListener('resize', throttle(changeHeight));
