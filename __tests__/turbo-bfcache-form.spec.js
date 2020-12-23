import TurboBfcacheForm from 'turbo-bfcache-form';

describe('FormController', () => {
  let form, input;
  describe('load form page', () => {
    beforeEach(() => {
      document.head.innerHTML = '';
      document.body.innerHTML = `
        <form id="form" data-controller="form">
          <input id="email" type="email" tabindex="1" value="">
          <input id="hidden" type="hidden" value="">
          <input id="password" type="password" value="">
          <input id="checkbox" type="checkbox" value="">
          <input id="radio1" type="radio" name="myRadio" value="1">
          <input id="radio2" type="radio" name="myRadio" value="2">
          <select id="cars">
            <option value="volvo">Volvo</option>
            <option value="saab">Saab</option>
            <option value="mercedes">Mercedes</option>
            <option value="audi">Audi</option>
          </select>
        </form>
      `;

      form = document.getElementById('form');
      input = document.getElementById('email');
    });

    describe('general caching', () => {
      it('caches form input', () => {
        TurboBfcacheForm.load();
        input.value = 'test@email.com';
        TurboBfcacheForm.change({ target: input });
        expect(input.dataset.turboBfcacheFormValue).toBe('test@email.com');
      });

      it('resets cached form as cached for optimization', () => {
        input.value = 'test@email.com';
        TurboBfcacheForm.change({ target: input });
        input.value = '';
        TurboBfcacheForm.change({ target: input });
        expect(input.dataset.turboBfcacheFormValue).toBeUndefined();
      });
    });

    describe('pageshow', () => {
      it('caches fields when page loads from browser and not history', () => {
        input.value = 'test@email.com';
        TurboBfcacheForm.pageshow();
        input.value = '';
        TurboBfcacheForm.load();
        expect(input.value).toBe('test@email.com');
      });
    });

    describe('beforeCache', () => {
      it('caches focused field before leaving page', () => {
        input.tabindex = 1; // must set tabindex for JSDOM .focus() to work
        input.focus();
        input.value = 'test@email.com';
        TurboBfcacheForm.beforeCache();
        input.value = '';
        TurboBfcacheForm.load();
        expect(input.value).toBe('test@email.com');
      });
    });

    describe('no cache', () => {
      afterEach(() => {
        input.value = 'test@email.com';
        TurboBfcacheForm.change({ target: input });
        input.value = '';
        TurboBfcacheForm.load();
        expect(input.value).toBe('');
      });

      it('does not cache form when data-turbo-bfcache-form="false"', () => {
        form.dataset.turboBfcacheForm = false;
      });

      it('does not cache input when data-turbo-bfcache-form="false"', () => {
        input.dataset.turboBfcacheForm = false;
      });

      it('does not cache form when data-turbo="false"', () => {
        form.dataset.turbo = false;
      });

      it('does not cache form when turbo disabled', () => {
        document.head.innerHTML =
          '<meta name="turbo-cache-control" content="no-cache">';
      });
    });

    describe('form inputs', () => {
      it('caches text input', () => {
        const input = document.getElementById('email');
        TurboBfcacheForm.load();
        input.value = 'test@email.com';
        TurboBfcacheForm.change({ target: input });
        input.value = '';
        TurboBfcacheForm.load();
        expect(input.value).toBe('test@email.com');
      });

      it('caches from form event', () => {
        const input = document.getElementById('email');
        TurboBfcacheForm.load();
        input.value = 'test@email.com';
        TurboBfcacheForm.change({ target: form });
        input.value = '';
        TurboBfcacheForm.load();
        expect(input.value).toBe('test@email.com');
      });

      it('does not cache password input', () => {
        const input = document.getElementById('password');
        TurboBfcacheForm.load();
        input.value = 'abc123';
        TurboBfcacheForm.change({ target: input });
        input.value = '';
        TurboBfcacheForm.load();
        expect(input.value).toBe('');
      });

      it('caches checkbox input', () => {
        const input = document.getElementById('checkbox');
        TurboBfcacheForm.load();
        input.checked = true;
        TurboBfcacheForm.change({ target: input });
        input.checked = false;
        TurboBfcacheForm.load();
        expect(input.checked).toBeTruthy();
      });

      it('caches radio group', () => {
        const input = document.getElementById('radio1');
        TurboBfcacheForm.load();
        input.checked = true;
        TurboBfcacheForm.change({ target: input });
        input.checked = false;
        TurboBfcacheForm.load();
        expect(input.checked).toBeTruthy();
      });

      it('caches radio without group', () => {
        const input = document.getElementById('radio1');
        input.removeAttribute('name');
        TurboBfcacheForm.load();
        input.checked = true;
        TurboBfcacheForm.change({ target: input });
        input.checked = false;
        TurboBfcacheForm.load();
        expect(input.checked).toBeTruthy();
      });

      it('caches select-one', () => {
        const input = document.getElementById('cars');
        TurboBfcacheForm.load();
        input.value = 'audi';
        TurboBfcacheForm.change({ target: input });
        input.value = '';
        TurboBfcacheForm.load();
        expect(input.value).toBe('audi');
      });

      it('caches select-multiple', () => {
        const input = document.getElementById('cars');
        input.multiple = true;
        TurboBfcacheForm.load();
        const options = input.options;
        options[0].selected = false;
        options[1].selected = true;
        options[3].selected = true;
        TurboBfcacheForm.change({ target: input });
        options[0].selected = true;
        options[1].selected = false;
        options[3].selected = false;
        TurboBfcacheForm.load();
        expect(options[1].selected).toBeTruthy();
        expect(options[3].selected).toBeTruthy();
      });
    });
  });
});
