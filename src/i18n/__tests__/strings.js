describe('I18N Strings', () => {
  beforeEach(() => jest.resetModules());

  it('保证默认多语言实例化正常', () => {
    jest.mock('../../api', () =>
      require('./utils').createTYNative('en', {
        // 模拟 app 给到面板的多语言数据，优先级高一些
        en: {
          extra: 'Extra',
        },
        zh: {
          extra: '额外的',
        },
      })
    );
    const Strings = require('../strings').default;
    const defaultLang = require('../strings').lang;
    expect(Strings.dps).toStrictEqual(Strings);
    expect(Strings).toEqual({
      defaultLang: 'en',
      language: 'en',
      ...defaultLang.en,
      extra: 'Extra',
      strings: {
        en: {
          ...defaultLang.en,
          extra: 'Extra',
        },
        zh: {
          ...defaultLang.zh,
          extra: '额外的',
        },
      },
    });
  });
});
