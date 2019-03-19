const numberToFixed = (n, c = 2) => {
  let s = `${Math.abs(n)}`;
  s = '0'.repeat(c) + s;
  s = s.slice(-c);
  return n < 0 ? `-${s}` : s;
};

const isNumerical = obj => (Object.prototype.toString.call(obj) === '[object Number]');


module.exports = {
  parseJSON(str) {
    let rst;
    if (str && ({}).toString.call(str) === '[object String]') {
      // 当JSON字符串解析
      try {
        rst = JSON.parse(str);
      } catch (e) {
        // 出错，用eval继续解析JSON字符串
        try {
          // eslint-disable-next-line
          rst = eval(`(${str})`);
        } catch (e2) {
          // 当成普通字符串
          rst = str;
        }
      }
    } else {
      rst = str || {};
    }

    return rst;
  },

  timezone() {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const gt0 = Math.abs(offset);
    let hour = Math.floor(gt0 / 60);
    let minute = gt0 % 60;
    hour = numberToFixed(hour, 2);
    minute = numberToFixed(minute, 2);
    const strHour = `${hour}:${minute}`;
    const zone = offset > 0 ? `-${strHour}` : `+${strHour}`;
    return zone;
  },

  camelize(str) {
    if (isNumerical(str)) {
      return str;
    }
    // eslint-disable-next-line
    str = str.replace(
      /[\-_\s]+(.)?/g,
      (match, chr) => chr ? chr.toUpperCase() : '',
    );
    // Ensure 1st char is always lowercase
    return str.substr(0, 1).toLowerCase() + str.substr(1);
  },

  formatReturnValue = val => {
    if (({}).toString.call(val) === '[object String]') {
      return Utils.JsonUtils.parseJSON(val);
    }

    if (({}).toString.call(val) === '[object Object]') {
      return val;
    }

    return val;
  };
};
