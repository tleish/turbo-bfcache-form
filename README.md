The intent of this library is to add support for bfcache (back-forward cache) forms when using [TurboLinks](https://github.com/turbo/turbo) ?

### SUPPORTED BROWSERS

Turbo works in all modern desktop and mobile browsers.

**IE Browser Support**

Note: if using this library with IE you must polyfill [Element.closest()](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest) and [Array.prototype.find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find).


### INSTALLATION

1. Install `yarn add tleish/turbolinks-bfcache-form`
2. Import and initialize TubolinksBfcacheForm and start the listener

```javascript
import Turbo from "@hotwired/turbo"
import TurboBfcacheForm from 'turbo-bfcache-form';
```



### DISABLING BFCACHE

**Entire Page:**
You can disable bfcace for the entire page using turbo standard cache control:

```html
<meta name="turbo-cache-control" content="no-cache">
```
**Parent DOM**

Any part of the parent DOM using `data-turbo`

```html
<div data-turbo="false">
	<form...>
```

**Form**

Disable on a specific form using `data-turbo-bfcache-form`

```html
<form... data-turbo-bfcache-form="false">
```

**Field**

Disable for a specific field using `data-turbo-bfcache-form`
```html
<input type="text"... data-turbo-bfcache-form="false">
```

Note: input type=password is disabled by default.


### BACKGROUND

Browsers today have bfcache (back-forward cache).  Turbo essentially replaces this bfcache functionality and behaves similar to browsers except with form inputs (text, select, checkboxes, etc).

### DISCOVERIES
When a user changes values in HTML form fields, these changes are preserved in memory and not in the DOM.  For example, lets say you have the following input:

#### Original DOM:

```html
<input type="text" id="first_name" name="first_name" value="" />
```

#### Original JavaScript:

```javascript
document.getElementById("first_name").value //=> ""
document.getElementById("first_name").defaultValue //=> ""
```

**Update form value:**
Update the form with user input or javascript

```javascript
document.getElementById("first_name").value = "Suzy"
```

After entering in a first name "Suzy", you now have the following:

**Updated DOM: (no change)**

```html
<input type="text" id="first_name" name="first_name" value="" />
```

**Updated JavaScript:**

```javascript
document.getElementById("first_name").value //=> "Suzy"
document.getElementById("first_name").defaultValue //=> ""
```

Even though the "value" changed, the DOM reflects the inputs "defaultValue".  The assumption is the browser uses this defaultValue in the DOM in the event of a form reset.

Since Turbo caches DOM changes (not memory changes), it only caches the defaultValue and not the users input.  In some cases, this is desired (there are forums with developers asking how to prevent browsers from apply bfcache to their forms).  However, [some users](https://github.com/stimulusjs/stimulus/issues/328) want this functionality on forms to make it easier for users after they press back/forward buttons on pages where they've spent time filling out forms.  This is especially important if the form was long.

#### Solution:

This library caches the input values to each form field before leaving the page

1. Write form input values to a custom field data attributes on event `turbo:before-cache`
2. Restore form inputs using custom form field attributes on event `turbo:load` (and remove the custom form field attribute).

## Contributing to TurboBfcacheForms

TurboBfcacheForms is open-source software, freely distributable under the terms of an [MIT-style license](https://github.com/tleish/turbo-bfcache-form/blob/master/LICENSE). The [source code is hosted on GitHub](https://github.com/tleish/turbo-bfcache-form). 

We welcome contributions in the form of bug reports, pull requests, or thoughtful discussions in the [GitHub issue tracker](https://github.com/tleish/turbo-bfcache-form/issues).

### Building From Source

To build from source, first make sure you have the [Yarn package manager](https://yarnpkg.com/) installed.

```
$ yarn install
```

Include the resulting `dist/turbo-bfcache-form.js` file in your application’s JavaScript bundle.

### Running Tests

To run the test suite, follow the instructions for *Building From Source* above, then run:

```
$ yarn test
```



## REFERENCES

- Turbo: https://github.com/hotwired/turbo
- https://github.com/turbolinks/turbolinks/issues/574
- MDN: https://developer.mozilla.org/en-US/docs/Archive/Misc_top_level/Working_with_BFCache
- Google Chrome: https://web.dev/bfcache/
- Firefox: https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/1.5/Using_Firefox_1.5_caching
