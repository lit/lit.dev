import {installCodeChecker} from './_check-code-helpers.js';

installCodeChecker(async () => {
  const passed = true;
  const message = 'This test always passes just showing off the delayed check state.';

  let resolve;
  const prom = new Promise(res => {resolve=res});
  setTimeout(() => {resolve()}, 3000);
  await prom

  return {passed, message};
});