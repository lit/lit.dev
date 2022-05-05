import {installCodeChecker} from './_check-code-helpers.js';

installCodeChecker(async () => {
  let passed = true;
  let message = '';

  try {
    const element = document.body.querySelector('date-display');
    element.setAttribute('datestr', 'attribute not set');
    element.setAttribute('date-str', '5');
    await element.updateComplete;

    if (element.dateStr === undefined) {
      passed = false;
      message = `Define the 'dateStr' property in date-display.`;
    } else if (element.dateStr === 'attribute not set') {
      passed = false;
      message = `Set the attribute of the 'dateStr' reactive property to 'date-str'.`;
    } else if (element.dateStr === 5 || element.dateStr === true) {
      passed = false;
      message = `Make sure 'dateStr' is of 'type: String'`;
    } else if (element.dateStr !== '5') {
      passed = false;
      message = `The 'dateStr' property is not a reactive property`;
    }
  } catch (e) {
    passed = false;
  }

  message = passed ? `'dateStr' is now a reactive property that accepts strings!` : message;

  window.location.reload();
  return {passed, message};
});