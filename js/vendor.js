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

function moveElementOnBreakpoint(
  movedSelector,
  { fromSelector, fromPosition = 'beforeend' },
  { toSelector, toPosition = 'beforeend' },
  breakpoint = 1200) {

  const movedNode = document.querySelector(movedSelector);

  if (!movedNode) return;

  const fromNode = document.querySelector(fromSelector);
  const toNode = document.querySelector(toSelector);

  let isMoved = false;

  function move() {
    if (window.innerWidth <= breakpoint) {
      if (!isMoved) {
        toNode.insertAdjacentElement(toPosition, movedNode);
        isMoved = true;
      }
    } else {
      if (isMoved) {
        fromNode.insertAdjacentElement(fromPosition, movedNode);
        isMoved = false;
      }
    }
  }

  window.addEventListener('resize', throttle(move));

  move();
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
