import {PostDoc} from 'postdoc-lib';

export const installCodeChecker = async (checkCode: () => Promise<{passed: boolean, message?: string}>) => {
  const postDoc = new PostDoc({
    messageTarget: window.top!,
    messageReceiver: window,
    onMessage: async (e) => {
      const message = e.data;

      switch (message) {
        case 'CHECK':
          const {passed, message} = await checkCode();
          const status = passed ? 'PASSED' : 'FAILED';
          await postDoc.handshake;
          postDoc.postMessage({status, message});
          break;
      }
    }
  });

  await postDoc.handshake;
  postDoc.postMessage({status: 'READY'});
}