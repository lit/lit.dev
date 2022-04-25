import {installCodeChecker} from './_check-code-helpers.js';

installCodeChecker(async () => {
  let passed = true;
  let message = '';

  const element = document.body.querySelector('my-element');
  const nameAttribute = element.getAttribute('name');

  if (element.name === undefined) {
    passed = false;
    message = `Define the 'name' property on the element.`;
  } else if (element.name !== nameAttribute) {
    passed = false;
    message = `The element's name property is not a reactive property.`;
  }

  return {passed, message};
});