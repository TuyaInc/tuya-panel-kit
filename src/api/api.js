import {
  NativeModules,
  DeviceEventEmitter,
  NativeAppEventEmitter,
  Platform,
  AlertIOS,
} from 'react-native';

import moment from 'moment';
import * as Utils from '../utils';

const EventEmitter = require('events').EventEmitter;

let _TYAppNative;               // App Native 相关接口
let _TYDeviceDevice;             // RN Device 相关接口


// ============================ 一些通用函数 ================================= //
const loop = () => {};

const type = val => Object.prototype.toString.call(val).slice(8, -1).toLowerCase();

const parseJSON = (str) => {
  let rst;
  if (str && type(str) === 'string') {
    // 当JSON字符串解析
    try {
      rst = JSON.parse(str);
    } catch (e) {
      // 出错，用eval继续解析JSON字符串
      try {
        //eslint-disable-next-line
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
};

const formatValue = (val, schema) => {
  if (type(val) === 'string') {
    if (val === 'true') {
      return true;
    } else if (val === 'false') {
      return false;
    }
  } else if (typeof val === 'undefined') {
    switch (schema.type) {
      case 'bool':
        return false;
      case 'value':
        return schema.min;
      default:
        return '';
    }
  }
  return val;
};


// https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
// because Object.keys(new Date()).length === 0;
// we have to do some additional check
const isEmptyObj = obj => Object.keys(obj).length === 0 && obj.constructor === Object;

// ============================ 一些通用函数 ending =========================== //

const formatDevJSON = (json) => {
  let code,
    define,
    dps,
    id,
    property,
    schema,
    val,
    panelConfig;

  dps = json.dps;
  schema = parseJSON(json.schema);
  json.schema = {};
  json.codeIds = {};
  json.idCodes = {};
  json.state = {};

  for (const i in schema) {
    define = schema[i];
    code = define.code;
    id = `${define.id}`;
    property = parseJSON(define.property); // property.type dp值type
    define.dptype = define.type; // dp点type
    define = Object.assign({}, define, property);
    define.id = id;
    json.codeIds[code] = id;
    json.idCodes[id] = code;
    val = formatValue(dps[id], define);
    json.state[code] = val;
    json.schema[code] = define;
    delete define.property;
  }
  delete json.dps;

  if (json.panelConfig) {
    panelConfig = Object.assign({}, json.panelConfig);
    for (const k in panelConfig) {
      json.panelConfig[k] = typeof panelConfig[k] === 'string'
        ? Utils.parseJSON(panelConfig[k]) : panelConfig[k];
    }
  } else {
    json.panelConfig = {};
  }

  return json;
};

const formatUiConfig = devInfo => {
  //eslint-disable-next-line
  let uiConfig = devInfo.uiConfig ? { ...devInfo.uiConfig } : {};

  Object.keys(devInfo.schema).forEach(itKey => {
    const dps = devInfo.schema[itKey];
    const strKey = `dp_${dps.code}`;
    const key = Utils.camelize(strKey);
    uiConfig[key] = {
      key,
      strKey: strKey.toLowerCase(),
      code: dps.code,
      attr: {},
      attri: {},
    };

    switch (dps.type) {
      case 'enum':
        dps.range.forEach(it => {
          const k = `${strKey}_${it}`.toLowerCase();
          uiConfig[key].attr[it] = k;
          uiConfig[key].attri[k] = it;
        });
        break;

      case 'bool':
        const on = `${strKey}_on`.toLowerCase();
        const off = `${strKey}_off`.toLowerCase();
        uiConfig[key].attr = {
          false: off,
          true: on,
        };
        uiConfig[key].attri = {
          [`${strKey}_off`.toLowerCase()]: false,
          [`${strKey}_on`.toLowerCase()]: true,
        };
        break;

      case 'bitmap':
        //eslint-disable-next-line
        for (const v of dps.label) {
          const k = `${strKey}_${v}`.toLowerCase();
          uiConfig[key].attr[v] = k;
          uiConfig[key].attri[k] = v;
        }
        break;

      default:
        break;
    }
  });

  if (!devInfo.panelConfig || !devInfo.panelConfig.bic) return uiConfig;

  const bic = devInfo.panelConfig.bic;
  // let bic = typeof bicN === 'string' ? Utils.parseJSON(bicN) : bicN;

  //eslint-disable-next-line
  for (const i in bic) {
    const key = Utils.camelize(`panel_${bic[i].code}`);
    if (bic[i].selected === true) {
      uiConfig[key] = bic[i].value ? parseJSON(bic[i].value) : true;
    } else {
      uiConfig[key] = false;
    }
  }

  return uiConfig;
};


//eslint-disable-next-line
var TYApi = {};
//eslint-disable-next-line
var App;
//eslint-disable-next-line
var Device = {};
//eslint-disable-next-line
var Event = {};
//eslint-disable-next-line
var Cloud = {};
//eslint-disable-next-line
var AppDeviceEventEmitter = {};


if (NativeModules) {
  _TYAppNative = NativeModules.TYRCTPublicModule || NativeModules.TYRCTPublicManager;
  _TYDeviceDevice = NativeModules.TYRCTDeviceModule || NativeModules.TYRCTPanelManager;


  TYApi = Object.assign({}, TYApi, {
    debounce(func, wait, immediate) {
      let timeout,
        args,
        context,
        timestamp,
        result;

      const later = function () {
        const last = Date.now() - timestamp;

        if (last < wait && last > 0) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
            //eslint-disable-next-line
            if (!timeout) context = args = null;
          }
        }
      };

      const debounce = function () {
        context = this;
        //eslint-disable-next-line
        args = arguments;
        timestamp = Date.now();
        const callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
          //eslint-disable-next-line
          context = args = null;
        }

        return result;
      };

      debounce.cancel = function () {
        clearTimeout(timeout);
        //eslint-disable-next-line
        timeout = context = args = null;
      };
      return debounce;
    },

    throttle(func, wait, options) {
      let context,
        args,
        result;
      let timeout = null;
      let previous = 0;
      //eslint-disable-next-line
      if (!options) options = {};
      const later = function () {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        //eslint-disable-next-line
        if (!timeout) context = args = null;
      };

      const throttle = function () {
        const now = Date.now();
        if (!previous && options.leading === false) previous = now;
        const remaining = wait - (now - previous);
        context = this;
        //eslint-disable-next-line
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
          //eslint-disable-next-line
          if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
      throttle.cancel = function () {
        clearTimeout(timeout);
        previous = 0;
        //eslint-disable-next-line
        timeout = context = args = null;
      };
      return throttle;
    },
  }, _TYAppNative, _TYDeviceDevice);

  AppDeviceEventEmitter = Platform.select({
    ios: () => NativeAppEventEmitter,
    android: () => DeviceEventEmitter,
  })();


  const RNEventEmitter = new EventEmitter();
  RNEventEmitter.setMaxListeners(0);
  // Event = RNEventEmitter;


  const eventsFns = ['on', 'once', 'emit'];
  eventsFns.forEach(it => Event[it] = RNEventEmitter[it].bind(RNEventEmitter));
  Event.fire = RNEventEmitter.emit.bind(RNEventEmitter);
  Event.remove = RNEventEmitter.removeListener.bind(RNEventEmitter);
  Event.off = function(type) {
    if (arguments.length === 1) {
      RNEventEmitter.removeAllListeners(type);
    }

    if (arguments.length === 2) {
      RNEventEmitter.removeListener(type, arguments[1]);
    }
  };


  if (_TYAppNative) {
    App = { ..._TYAppNative };
  }


  if (_TYDeviceDevice) {
    Device = { ..._TYDeviceDevice };
  }


  if (_TYAppNative && _TYDeviceDevice) {
    // 缓存数据
    TYApi.gState = {};
    TYApi.uiConfig = {};
    TYApi.devInfo = {};
    TYApi.mobileInfo = _TYAppNative.mobileInfo;


    // =====================================================================
    // ============================== Device  ==============================
    // =====================================================================
    Device.formatDps = dps => {
      if (TYApi.devInfo && TYApi.devInfo.idCodes) {
        return Object.keys(dps).reduce((state, dp) => {
          const code = TYApi.devInfo.idCodes[dp];
          return {
            ...state,
            [code]: dps[dp],
          };
        }, {});
      }

      return {};
    };


    Device.setState = (dp, val) => {
      //eslint-disable-next-line
      let state = {};
      // 批量设置
      if (type(dp) === 'object') {
        //eslint-disable-next-line
        for (let p in dp) {
          if (Device.checkDpExist(p)) {
            if (/^\d+$/.test(p)) {
              p = Device.getDpCodeById(p);
            }
            state[p] = dp[p];
          } else {
            console.log('1-----参数错误');
            return;
          }
        }

        if (!isEmptyObj(state)) {
          TYApi.devInfo.state = {
            ...TYApi.devInfo.state,
            ...state,
          };

          for (const p in state) {
            Event.emit(p, state);
          }
        }
      } else if (Device.checkDpExist(dp)) {
        if (/^\d+$/.test(dp)) {
          dp = Device.getDpCodeById(dp);
        }
        state[dp] = val;

        if (!isEmptyObj(state)) {
          TYApi.devInfo.state = {
            ...a.devInfo.state,
            ...state,
          };
          Event.emit(dp, state);
        }
      } else {
        console.log('2-----参数错误');
      }
      return state;
    };

    Device.checkDpExist = (idOrCode) => {
      return !!Device.getDpIdByCode(idOrCode) || !!Device.getDpCodeById(idOrCode);
    };

    Device.getDpIdByCode = (code) => {
      if (TYApi.devInfo) {
        const codeIds = TYApi.devInfo.codeIds;
        return codeIds[code];
      }
      console.log('-----未初始化,getDpIdByCode');
    };

    Device.getDpCodeById = (id) => {
      if (TYApi.devInfo) {
        const idCodes = TYApi.devInfo.idCodes;
        return idCodes[id];
      }
      console.log('-----未初始化,getDpCodeById');
    };

    Device.setDevState = (state) => {
      TYApi.devInfo = { ...TYApi.devInfo, ...state };
      return TYApi.devInfo;
    };

    // 获取设备信息
    Device.getDevInfo = () => new Promise((resolve) => {
      if (TYApi.devInfo) {
        resolve(TYApi.devInfo);
      } else {
        Device.initDevice().then((d) => {
          resolve(d);
        });
      }
    });

    Device.initDevice = () => Promise.all([
      new Promise((resolve) => Device.getDevInfo({}, d => resolve(d))),
      Device.getNetworkType(),
    ]).then((d) => {
      let networkState = d[1].type;
      if (typeof networkState === 'undefined') networkState = d[1];
      Device.setDevInfo({ networkType: networkState, ...d[0] });
      return TYApi.devInfo;
    });


    Device.setDevInfo = (d) => {
      if (!d.devId) {
        TYApi.uiConfig = {};
        TYApi.devInfo = {};
      } else {
        d.deviceOnline = d.isOnline;
        delete d.isOnline;
        const devInfo = formatDevJSON({ appOnline: d.networkType !== 'NONE', ...d });

        // @todo 需要测试万能面板是否正常
        // if (Object.keys(TYNative.uiConfig).length === 0) {
        TYApi.uiConfig = formatUiConfig(devInfo);
        // } else {
          // devInfo.schema = TYNative.devInfo.schema;
          // devInfo.codeIds = TYNative.devInfo.codeIds;
          // devInfo.idCodes = TYNative.devInfo.idCodes;
          // devInfo.state = TYNative.devInfo.state;
        // }

        TYApi.devInfo = devInfo;
        TYApi.devInfo.isVDevice = d.devId && d.devId.indexOf('vdev') === 0;
      }
    };

    // 获取客户端网络状态
    // {type: "WIFI|GPRS|NONE"}
    Device.getNetworkType = () => new Promise((resolve, reject) => {
      _TYDeviceDevice.getNetworkType((t) => {
        resolve(t);
      });
    });

    // 获取设备信息
    Device.getDevInfo = () => new Promise((resolve) => {
      if (TYApi.devInfo) {
        resolve(TYApi.devInfo);
      } else {
        Device.initDevice().then(d => {
          resolve(d);
        });
      }
    });

    Device.getDpIdByCode = (code) => {
      if (TYApi.devInfo) {
        const codeIds = TYApi.devInfo.codeIds;
        return codeIds[code];
      }
      console.log('-----未初始化,getDpIdByCode');
    };

    Device.getDpCodeById = (id) => {
      if (TYApi.devInfo) {
        const idCodes = TYApi.devInfo.idCodes;
        return idCodes[id];
      }
      console.log('-----未初始化,getDpCodeById');
    };

    Device.getDpCodes = () => {
      if (TYApi.devInfo) {
        const idCodes = TYApi.devInfo.codeIds;
        return Object.keys(idCodes);
      }
      console.log('-----未初始化,getDpCodes');
      return [];
    };

    Device.getDpSchema = (code) => {
      if (TYApi.devInfo) {
        if (code) {
          return TYApi.devInfo.schema[code];
        }
        return TYApi.devInfo.schema;
      }
      console.log('-----未初始化,getDpSchema');
    };

    Device.getState = (dp) => {
      if (isEmptyObj(TYApi.devInfo)) {
        console.log('-----未初始化,devInfo getState');
        return;
      }
      if (!dp) {
        if (typeof TYApi.devInfo.state === 'undefined') {
          TYApi.devInfo.state = {};
        }
        return TYApi.devInfo.state;
      }
      if (TYNative.checkDpExist(dp)) {
        if (/^\d+$/.test(dp)) {
          dp = Device.getDpCodeById(dp);
        }
        return TYApi.devInfo.state[dp];
      }
      console.log('3-----参数错误');
    };

    Device.setGState = (dp, val) => {
      let state = {};
      // 批量设置
      if (type(dp) === 'object') {
        state = dp;
      } else {
        state[dp] = val;
      }
      TYApi.gState = { ...TYApi.gState, ...state };
      return state;
    };

    Device.getGState = (dp) => {
      if (!dp) {
        return TYApi.gState;
      }
      return TYApi.gState[dp];
    };

    Device.checkDpExist = (idOrCode) => {
      return !!Device.getDpIdByCode(idOrCode) || !!Device.getDpCodeById(idOrCode);
    };

    Device.checkDpValueType = (idOrCode, val) => {
      if (TYApi.devInfo) {
        if (Device.checkDpExist(idOrCode)) {
          if (/^\d+$/.test(idOrCode)) {
            idOrCode = Device.getDpCodeById(idOrCode);
          }
          const schema = Device.getDpSchema();
          return val === schema[idOrCode].schemaType;
        }
      } else {
        console.log('-----未初始化,checkDpValueType');
      }
    };

    Device.getDpDataFromDevice = (idOrCode) => {
      console.log('-----主动查询DP', idOrCode);
      return new Promise((resolve, reject) => {
        let err;
        let dpId = `${idOrCode}`;
        if (!Device.checkDpExist(dpId)) {
          err = { ret: 'param error' };
          // reject(err);
          Event.emit('message', err);
          return;
        }

        if (!/^\d+$/.test(dpId)) {
          dpId = Device.getDpIdByCode(idOrCode);
        }

        // let TIMEOUT_ID = setTimeout(function() {
        //   err = {
        //     ret: 'mqtt timeout'
        //   };
        //   reject(err);
        //   TYNative.emit('message', err);
        // }, TIMEOUT);

        // TYNative.once(`_dpDataChange:${idOrCode}`, (d) => {
        //   clearTimeout(TIMEOUT_ID);
        //   resolve(d);
        // });

        _TYDeviceDevice.getDpDataFromDevice({
          dpId,
        }, loop, (d) => {
          // clearTimeout(TIMEOUT_ID);
          // reject(d);
          Event.emit('message', d);
        });
      });
    };

    // 到硬件查询dp点
    // 设置dp点
    Device.putDpData = (data) => new Promise((resolve, reject) => {
      const { option, ...params } = data;
      let isEmpty = true;
      let err;
      const cmds = {};
      // let promiseGroup = [];
      const codes = [];
      // let clearSendState = (dbcodes) => {
      //   dbcodes.forEach((code) => {
      //     TYNative.devInfo.state[`sending_${code}`] = false;
      //   });
      // };

      for (let dpId in params) {
        // 验证dp点是否合法
        if (Device.checkDpExist(dpId)) {
          const dpCode = dpId;
          // 如果不是id值，整型
          if (!/^\d+$/.test(dpId)) {
            dpId = Device.getDpIdByCode(dpCode);
          }
          cmds[dpId] = params[dpCode];
          isEmpty = false;

          // // 给每个dp设置promise
          // promiseGroup.push(new Promise((_resolve) => {
          //   TYNative.once(`_dpDataChange:${dpCode}`, (d) => {
          //     _resolve(d);
          //   });
          // }));

          codes.push(dpCode);

          // // 设置当前dp下发状态
          // TYNative.devInfo.state[`sending_${dpCode}`] = true;
        }
      }

      if (isEmpty) {
        err = { ret: 'param error' };
        reject(err);
        Event.emit('message', err);
        return;
      }

      // let TIMEOUT_ID = setTimeout(function() {
      //   console.log('-----下发DP无响应', data);
      //   err = {ret: 'mqtt timeout'};
      //   reject(err);
      //   TYNative.emit('message', err);
      //   clearSendState(codes);
      // }, TIMEOUT);

      // Promise.all(promiseGroup).then((d) => {
      //   let state = Object.assign.apply(null, d);
      //   // 所有dp点都成功返回
      //   clearTimeout(TIMEOUT_ID);
      //   resolve(state);
      //   clearSendState(codes);
      //   console.log('-----返回结果', d);
      //   // 不确定是否正确
      // });

      console.log('-----数据下发', data, cmds);
      _TYDeviceDevice.putDpData({
        command: cmds,  // {"1": true, "2": false}
        option: typeof option === 'undefined' ? 3 : option,  // 0，静音； 1，震动；2,声音； 3，震动声音
      // }, () => resolve(), (d) => {
      }, () => resolve({ success: true }), (d) => {
        console.log('-----返回结果错误?', d);
        // clearTimeout(TIMEOUT_ID);
        reject(d);
        Event.emit('message', d);
      });
    });

    // 局域网
    Device.putLocalDpData = (data) => new Promise((resolve, reject) => {
      const { option, ...params } = data;
      let isEmpty = true;
      let err;
      const cmds = {};
      // let promiseGroup = [];
      const codes = [];
      // let clearSendState = (dbcodes) => {
      //   dbcodes.forEach((code) => {
      //     TYNative.devInfo.state[`sending_${code}`] = false;
      //   });
      // };

      for (let dpId in params) {
        // 验证dp点是否合法
        if (Device.checkDpExist(dpId)) {
          const dpCode = dpId;
          // 如果不是id值，整型
          if (!/^\d+$/.test(dpId)) {
            dpId = Device.getDpIdByCode(dpCode);
          }
          cmds[dpId] = params[dpCode];
          isEmpty = false;

          // // 给每个dp设置promise
          // promiseGroup.push(new Promise((_resolve) => {
          //   TYNative.once(`_dpDataChange:${dpCode}`, (d) => {
          //     _resolve(d);
          //   });
          // }));

          codes.push(dpCode);

          // // 设置当前dp下发状态
          // TYNative.devInfo.state[`sending_${dpCode}`] = true;
        }
      }

      if (isEmpty) {
        err = { ret: 'param error' };
        reject(err);
        Event.emit('message', err);
        return;
      }

      // let TIMEOUT_ID = setTimeout(function() {
      //   console.log('-----下发DP无响应', data);
      //   err = {ret: 'mqtt timeout'};
      //   reject(err);
      //   TYNative.emit('message', err);
      //   clearSendState(codes);
      // }, TIMEOUT);

      // Promise.all(promiseGroup).then((d) => {
      //   let state = Object.assign.apply(null, d);
      //   // 所有dp点都成功返回
      //   clearTimeout(TIMEOUT_ID);
      //   resolve(state);
      //   clearSendState(codes);
      //   console.log('-----返回结果', d);
      //   // 不确定是否正确
      // });

      console.log('-----数据下发', data, cmds);
      _TYDeviceDevice.putLocalDpData({
        command: cmds,  // {"1": true, "2": false}
        option: typeof option === 'undefined' ? 3 : option,  // 0，静音； 1，震动；2,声音； 3，震动声音
      }, () => resolve(), (d) => {
        console.log('-----返回结果错误?', d);
        // clearTimeout(TIMEOUT_ID);
        reject(d);
        Event.emit('message', d);
      });
    });

    Device.verSupported = (version) => {
      if (TYApi.mobileInfo && TYApi.mobileInfo.appRnVersion) {
        return TYApi.mobileInfo.appRnVersion >= version;
      }

      return false;
    };

    /**
     * 是否是mesh wifi设备
     * 返回值: undefined | bool
     * 当 undefined，app不支持该接口
     */
    Device.isMeshWifiDevice = () => {
      if (!TYApi.devInfo) {
        throw new Error('Device uninitialized');
      }
      const { pcc } = TYApi.devInfo;
      if (pcc !== undefined) {
        return pcc === '0108';
      }
      return pcc;
    };

    /**
     * 是否是组网设备
     * 返回值: undefined | bool
     * 当 undefined，app不支持该接口
     */
    Device.isMeshDevice = () => {
      if (!TYApi.devInfo) {
        throw new Error('Device uninitialized');
      }
      const { nodeId } = TYApi.devInfo;
      if (nodeId !== undefined) {
        return nodeId.length > 0;
      }
      return nodeId;
    };


    // =====================================================================
    // ============================= Device end ============================
    // =====================================================================


    // =====================================================================
    // ======================= AppDeviceEventEmitter =======================
    // =====================================================================
    // 设备dp状态变更通知
    AppDeviceEventEmitter.addListener('dpDataChange', (d) => {
      if (!isEmptyObj(TYApi.devInfo)) {
        const newState = Device.formatDps(d);
        if (!isEmptyObj(newState)) {
          // newState 是空对象的话，就不上报数据
          console.log('-----数据上报', newState, d);
          Device.setState(newState);
          Event.emit('dpDataChange', newState);
        }
      } else {
        TYApi.__unInitializeDps = d;
      }
    });


    // 设备信息变更通知,只通知,无数据
    AppDeviceEventEmitter.addListener('deviceChanged', () => {
      Device.initDevice().then(d => Event.emit('deviceChanged', d));
    });


    // 蓝牙状态变更通知
    AppDeviceEventEmitter.addListener('bluetoothChange', (d) => {
      Event.emit('bluetoothChange', d.state);
    });


    // AppDeviceEventEmitter.addListener('panelViewChange', () => {
    //   Device.initDevice().then(d => Event.emit('deviceChanged', d));
    // });


    // AppDeviceEventEmitter.addListener('deallocDeviceViewChange', () => {
    //   Event.emit('deviceChanged', {});
    // });


    // 设备网络状态变更通知
    AppDeviceEventEmitter.addListener('deviceStateChange', (d) => {
      if (typeof d === 'undefined' || typeof d.state === 'undefined') return;
      Event.emit('deviceOnline', { online: d.state });
    });

    // app网络状态变更通知
    AppDeviceEventEmitter.addListener('networkStateChange', (d) => {
      if (typeof d === 'undefined' || typeof d.state === 'undefined') return;
      Event.emit('appOnline', { online: d.state });
    });

    // 设备信息变更通知,只通知,无数据
    AppDeviceEventEmitter.addListener('linkageTimeUpdate', () => {
      Event.emit('linkageTimeUpdate', {});
    });

    // app 是否为局域网在线通知
    AppDeviceEventEmitter.addListener('deviceLocalStateChange', (d) => {
      if (typeof d === 'undefined' || typeof d.state === 'undefined') return;
      Event.emit('deviceLocalStateChange', { state: d.state });
    });
    // =====================================================================
    // ===================== AppDeviceEventEmitter end =====================
    // =====================================================================


    // =====================================================================
    // ============================ App ====================================
    // =====================================================================
    // 获取ssid
    // 此方法 ios native 有的，但是 Android 没有发现有，不知道用了什么黑魔法
    App.getWiFiSsid = () => new Promise(resolve => {
      _TYAppNative.getWiFiSsid(t => {
        resolve(t);
      });
    });

    App.is24Hour = () => new Promise((resolve, reject) => {
      _TYAppNative.is24Hour((is24) => {
        resolve(is24);
      });
    });

    // 获取客户端信息
    App.getMobileInfo = () => new Promise((resolve, reject) => {
      if (TYApi.mobileInfo) {
        reject();
        return;
      }
      _TYAppNative.getMobileInfo((d) => {
        resolve(d);
      });
    }).then(
      (d) => {
        TYApi.mobileInfo = d;
        return TYApi.mobileInfo;
      },
      () => TYApi.mobileInfo,
    );

    // 展示loading，有问题
    App.showLoading = (title) => {
      _TYAppNative.showLoading({
        title: title || '',
      });
    };

    App.hideLoading = () => {
      _TYAppNative.hideLoading();
    };

    App.showPromptDialog = (
      confirmText, cancelText, title, message, defaultValue, onConfirmed, onCanceled,
    ) => {
      if (Platform.OS === 'ios') {
        try {
          AlertIOS.prompt(title, message,
            [
              { text: confirmText, onPress: inputText => onConfirmed(inputText), style: 'default' },
              { text: cancelText, onPress: () => onCanceled(), style: 'cancel' },
            ],
            'plain-text',
            defaultValue,
          );
        } catch (e) {}
      } else {
        _TYAppNative.showPromptDialog(title, message, defaultValue, onConfirmed, onCanceled);
      }
    };

    App.bottomListDialog = (itemList, selected, onConfirmed) => {
      _TYAppNative.bottomListDialog(itemList, selected, onConfirmed);
    };

    App.showEditDialog = (title, editString, onConfirmed, onCanceled) => {
      _TYAppNative.showEditDialog(title, editString, onConfirmed, onCanceled);
    };

    App.simpleConfirmDialog = (title, msg, onConfirmed, onCanceled) => {
      _TYAppNative.simpleConfirmDialog(title, msg, onConfirmed, onCanceled);
    };

    App.simpleTipDialog = (msg, onConfirmed) => {
      _TYAppNative.simpleTipDialog(msg, onConfirmed);
    };

    App.jumpTo = (url) => {
      _TYAppNative.jumpTo(url || '');
    };

    App.back = () => {
      _TYAppNative.back();
    };

    // 分享。rn 0.38.0 智能台灯定制
    App.shareMsg = (map) => {
      _TYAppNative.shareMsg(map);
    };

    App.disablePopGesture = () => {
      if (Platform.OS === 'ios') {
        _TYDeviceDevice.disablePopGesture();
      }
    };

    App.enablePopGesture = function() {
      if (Platform.OS === 'ios') {
        _TYDeviceDevice.enablePopGesture();
      }
    };

    App.showDeviceMenu = function() {
      return _TYAppNative.showDeviceMenu();
    };

    App.apiRequest = function(postData) {
      return new Promise((resolve, reject) => {
        _TYAppNative.apiRequest(postData,
          (d) => {
            const data = typeof d === 'object' ? d : JSON.parse(d);
            resolve({ ...data });
          },
          reject,
        );
      });
    };

    /**
     * 获取蓝牙状态
     * 返回值: bool类型
     */
    App.getBleManagerState = () => {
      return new Promise((resolve, reject) => {
        (_TYAppNative.getBleManagerState || function() { reject(null); })((d) => {
          if (d) {
            return resolve(d.state);
          }
          reject(null);
        });
      });
    };

    /**
     * wifi网络状态监测
     */
    App.gotoDeviceWifiNetworkMonitor = _TYAppNative.gotoDeviceWifiNetworkMonitor || function() {};

    /**
     * 申请蓝牙权限
     */
    App.gotoBlePermissions = _TYAppNative.gotoBlePermissions || function() {};

    /**
     * 删除设备
     */
    App.deleteDeviceInfo = () => {
      return new Promise((resolve, reject) => {
        (_TYAppNative.deleteDeviceInfo || function() { reject(); })(resolve, reject);
      });
    };
    // =====================================================================
    // ============================ App end ================================
    // =====================================================================
  }
}



/* ********************************************************** */
// 本地模拟数据上报,主要用于体验设备
// TYApi.panelInfo = {};
// TYApi.panelInfo.isVDevice = true;
if (TYApi.panelInfo && TYApi.panelInfo.isVDevice) {
  Device.putDpData = (data) => {
    return new Promise((resolve, reject) => {
      if (!TYApi.devInfo) {
        reject();
        return;
      }
      const state = {};
      for (const idOrCode in data) {
        if (Device.checkDpExist(idOrCode)) {
          let dpCode = idOrCode;
          if (/^\d+$/.test(dpCode)) {
            dpCode = Device.getDpCodeById(idOrCode);
          }
          state[dpCode] = data[idOrCode];
        }
      }
      console.log('-----putDpData-mock', state);
      Device.setState(state);
      Event.emit('dpDataChange', state);
      resolve(state);
    });
  };

  Device.getDpDataFromDevice = (idOrCode) => {
    return new Promise((resolve, reject) => {
      if (!TYApi.devInfo) {
        reject();
        return;
      }
      const state = {};
      if (Device.checkDpExist(idOrCode)) {
        let dpCode = idOrCode;
        if (/^\d+$/.test(idOrCode)) {
          dpCode = Device.getDpCodeById(idOrCode);
        }
        state[dpCode] = Device.getState(dpCode);
      }
      console.log('-----getDpDataFromDevice-mock', state);
      Device.setState(state);
      Event.emit('dpDataChange', state);
      resolve(state);
    });
  };

  Device.goToAlarmListActivity = () => {
    console.log('-----goToAlarmListActivity-mock');
    Event.emit('message', 'expDevice');
  };

  Device.gotoDpAlarm = () => {
    console.log('-----gotoDpAlarm-mock');
    Event.emit('message', 'expDevice');
  };

  Device.setDevProperty = (key, value, callback) => {
    console.log('-----setDevProperty-mock');
    callback();
  };

  Device.getDevProperty = (callback) => {
    console.log('-----getDevProperty-mock');
    callback({});
  };
}
/* ********************************************************** */


//eslint-disable-next-line
TYApi = {
  ...TYApi,
  ...App,               // App Native 相关
  ...Device,            // RN Device 相关
  ...Event,             // 事件相关
  DeviceEventEmitter: AppDeviceEventEmitter,
  // ...Data,              // 数据
  // Data 不能直接用解构，重新生成新数据，Data 缓存失效
};

// NavigatorLayout里特殊处理设置....
TYApi.Navigator = {};
TYApi.applyNavigator = function(navigator) {
  TYApi.Navigator = navigator;
};

export default TYApi;
