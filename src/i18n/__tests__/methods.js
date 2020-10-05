describe('I18N Methods', () => {
  let Strings;
  beforeAll(() => {
    jest.mock('../../api', () =>
      require('./utils').createTYNative('en', {
        // 模拟 app 给到面板的多语言数据，优先级高一些
        en: {
          extra: 'Extra',
          dp_mode: 'Mode',
          dp_mode_auto: 'Auto Mode',
          countdown_on_multi: 'Turn off after {0}{1}',
        },
        zh: {
          extra: '额外的',
          dp_mode: '模式',
          dp_mode_auto: '自动模式',
          countdown_on_multi: '设备将在{0}{1}后关闭',
        },
      })
    );
    Strings = require('../strings').default;
  });

  it('applyStrings', () => {
    const prevStr = JSON.stringify(Strings);
    Strings.applyStrings({
      en: {
        test: 'Test',
      },
      zh: {
        test: '测试',
      },
      tw: {
        test: '测试其他地区',
      },
    });
    const prevStrings = JSON.parse(prevStr);
    expect(Strings).toEqual({
      ...prevStrings,
      test: 'Test',
      strings: {
        en: {
          ...prevStrings.strings.en,
          test: 'Test',
        },
        zh: {
          ...prevStrings.strings.zh,
          test: '测试',
        },
        tw: {
          test: '测试其他地区',
        },
      },
    });
  });

  it('_getBestMatchingLanguage', () => {
    const lang1 = Strings._getBestMatchingLanguage('zh', Strings.strings);
    expect(lang1).toBe('zh');

    const lang2 = Strings._getBestMatchingLanguage('en', Strings.strings);
    expect(lang2).toBe('en');

    const lang3 = Strings._getBestMatchingLanguage('zh-hans', Strings.strings);
    expect(lang3).toBe('zh');

    const lang4 = Strings._getBestMatchingLanguage('zh_hans', Strings.strings);
    expect(lang4).toBe('zh');

    const lang5 = Strings._getBestMatchingLanguage('jp', Strings.strings);
    expect(lang5).toBe('en');
  });

  it('getDpName', () => {
    const dpName = Strings.getDpName('mode');
    expect(dpName).toBe('Mode');

    const dpName2 = Strings.getDpName('modes');
    expect(dpName2).toBe('dp_modes');

    const dpName3 = Strings.getDpName('modes', '模式');
    expect(dpName3).toBe('模式');
  });

  it('getDpsLang', () => {
    const dpsLang = Strings.getDpsLang('back');
    expect(dpsLang).toBe('Back');
    const dpsLang2 = Strings.getDpsLang('notExistKey');
    expect(dpsLang2).toBe('notExistKey');

    const dpsStrKeyLang1 = Strings.getDpsLang({ strKey: 'back' });
    expect(dpsStrKeyLang1).toBe('Back');
    const dpsStrKeyLang2 = Strings.getDpsLang({ strKey: 'notExistKey' });
    expect(dpsStrKeyLang2).toBe('notExistKey');

    const dpsArrLang = Strings.getDpsLang(['back', 'notExistKey']);
    expect(dpsArrLang).toEqual({
      back: 'Back',
      notExistKey: 'notExistKey',
    });
  });

  it('formatValue', () => {
    const formatLang = Strings.formatValue('countdown_on', '12 Hours');
    expect(formatLang).toBe('Turn off after 12 Hours');

    const formatMultiLang = Strings.formatValue('countdown_on_multi', '12 Hours', ' 59 Minutes');
    expect(formatMultiLang).toBe('Turn off after 12 Hours 59 Minutes');
  });

  it('getDpLang', () => {
    const dpLang = Strings.getDpLang('mode');
    expect(dpLang).toBe('Mode');

    const dpValueLang = Strings.getDpLang('mode', 'auto');
    expect(dpValueLang).toBe('Auto Mode');
    const dpValueNotExistLang = Strings.getDpLang('mode', 'cold');
    expect(dpValueNotExistLang).toBe('dp_mode_cold');

    const onLang = Strings.getDpLang('switch', true);
    const offLang = Strings.getDpLang('switch', false);
    expect(onLang).toBe('dp_switch_on');
    expect(offLang).toBe('dp_switch_off');
  });

  it('getLang', () => {
    const lang1 = Strings.getLang('notExistLang');
    const lang2 = Strings.getLang('notExistLang', '不存在');
    const lang3 = Strings.getLang('back');
    expect(lang1).toBe('I18N@notExistLang');
    expect(lang2).toBe('不存在');
    expect(lang3).toBe('Back');
  });

  it('getRangeStrings', () => {
    const empty = Strings.getRangeStrings('notExistDpCode');
    const rangeStrings = Strings.getRangeStrings('mode');
    expect(empty).toEqual({});
    expect(rangeStrings).toEqual({
      auto: 'Auto Mode',
      cold: 'dp_mode_cold',
      hot: 'dp_mode_hot',
      wet: 'dp_mode_wet',
      wind: 'dp_mode_wind',
    });
  });

  it('parseCountdown', () => {
    const countdownOnMsg = Strings.parseCountdown(1960, false);
    const countdownOffMsg = Strings.parseCountdown(43200, true);
    expect(countdownOnMsg).toBe('Turn on after 33Minute');
    expect(countdownOffMsg).toBe('Turn off after 12Hour');
  });
});
