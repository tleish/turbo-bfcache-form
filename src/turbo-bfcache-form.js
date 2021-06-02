/**
 * SUMMARY: Back/Forward Cache (bfcache) Form Inputs
 *
 * DESCRIPTION: I cache form inputs for using backwards/forwards navigation
 *
 * @param {string} data-turbo="false" : disables form cache for that form, element or children
 * @param {string} data-turbo-bfcache-form="false" : disables form cache for that form, element or children
 *
 * TODO: polyfill Element.closest(), Array.prototype.find()
 */

const DATA_TURBO_BFCACHE_FORM = 'data-turbo-bfcache-form';
const DATA_TURBO_BFCACHE_FORM_VALUE = `${DATA_TURBO_BFCACHE_FORM}-value`;
const DISABLE_BFCACHED_FORM_QUERY = `[data-turbo="false"],[${DATA_TURBO_BFCACHE_FORM}="false"]`;

class TurboFormBfcache {
  static start() {
    document.addEventListener('turbo:load', TurboFormBfcache.load);
    document.addEventListener('turbo:before-cache', TurboFormBfcache.beforeCache);
    window.addEventListener('pageshow', TurboFormBfcache.pageshow);
    document.addEventListener('change', TurboFormBfcache.change);
  }

  // force onchange event if capture currently focused element, if user presses back/forward after entering
  // input and presses back or forward button before leaving field
  static beforeCache() {
    if (document.activeElement.form) {
      // if active element is a form field
      FormElementFactory.cache(document.activeElement);
    }
  }

  // re-cache forms on pageshow when view is restored using cache
  static pageshow() {
    document.querySelectorAll('form').forEach((form) => {
      FormElementFactory.cache(form);
    });
  }

  static load() {
    document
      .querySelectorAll(`[${DATA_TURBO_BFCACHE_FORM_VALUE}]`)
      .forEach((input) => {
        FormElementFactory.restore(input);
      });
  }

  static change(e) {
    const turboCacheControl = new TurboCacheControl('bfcache');
    const isFormElement = e.target.form || e.target.tagName.toLowerCase() === 'form';
    if (isFormElement && turboCacheControl.allowCache) {
      const turboForm = new TurboForm(e.target.form, turboCacheControl);
      turboForm.change(e);
    }
  }
}

export default TurboFormBfcache;
TurboFormBfcache.start();

class TurboForm {
  constructor(form, turboCacheControl) {
    this.form = form;
    this.turboCacheControl = turboCacheControl;
  }

  change = (event) => FormElementFactory.cache(event.target);
}

const TURBO_CACHE_CONTROL = 'turbo-cache-control';
class TurboCacheControl {
  constructor(dataTag = '') {
    this.dataTag = dataTag;
  }

  get allowCache() {
    return (this.metaTag() || {}).content !== 'no-cache';
  }

  metaTag() {
    return document.head.querySelector(`[name=${TURBO_CACHE_CONTROL}]`);
  }
}

class FormElement {
  static tagName = /./;
  static type = /./;

  static check(element) {
    return (
      element.tagName.toLowerCase().match(this.tagName) &&
      String(element.type).toLowerCase().match(this.type)
    );
  }

  constructor(element) {
    this.element = element;
  }

  cache() {
    this.elements.forEach((element) => {
      element.removeAttribute(this.cacheKey);
      if (
        element[this.attribute] !== undefined &&
        element[this.defaultAttribute] !== element[this.attribute]
      ) {
        const value = JSON.stringify(element[this.attribute]);
        element.setAttribute(this.cacheKey, value);
      }
    });

    return this;
  }

  restore() {
    this.elements.forEach((element) => {
      if (element.hasAttribute(this.cacheKey)) {
        element[this.attribute] = JSON.parse(element.getAttribute(this.cacheKey));
      }
    });

    return this;
  }

  get cacheKey() {
    return DATA_TURBO_BFCACHE_FORM_VALUE;
  }

  get attribute() {
    return 'value';
  }

  get defaultAttribute() {
    return `default${this.attribute
      .charAt(0)
      .toUpperCase()}${this.attribute.slice(1)}`;
  }

  get elements() {
    return [this.element];
  }
}

class FormForm extends FormElement {
  static tagName = /^form$/;

  cache() {
    this.elements.forEach((element) => FormElementFactory.cache(element));
    return this;
  }

  get elements() {
    return [...this.element.elements];
  }
}

class FormInput extends FormElement {
  static tagName = /^input$/;
}

class FormPassword extends FormInput {
  static type = /^password$/;

  cache() {
    return this;
  }
}

class FormCheckbox extends FormElement {
  static type = /^checkbox$/;

  get attribute() {
    return 'checked';
  }
}

class FormRadio extends FormCheckbox {
  static type = /^radio$/;

  get elements() {
    // get all other radios or checkbox with the same name
    const elementRoot = this.element.form || document;
    const radioGroup = elementRoot.querySelectorAll(
      `input[type="radio"][name="${this.element.name}"]`
    );
    if (radioGroup.length === 0) {
      return [this.element];
    }
    return [...radioGroup];
  }
}

class FormSelectOption extends FormElement {
  static tagName = /^option$/;

  get attribute() {
    return 'selected';
  }
}

class FormSelectMultiple extends FormSelectOption {
  static tagName = /^select$/;
  static type = /^select-multiple$/;

  get elements() {
    return [...this.element.options];
  }
}

class FormSelectOne extends FormSelectMultiple {
  static type = /^select-one/;

  cache() {
    if (this.firstOptionSelectedWithNoDefault) {
      return this;
    }
    return super.cache();
  }

  // By default the browser selects the first option in a single-select when no default is set.
  // We do not want to flag the form as dirty if the user does not change this.
  get firstOptionSelectedWithNoDefault() {
    return (
      this.element.selectedIndex === 0 &&
      this.elements.every((element) => element.defaultSelected === false)
    );
  }
}

class BfcacheFormDisabled {
  cache() {
    return false;
  }

  restore() {
    return false;
  }
}

class FormElementFactory {
  // Order is important here:
  // Checked and Password should come before Input
  // FormSelectOption should come before FormSelectOne and FormSelectMultiple
  static elementClasses = [
    FormForm,
    FormCheckbox,
    FormRadio,
    FormPassword,
    FormInput,
    FormSelectOption,
    FormSelectOne,
    FormSelectMultiple,
    FormElement,
  ];

  static cache(element) {
    return this.findClass(element).cache();
  }

  static restore(element) {
    this.findClass(element).restore();
  }

  static findClass(element) {
    if (element.closest(DISABLE_BFCACHED_FORM_QUERY)) {
      return new BfcacheFormDisabled();
    }
    const foundClass = this.elementClasses.find((elementClass) =>
      elementClass.check(element)
    );
    return new foundClass(element);
  }
}
