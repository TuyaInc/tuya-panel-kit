export const DEFAULT_LANG =  {
  en: {
    test: 'Test',
    hello: 'Hello',
  },
  zh: {
    test: '测试',
    hello: '你好',
  },
};

export const createTYNative = (lang, appStrings) => ({
  lang: appStrings,
  mobileInfo: {
    lang,
  },
});
