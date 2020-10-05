export const DEFAULT_LANG = {
  en: {
    test: 'Test',
    hello: 'Hello',
  },
  zh: {
    test: '测试',
    hello: '你好',
  },
};

export const DEFAULT_SCHEMA = {
  mode: {
    mode: 'rw',
    code: 'mode',
    name: '工作模式',
    id: '4',
    type: 'enum',
    dptype: 'obj',
    range: ['auto', 'cold', 'hot', 'wet', 'wind'],
  },
};

export const createTYNative = (lang, appStrings) => ({
  native: {
    lang: appStrings,
    mobileInfo: {
      lang,
    },
  },
  mobile: {
    getMobileInfo: new Promise(resolve => {
      resolve({ lang });
    }),
  },
  device: {
    getDpSchema: code => DEFAULT_SCHEMA[code],
  },
});
