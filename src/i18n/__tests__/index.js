/**
 * 保证多语言核心功能正常
 */

describe('I18N Core', () => {
  beforeEach(() => jest.resetModules());

  it('en 保证多语言显示正常', () => {
    jest.mock('../../api', () =>
      require('./utils').createTYNative('en', {
        // 模拟 app 给到面板的多语言数据，优先级高一些
        en: {
          test: 'TestChanged',
          day: 'Day',
          month: 'Month',
        },
        zh: {
          day: '天',
        },
      })
    );
    const I18N = require('../index').default;
    const data = new I18N({
      en: {
        test: 'Test',
        hello: 'Hello',
      },
      zh: {
        test: '测试',
        hello: '你好',
      },
    });
    expect(data).toEqual({
      defaultLang: 'en',
      language: 'en',
      test: 'TestChanged', // app 给的覆盖了，需要变更
      hello: 'Hello',
      day: 'Day', // app 给的合进来
      month: 'Month',
      strings: {
        en: {
          test: 'TestChanged', // app 给的覆盖了，需要变更
          hello: 'Hello',
          day: 'Day',
          month: 'Month',
        },
        zh: {
          test: '测试',
          hello: '你好',
          day: '天', // app 给的合进来
        },
      },
    });
  });

  it('zh 保证多语言显示正常', () => {
    jest.mock('../../api', () =>
      require('./utils').createTYNative('zh', {
        // 模拟 app 给到面板的多语言数据，优先级高一些
        en: {
          test: 'TestChanged',
          day: 'Day',
          month: 'Month',
        },
        zh: {
          day: '天',
        },
      })
    );
    const I18N = require('../index').default;
    const data = new I18N({
      en: {
        test: 'Test',
        hello: 'Hello',
      },
      zh: {
        test: '测试',
        hello: '你好',
      },
    });
    expect(data).toEqual({
      defaultLang: 'en',
      language: 'zh',
      test: '测试',
      hello: '你好',
      day: '天',
      month: 'Month',
      strings: {
        en: {
          test: 'TestChanged',
          hello: 'Hello',
          day: 'Day',
          month: 'Month',
        },
        zh: {
          test: '测试',
          hello: '你好',
          day: '天',
        },
      },
    });
  });

  it('zh-Hans 3.20 以后 IOS 保证多语言显示正常', () => {
    jest.mock('../../api', () =>
      require('./utils').createTYNative('zh-Hans', {
        // 模拟 app 给到面板的多语言数据，优先级高一些
        en: {
          test: 'TestChanged',
          day: 'Day',
          month: 'Month',
        },
        'zh-Hans': {
          day: '天',
          extra: '额外的',
        },
      })
    );
    const I18N = require('../index').default;
    const data = new I18N({
      en: {
        test: 'Test',
        hello: 'Hello',
      },
      // 本地只有 zh 的多语言
      zh: {
        test: '测试',
        hello: '你好',
      },
    });
    expect(data).toEqual({
      defaultLang: 'en',
      language: 'zh-Hans',
      day: '天', // 这里需要把 zh-Hans 的多语言拿到顶层
      month: 'Month',
      extra: '额外的', // 这里需要把 zh-Hans 的多语言拿到顶层
      test: '测试', // 这里需要把 zh 的多语言也拿到顶层，保证老项目本地兜住
      hello: '你好', // 这里需要把 zh 的多语言也拿到顶层，保证老项目本地兜住
      strings: {
        en: {
          test: 'TestChanged',
          hello: 'Hello',
          day: 'Day',
          month: 'Month',
        },
        zh: {
          test: '测试',
          hello: '你好',
        },
        'zh-Hans': {
          day: '天',
          extra: '额外的',
        },
      },
    });
  });

  it('zh_CN 3.20 以后安卓保证多语言显示正常', () => {
    jest.mock('../../api', () =>
      require('./utils').createTYNative('zh_CN', {
        // 模拟 app 给到面板的多语言数据，优先级高一些
        en: {
          test: 'TestChanged',
          day: 'Day',
          month: 'Month',
        },
        zh_CN: {
          day: '天',
          extra: '额外的',
        },
      })
    );
    const I18N = require('../index').default;
    const data = new I18N({
      en: {
        test: 'Test',
        hello: 'Hello',
      },
      // 本地只有 zh 的多语言
      zh: {
        test: '测试',
        hello: '你好',
      },
    });
    expect(data).toEqual({
      defaultLang: 'en',
      language: 'zh_CN',
      day: '天', // 这里需要把 zh_CN 的多语言拿到顶层
      month: 'Month',
      extra: '额外的', // 这里需要把 zh_CN 的多语言拿到顶层
      test: '测试', // 这里需要把 zh 的多语言也拿到顶层，保证老项目本地兜住
      hello: '你好', // 这里需要把 zh 的多语言也拿到顶层，保证老项目本地兜住
      strings: {
        en: {
          test: 'TestChanged',
          hello: 'Hello',
          day: 'Day',
          month: 'Month',
        },
        zh: {
          test: '测试',
          hello: '你好',
        },
        zh_CN: {
          day: '天',
          extra: '额外的',
        },
      },
    });
  });

  it('zh_Hans_CN 3.20 以后安卓保证多语言显示正常', () => {
    jest.mock('../../api', () =>
      require('./utils').createTYNative('zh_Hans_CN', {
        // 模拟 app 给到面板的多语言数据，优先级高一些
        en: {
          test: 'TestChanged',
          day: 'Day',
          month: 'Month',
        },
        // 本地只有 zh 的多语言
        zh_Hans_CN: {
          day: '天',
          extra: '额外的',
        },
      })
    );
    const I18N = require('../index').default;
    const data = new I18N({
      en: {
        test: 'Test',
        hello: 'Hello',
      },
      zh: {
        test: '测试',
        hello: '你好',
      },
    });
    expect(data).toEqual({
      defaultLang: 'en',
      language: 'zh_Hans_CN',
      day: '天', // 这里需要把 zh_Hans_CN 的多语言拿到顶层
      month: 'Month',
      extra: '额外的', // 这里需要把 zh_Hans_CN 的多语言拿到顶层
      test: '测试', // 这里需要把 zh 的多语言也拿到顶层，保证老项目本地兜住
      hello: '你好', // 这里需要把 zh 的多语言也拿到顶层，保证老项目本地兜住
      strings: {
        en: {
          test: 'TestChanged',
          hello: 'Hello',
          day: 'Day',
          month: 'Month',
        },
        zh: {
          test: '测试',
          hello: '你好',
        },
        zh_Hans_CN: {
          day: '天',
          extra: '额外的',
        },
      },
    });
  });

  it('zh-tw 保证显示正常', () => {
    jest.mock('../../api', () =>
      require('./utils').createTYNative('zh-tw', {
        // 模拟 app 给到面板的多语言数据，优先级高一些
        en: {
          test: 'TestChanged',
          day: 'Day',
          month: 'Month',
        },
        'zh-tw': {
          day: '天（繁体）',
          extra: '額外的（繁体）',
        },
      })
    );
    const I18N = require('../index').default;
    const data = new I18N({
      en: {
        test: 'Test',
        hello: 'Hello',
      },
      zh: {
        test: '测试',
        hello: '你好',
      },
    });
    expect(data).toEqual({
      defaultLang: 'en',
      language: 'zh-tw',
      day: '天（繁体）', // 这里需要把 zh-tw 的多语言拿到顶层
      month: 'Month',
      extra: '額外的（繁体）', // 这里需要把 zh-tw 的多语言拿到顶层
      test: 'TestChanged', // 这里只能把 en 的放到顶层
      hello: 'Hello', // 这里只能把 en 的放到顶层
      strings: {
        en: {
          test: 'TestChanged',
          hello: 'Hello',
          day: 'Day',
          month: 'Month',
        },
        zh: {
          test: '测试',
          hello: '你好',
        },
        'zh-tw': {
          day: '天（繁体）',
          extra: '額外的（繁体）',
        },
      },
    });
  });

  it('ja 保证显示正常', () => {
    jest.mock('../../api', () =>
      require('./utils').createTYNative('ja', {
        // 模拟 app 给到面板的多语言数据，优先级高一些
        en: {
          test: 'TestChanged',
          day: 'Day',
          month: 'Month',
        },
        ja: {
          day: 'あ',
          extra: 'エキストラ',
        },
      })
    );
    const I18N = require('../index').default;
    const data = new I18N({
      en: {
        test: 'Test',
        hello: 'Hello',
      },
      zh: {
        test: '测试',
        hello: '你好',
      },
    });
    expect(data).toEqual({
      defaultLang: 'en',
      language: 'ja',
      day: 'あ', // 这里需要把 ja 的多语言拿到顶层
      month: 'Month',
      extra: 'エキストラ', // 这里需要把 ja 的多语言拿到顶层
      test: 'TestChanged', // 这里只能把 en 的放到顶层
      hello: 'Hello', // 这里只能把 en 的放到顶层
      strings: {
        en: {
          test: 'TestChanged',
          hello: 'Hello',
          day: 'Day',
          month: 'Month',
        },
        zh: {
          test: '测试',
          hello: '你好',
        },
        ja: {
          day: 'あ',
          extra: 'エキストラ',
        },
      },
    });
  });
});
