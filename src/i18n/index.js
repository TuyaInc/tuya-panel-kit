import TYSdk from '../api';

const TYNative = TYSdk.native;
const TYMobile = TYSdk.mobile;
const TYDevice = TYSdk.device;

export default class I18N {
  constructor(props) {
    if (__DEV__) {
      // console.info('-=-=-=-=-TYNative.lang', TYNative.lang, TYNative.mobileInfo);
    }

    this.strings = this.mergeLanguage(props, TYNative.lang);
    this.defaultLang = this.strings.en ? 'en' : Object.keys(this.strings)[0];
    this.setLanguage(this.defaultLang);
    if (typeof TYNative.mobileInfo === 'undefined') {
      TYMobile.getMobileInfo().then(d => {
        this.setLanguage(d.lang);
      });
    } else {
      this.setLanguage(TYNative.mobileInfo.lang);
    }
  }

  applyStrings(strings) {
    // console.log('TYNative.lang', TYNative.lang);
    const strLang = this.mergeLanguage(strings, TYNative.lang);
    this.strings = this.mergeLanguage(this.strings, strLang);
    this.buildLanguage(this.language);
  }

  forceUpdateNetworkLang(productId) {
    return TYSdk.apiRequest('tuya.m.i18n.get', {
      productId,
      moduleName: 'h5',
      endId: 2,
      osId: 0,
    }).then(data => {
      if (__DEV__) {
        console.info('tuya.m.i18n.get', data);
      }
      if (data) {
        this.strings = this.mergeLanguage(this.strings, data);
        this.buildLanguage(this.language);
      }
    });
  }

  mergeLanguage(L1, L2) {
    if (typeof L1 === 'undefined' && typeof L2 === 'undefined') return {};
    if (typeof L1 === 'undefined') return L2;
    if (typeof L2 === 'undefined') return L1;

    const L0 = Object.assign({}, L1);
    for (const k in L2) {
      if (typeof L0[k] !== 'undefined') {
        Object.assign(L0[k], L2[k]);
      } else {
        L0[k] = Object.assign({}, L2[k]);
      }
    }
    return L0;
  }

  setLanguage(language) {
    const bestLanguage = this._getBestMatchingLanguage(language, this.strings);
    if (bestLanguage === this.language) return;
    this.language = bestLanguage;
    /**
     * ios 的中文简体固定为 zh-Hans，
     * 但安卓的中文简体可能有一大堆排列组件 = =，如 zh_CN、zh_cn、zh_Hans_CH、zh_hans_cn 等等;
     */
    const isZhRegex = /^zh-hans$|^zh_hans$|^zh_cn$|^zh-cn$|^zh_hans_\w+|^zh-hans-\w+/;
    /**
     * 如果匹配到位中文简体地区，
     * 则将中文 zh 相关的 values 都写入到 this.strings 下，保证兜底本地 zh 相关的能取到，
     * 再将当前地区 key 相关的 values 都写入到 this.strings 下，优先级最高；
     */
    if (typeof language === 'string' && isZhRegex.test(language.toLowerCase())) {
      this.buildLanguage('zh');
      this.buildLanguage(language);
    } else {
      this.buildLanguage(this.language);
    }
  }

  buildLanguage(language) {
    if (this.strings[language]) {
      const localizedStrings = this.strings[language];
      for (const key in localizedStrings) {
        if (localizedStrings.hasOwnProperty(key)) {
          this[key] = localizedStrings[key];
        }
      }
    }
  }

  _getBestMatchingLanguage(language, props) {
    if (props[language]) return language;
    const idx = language.lastIndexOf('-');
    if (idx >= 0) {
      const lang = language.substring(0, idx);
      return this._getBestMatchingLanguage(lang, props);
    }
    const underlineIdx = language.lastIndexOf('_');
    if (underlineIdx >= 0) {
      const lang = language.substring(0, underlineIdx);
      return this._getBestMatchingLanguage(lang, props);
    }
    return this.defaultLang;
  }

  // Format the passed string replacing the numbered placeholders
  // i.e. I'd like some {0} and {1}, or just {0}
  // Use example:
  //  strings.formatString(strings.question, strings.bread, strings.butter)
  formatString(str, ...values) {
    let res = str;
    for (let i = 0; i < values.length; i++) {
      res = this._replaceAll(`{${i}}`, values[i], res);
    }
    return res;
  }

  formatValue(key, ...values) {
    let res = this[key];
    for (let i = 0; i < values.length; i++) {
      res = this._replaceAll(`{${i}}`, values[i], res);
    }
    return res;
  }

  _replaceAll(find, replace, str) {
    find = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
    if (!str) return '';
    return str.replace(new RegExp(find, 'g'), replace);
  }

  getDpLang(code, value) {
    let key;
    if (typeof value === 'undefined') {
      key = `dp_${code}`.toLowerCase();
    } else if (typeof value === 'boolean') {
      const valStr = value ? 'on' : 'off';
      key = `dp_${code}_${valStr}`.toLowerCase();
    } else {
      key = `dp_${code}_${value}`.toLowerCase();
    }
    return typeof this[key] !== 'undefined' ? this[key] : key;
  }

  getDpName(code, defaultName) {
    const key = `dp_${code}`.toLowerCase();
    return typeof this[key] !== 'undefined' ? this[key] : defaultName || key;
  }

  getDpsLang(key) {
    let strs = {};
    if (typeof key === 'object') {
      if (typeof key.strKey === 'string') {
        strs = typeof this[key.strKey] !== 'undefined' ? this[key.strKey] : key.strKey;
      } else {
        for (const i in key) {
          strs[key[i]] = typeof this[key[i]] !== 'undefined' ? this[key[i]] : key[i];
        }
      }
    } else {
      strs = typeof this[key] !== 'undefined' ? this[key] : key;
    }
    return strs;
  }

  getLang(key, defaultString) {
    return typeof this[key] !== 'undefined'
      ? this[key]
      : typeof defaultString !== 'undefined'
        ? defaultString
        : `I18N@${key}`;
  }

  /**
   *  获取picker标题
   * @param {*} dpCode
   */
  getRangeStrings(dpCode) {
    const result = {};
    const schema = TYDevice.getDpSchema(dpCode);
    if (typeof schema === 'undefined') return result;
    const lists = schema.range;
    for (const v of lists) {
      const key = `dp_${dpCode}_${v}`.toLowerCase();
      result[v] = typeof this[key] !== 'undefined' ? this[key] : key;
    }
    return result;
  }

  /**
   *  开关倒计时转换为文案 time => 设备将在xxx后 关闭／开启
   *  精确到分钟
   * @param {*} t 倒计时剩余(秒)
   * @param {*} power 设备当前的开关状态 (如果当前设备为开启状态， 则倒计时显示为关闭)
   */
  parseCountdown(t, power) {
    const h = parseFloat(t / 3600);
    const m = parseFloat(t / 60 - parseInt(h, 10) * 60);

    const time = h >= 1.0 ? `${Math.round(h)}${this.t_hour}` : `${Math.round(m)}${this.t_minute}`;

    return this.formatString(this[`countdown_${power ? 'on' : 'off'}`], time);
  }

  get dps() {
    return this;
  }
}
