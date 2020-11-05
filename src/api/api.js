/* eslint-disable */
import {
  NativeModules,
  DeviceEventEmitter,
  NativeAppEventEmitter,
  Platform,
  AlertIOS,
} from 'react-native';
import { EventEmitter } from 'events';

const INTERNAL_EVENT_TYPE = [
  'error',
  'newListener',
  'removeListener',
  'dpDataChange',
  'deviceChanged',
  'bluetoothChange',
  'deviceStateChange',
  'networkStateChange',
  'linkageTimeUpdate',
  'deviceLocalStateChange',
];

const sucStyle = 'background: green; color: #fff;';
const errStyle = 'background: red; color: #fff;';

let _TYAppNative; // App Native 相关接口
let _TYDeviceDevice; // RN Device 相关接口

// ============================ 一些通用函数 ================================= //
const loop = () => {};

const type = val =>
  Object.prototype.toString
    .call(val)
    .slice(8, -1)
    .toLowerCase();

export const parseJson = str => {
  let result;
  if (str && type(str) === 'string') {
    // as jsonstring
    try {
      result = JSON.parse(str);
    } catch (parseError) {
      // error! use eval
      try {
        result = eval(`(${str})`);
      } catch (evalError) {
        // normal string
        result = str;
      }
    }
  } else {
    result = typeof str === 'undefined' ? {} : str;
  }
  return result;
};

const formatValue = (val, schema) => {
  if (type(val) === 'string') {
    if (val === 'true') {
      return true;
    } else if (val === 'false') {
      return false;
    }
  } else if (type(val) === 'undefined') {
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

const isNumerical = obj => Object.prototype.toString.call(obj) === '[object Number]';

const camelize = str => {
  if (isNumerical(str)) {
    return `${str}`;
  }
  str = str.replace(/[\-_\s]+(.)?/g, (match, chr) => (chr ? chr.toUpperCase() : ''));
  // Ensure 1st char is always lowercase
  return str.substr(0, 1).toLowerCase() + str.substr(1);
};

const getBitValue = (num, index) => {
  return (num & (1 << index)) >> index;
};

// https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
// because Object.keys(new Date()).length === 0;
// we have to do some additional check
const isEmptyObj = obj => Object.keys(obj).length === 0 && obj.constructor === Object;

// ============================ 一些通用函数 ending =========================== //

const formatDevJSON = json => {
  let code, define, id, property, val, panelConfig;

  const resultJson = json;
  const { dps } = resultJson;
  const schema = parseJson(resultJson.schema);
  resultJson.schema = {};
  resultJson.codeIds = {};
  resultJson.idCodes = {};
  resultJson.state = {};

  for (const i in schema) {
    define = schema[i];
    code = define.code;
    id = `${define.id}`;
    property = parseJson(define.property); // property.type dp值type
    define.dptype = define.type; // dp点type
    define = Object.assign({}, define, property);
    define.id = id;
    resultJson.codeIds[code] = id;
    resultJson.idCodes[id] = code;
    val = formatValue(dps[id], define);
    resultJson.state[code] = val;
    resultJson.schema[code] = define;
    delete define.property;
  }
  // delete json.dps;

  if (resultJson.panelConfig) {
    panelConfig = Object.assign({}, resultJson.panelConfig);
    for (const k in panelConfig) {
      resultJson.panelConfig[k] =
        typeof panelConfig[k] === 'string' ? parseJson(panelConfig[k]) : panelConfig[k];
    }
  } else {
    resultJson.panelConfig = {};
  }

  return resultJson;
};

const formatUiConfig = devInfo => {
  // eslint-disable-next-line
  let uiConfig = devInfo.uiConfig ? { ...devInfo.uiConfig } : {};

  Object.keys(devInfo.schema).forEach(itKey => {
    const dps = devInfo.schema[itKey];
    const strKey = `dp_${dps.code}`;
    const key = camelize(strKey);
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
        // eslint-disable-next-line
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

  const { bic, fun } = devInfo.panelConfig;
  // let bic = typeof bicN === 'string' ? Utils.parseJSON(bicN) : bicN;

  // eslint-disable-next-line
  if (bic) {
    for (const i in bic) {
      const key = camelize(`panel_${bic[i].code}`);
      if (bic[i].selected === true) {
        uiConfig[key] = bic[i].value ? parseJSON(bic[i].value) : true;
      } else {
        uiConfig[key] = false;
      }
    }
  }

  if (fun) {
    for (const i in fun) {
      const key = camelize(`panel_fun_${i}`);
      uiConfig[key] = fun[i];
    }
  }

  return uiConfig;
};

let AppDeviceEventEmitter = {};
const Event = {};
const Device = {};
const App = {};
let Native = {};
let apiRequest;

const TYDeviceData = {};
let TYMobileData = {};

if (NativeModules) {
  _TYAppNative = NativeModules.TYRCTPublicModule || NativeModules.TYRCTPublicManager;
  _TYDeviceDevice = NativeModules.TYRCTDeviceModule || NativeModules.TYRCTPanelManager;

  AppDeviceEventEmitter = Platform.select({
    ios: () => NativeAppEventEmitter,
    android: () => DeviceEventEmitter,
  })();
  // events
  const RNEventEmitter = new EventEmitter();
  RNEventEmitter.setMaxListeners(0);
  // Event = RNEventEmitter;
  const eventsType = ['on', 'once', 'emit'];
  eventsType.forEach(it => {
    Event[it] = RNEventEmitter[it].bind(RNEventEmitter);
  });
  Event.fire = RNEventEmitter.emit.bind(RNEventEmitter);
  Event.remove = RNEventEmitter.removeListener.bind(RNEventEmitter);
  /* istanbul ignore next */
  Event.off = function(eventType) {
    if (arguments.length === 1) {
      RNEventEmitter.removeAllListeners(eventType);
    }
    if (arguments.length === 2) {
      RNEventEmitter.removeListener(eventType, arguments[1]);
    }
  };

  if (_TYAppNative && _TYDeviceDevice) {
    // 缓存数据
    TYDeviceData.gState = {};
    TYDeviceData.uiConfig = {};
    Native = {
      ..._TYAppNative,
      ..._TYDeviceDevice,
    };
    TYDeviceData.devInfo = {};
    App.mobileInfo = _TYAppNative.mobileInfo;

    // =====================================================================
    // ============================== Device  ==============================
    // =====================================================================
    Device.formatDps = dps => {
      if (TYDeviceData.devInfo && TYDeviceData.devInfo.idCodes) {
        return Object.keys(dps).reduce((state, dp) => {
          const code = TYDeviceData.devInfo.idCodes[dp];
          return {
            ...state,
            [code]: dps[dp],
          };
        }, {});
      }
      return {};
    };

    Device.setState = (dp, val) => {
      const state = {};
      // 批量设置
      if (type(dp) === 'object') {
        for (let p in dp) {
          if (Device.checkDpExist(p)) {
            p = /^\d+$/.test(p) ? Device.getDpCodeById(p) : p;
            state[p] = dp[p];
          } else {
            console.log('1-----参数错误');
            return;
          }
        }

        if (!isEmptyObj(state)) {
          TYDeviceData.devInfo.state = {
            ...TYDeviceData.devInfo.state,
            ...state,
          };

          for (const p in state) {
            if (INTERNAL_EVENT_TYPE.indexOf(p) !== -1) {
              console.warn(`DP Code can not be one of [${INTERNAL_EVENT_TYPE}]`);
              continue;
            }
            if (Object.prototype.hasOwnProperty.call(state, p)) {
              Event.emit(p, state);
            }
          }
        }
      } else if (Device.checkDpExist(dp)) {
        const dpCode = /^\d+$/.test(dp) ? Device.getDpCodeById(dp) : dp;
        state[dpCode] = val;
        if (!isEmptyObj(state)) {
          TYDeviceData.devInfo.state = {
            ...TYDeviceData.devInfo.state,
            ...state,
          };
          Event.emit(dpCode, state);
        }
      } else {
        console.log('2-----参数错误');
      }
      return state;
    };

    Device.checkDpExist = idOrCode =>
      Device.getDpIdByCode(idOrCode) || Device.getDpCodeById(idOrCode);

    Device.setDevState = state => {
      TYDeviceData.devInfo = { ...TYDeviceData.devInfo, ...state };
      return TYDeviceData.devInfo;
    };

    // 获取设备信息
    Device.getDeviceInfo = () =>
      new Promise(resolve => {
        if (TYDeviceData.devInfo) {
          resolve(TYDeviceData.devInfo);
        } else {
          Device.initDevice().then(d => {
            resolve(d);
          });
        }
      });

    // 获取设备当前最新的状态（getDeviceInfo 里的 state 可能存在白屏渲染阶段时上报导致无法收集）
    Device.getDeviceState = () =>
      new Promise(resolve =>
        _TYDeviceDevice.getDevInfo({}, d => {
          if (!d || !d.dps) {
            return resolve({});
          }
          const dpState = {};
          for (const dpId in d.dps) {
            if (Object.prototype.hasOwnProperty.call(d.dps, dpId)) {
              const dpCode = Device.getDpCodeById(dpId);
              dpState[dpCode] = d.dps[dpId];
            }
          }
          return resolve(dpState);
        })
      );

    Device.initDevice = () =>
      Promise.all([
        new Promise(resolve => _TYDeviceDevice.getDevInfo({}, d => resolve(d))),
        App.getNetworkState(),
      ]).then(d => {
        const networkType = type(d[1].type) === 'undefined' ? d[1] : d[1].type;
        Device.setDeviceInfo({ networkType, ...d[0] });
        return TYDeviceData.devInfo;
      });

    Device.setDeviceInfo = d => {
      if (!d.devId) {
        TYDeviceData.uiConfig = {};
        TYDeviceData.devInfo = {};
      } else {
        const deviceData = d;
        deviceData.deviceOnline = d.isOnline;
        delete deviceData.isOnline;
        const devInfo = formatDevJSON({
          appOnline: d.networkType !== 'NONE',
          ...deviceData,
        });
        TYDeviceData.uiConfig = formatUiConfig(devInfo);
        devInfo.isVDevice = d.devId && d.devId.indexOf('vdev') === 0;
        TYDeviceData.devInfo = devInfo;
      }
    };

    Device.getDpIdByCode = code => {
      if (TYDeviceData.devInfo) {
        const { codeIds } = TYDeviceData.devInfo;
        return codeIds[code];
      }
      console.log('-----未初始化,getDpIdByCode');
    };

    Device.getDpCodeById = id => {
      if (TYDeviceData.devInfo) {
        const { idCodes } = TYDeviceData.devInfo;
        return idCodes[id];
      }
      console.log('-----未初始化,getDpCodeById');
    };

    Device.getDpCodes = () => {
      if (TYDeviceData.devInfo) {
        const { idCodes } = TYDeviceData.devInfo;
        return Object.keys(idCodes);
      }
      console.log('-----未初始化,getDpCodes');
      return [];
    };

    Device.isShareDevice = () => {
      if (TYDeviceData.devInfo) {
        return !!TYDeviceData.devInfo.isShare;
      }
      console.log('-----未初始化,isShareDevice');
      return true;
    };

    Device.getDpSchema = code => {
      if (TYDeviceData.devInfo) {
        if (code) {
          return TYDeviceData.devInfo.schema[code];
        }
        return TYDeviceData.devInfo.schema;
      }
      console.log('-----未初始化,getDpSchema');
    };

    Device.getState = dp => {
      if (isEmptyObj(TYDeviceData.devInfo)) {
        console.log('-----未初始化,devInfo getState');
        return;
      }
      if (!dp) {
        if (typeof TYDeviceData.devInfo.state === 'undefined') {
          TYDeviceData.devInfo.state = {};
        }
        return TYDeviceData.devInfo.state;
      }
      if (Device.checkDpExist(dp)) {
        if (/^\d+$/.test(dp)) {
          dp = Device.getDpCodeById(dp);
        }
        return TYDeviceData.devInfo.state[dp];
      }
      console.log('3-----参数错误');
    };

    /* istanbul ignore next */
    Device.setGState = (dp, val) => {
      let state = {};
      // 批量设置
      if (type(dp) === 'object') {
        state = dp;
      } else {
        state[dp] = val;
      }
      TYDeviceData.gState = { ...TYDeviceData.gState, ...state };
      return state;
    };

    /* istanbul ignore next */
    Device.getGState = dp => {
      if (!dp) {
        return TYDeviceData.gState;
      }
      return TYDeviceData.gState[dp];
    };

    Device.getDpDataFromDevice = idOrCode => {
      console.log('-----主动查询DP', idOrCode);
      return new Promise((resolve, reject) => {
        let err;
        let dpId = `${idOrCode}`;
        if (!Device.checkDpExist(dpId)) {
          err = { ret: 'param error' };
          Event.emit('message', err);
          return;
        }
        if (!/^\d+$/.test(dpId)) {
          dpId = Device.getDpIdByCode(idOrCode);
        }
        const error = d => {
          Event.emit('message', d);
        };
        if (Device.isMeshDevice()) {
          return _TYDeviceDevice.getDpDataFromMeshDevice({ dpIds: [dpId] }, error);
        }
        _TYDeviceDevice.getDpDataFromDevice(
          {
            dpId,
          },
          loop,
          d => {
            Event.emit('message', d);
          }
        );
      });
    };

    // 到硬件查询dp点
    // 设置dp点
    Device.putDeviceData = data =>
      new Promise((resolve, reject) => {
        const { option, ...params } = data;
        let isEmpty = true;
        let err;
        const cmds = {};
        for (const dp in params) {
          if (Device.checkDpExist(dp)) {
            const dpId = /^\d+$/.test(dp) ? dp : Device.getDpIdByCode(dp);
            cmds[dpId] = params[dp];
            isEmpty = false;
          }
        }
        if (isEmpty) {
          err = { error: 'param error' };
          reject(err);
          Event.emit('message', err);
          return;
        }
        if (__DEV__) {
          console.log('-----数据下发', data, cmds);
        }
        _TYDeviceDevice.putDpData(
          {
            command: cmds, // {'1': true, '2': false}
            option: type(option) === 'undefined' ? 3 : option, // 0，静音； 1，震动；2,声音； 3，震动声音
          },
          () => resolve({ success: true }),
          d => {
            console.log('-----返回结果错误?', d);
            reject(d);
            Event.emit('message', d);
          }
        );
      });

    // 局域网
    Device.putLocalDpData = data =>
      new Promise((resolve, reject) => {
        const { option, ...params } = data;
        let isEmpty = true;
        let err;
        const cmds = {};
        const codes = [];
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
            codes.push(dpCode);
          }
        }

        if (isEmpty) {
          err = { ret: 'param error' };
          reject(err);
          Event.emit('message', err);
          return;
        }
        console.log('-----数据下发', data, cmds);
        _TYDeviceDevice.putLocalDpData(
          {
            command: cmds, // {'1': true, '2': false}
            option: typeof option === 'undefined' ? 3 : option, // 0，静音； 1，震动；2,声音； 3，震动声音
          },
          () => resolve(),
          d => {
            console.log('-----返回结果错误?', d);
            reject(d);
            Event.emit('message', d);
          }
        );
      });

    /**
     * 是否是mesh wifi设备
     * 返回值: undefined | bool
     * 当 undefined，app不支持该接口
     */
    Device.isMeshWifiDevice = () => {
      if (!TYDeviceData.devInfo) {
        throw new Error('Device uninitialized');
      }
      const { pcc } = TYDeviceData.devInfo;
      if (pcc !== undefined) {
        return pcc === '0108';
      }
      return pcc;
    };

    Device.isMeshDevice = () => {
      if (!TYDeviceData.devInfo) {
        throw new Error('Device uninitialized');
      }
      const { capability = 0 } = TYDeviceData.devInfo;
      return getBitValue(capability, 11) === 1;
    };

    /**
     * 是否是sigMesh设备
     **/
    Device.isSigMeshDevice = () => {
      if (!TYDeviceData.devInfo) {
        throw new Error('Device uninitialized');
      }
      const { capability = 0 } = TYDeviceData.devInfo;
      return getBitValue(capability, 15) === 1;
    };

    /**
     * 是否是wifi设备
     * 返回值: undefined | bool
     * 当 undefined，app不支持该接口
     */
    Device.isWifiDevice = () => {
      if (!TYDeviceData.devInfo) {
        throw new Error('Device uninitialized');
      }
      const { capability = 0 } = TYDeviceData.devInfo;
      return capability === 1;
    };

    /**
     * 是否是蓝牙设备
     **/
    Device.isBleDevice = () => {
      if (!TYDeviceData.devInfo) {
        throw new Error('Device uninitialized');
      }
      const { capability = 0 } = TYDeviceData.devInfo;
      return (
        getBitValue(capability, 10) === 1 ||
        getBitValue(capability, 11) === 1 ||
        getBitValue(capability, 15) === 1
      );
    };

    /**
     * 是否局域网
     */
    Device.isLocalLAN = () => {
      if (!TYDeviceData.devInfo) {
        throw new Error('Device uninitialized');
      }
      const { attribute = 0 } = TYDeviceData.devInfo;
      return getBitValue(attribute, 6) === 1;
    };

    /**
     * 获取蓝牙状态
     * 返回值: bool类型
     */
    Device.getBleManagerState = () => {
      return new Promise((resolve, reject) => {
        (_TYDeviceDevice.getBleManagerState ||
          function() {
            reject();
          })(d => {
          if (d) {
            return resolve(d.state);
          }
          reject();
        });
      });
    };

    /**
     *
     * @desc 获取设备蓝牙权限状态，IOS13新增
     *
     * state = 3, 未打开应用蓝牙权限
     * state = 4, 系统蓝牙关闭
     * state = 5, 系统蓝牙打开
     */
    Device.getBluetoothState = () => {
      return new Promise((resolve, reject) => {
        const TYRCTBluetoothUtilManager = NativeModules.TYRCTBluetoothUtilManager || {};
        (TYRCTBluetoothUtilManager.getBluetoothState ||
          function() {
            reject(null);
          })(d => {
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
    Device.gotoDeviceWifiNetworkMonitor =
      _TYDeviceDevice.gotoDeviceWifiNetworkMonitor || function() {};

    /**
     * 申请蓝牙权限
     */
    Device.gotoBlePermissions = _TYDeviceDevice.gotoBlePermissions || function() {};

    /**
     * 删除设备
     */
    Device.deleteDeviceInfo = () => {
      return new Promise((resolve, reject) => {
        (_TYDeviceDevice.deleteDeviceInfo ||
          function() {
            reject();
          })(resolve, reject);
      });
    };

    /**
     * 获取设备功能点配置
     */
    Device.getFunConfig = () => {
      const funConfig = {};
      if (!TYDeviceData.devInfo) return {};
      if (!TYDeviceData.devInfo.panelConfig) return {};
      const { fun } = TYDeviceData.devInfo.panelConfig;
      if (!fun) return {};
      for (const i in fun) {
        if (Object.prototype.hasOwnProperty.call(fun, i)) {
          const key = camelize(`panel_fun_${i}`);
          funConfig[key] = fun[i];
        }
      }
      return funConfig;
    };

    /**
     * 获取拆包面板信息
     */
    Device.getUnpackPanelInfo = () => {
      return new Promise(resolve => {
        if (_TYDeviceDevice.getPanelInfo) {
          _TYDeviceDevice.getPanelInfo((_, d) => resolve(d));
        } else {
          resolve('');
        }
      }).then(d => {
        if (d && d.lang) {
          Native.lang = d.lang;
        }
        Native.panelInfo = { isVDevice: d.isVDevice };
        return d.lang;
      });
    };

    // =====================================================================
    // ============================= Device end ============================
    // =====================================================================

    // =====================================================================
    // ======================= AppDeviceEventEmitter =======================
    // =====================================================================
    // 设备dp状态变更通知
    AppDeviceEventEmitter.addListener('dpDataChange', d => {
      if (!isEmptyObj(TYDeviceData.devInfo)) {
        const newState = Device.formatDps(d);
        if (!isEmptyObj(newState)) {
          if (__DEV__) {
            console.log('-----数据上报', newState, d);
          }
          Device.setState(newState);
          Event.emit('deviceDataChange', { type: 'dpData', payload: newState });
        }
      } else {
        /**
         * 如果在根组件 mount 完毕之前，消息推送过来了，
         * 面板会使用 app 刚进入面板传递的状态，导致状态与实体设备不一致,
         * 因此这里需要将最新推送过来的数据缓存起来，业务面板在渲染完毕后自行再同步一次。
         */
        TYDeviceData.__unInitializeDps = {
          ...TYDeviceData.__unInitializeDps,
          ...d,
        };
      }
    });

    // 设备信息变更通知,只通知,无数据
    AppDeviceEventEmitter.addListener('deviceChanged', () => {
      Device.initDevice().then(d =>
        Event.emit('deviceDataChange', { type: 'devInfo', payload: d })
      );
    });

    // 蓝牙状态变更通知
    AppDeviceEventEmitter.addListener('bluetoothChange', d => {
      Event.emit('bluetoothChange', d.state);
    });

    /**
     *
     * @desc 升级版蓝牙状态变更通知，IOS13新增
     *
     * state = 3, 未打开应用蓝牙权限
     * state = 4, 系统蓝牙关闭
     * state = 5, 系统蓝牙打开
     */
    AppDeviceEventEmitter.addListener('bluetoothStateChanged', d => {
      Event.emit('bluetoothStateChanged', d.state);
    });

    // 设备网络状态变更通知
    AppDeviceEventEmitter.addListener('deviceStateChange', d => {
      if (typeof d === 'undefined' || typeof d.state === 'undefined') return;
      Event.emit('deviceDataChange', {
        type: 'deviceOnline',
        payload: { deviceOnline: d.state },
      });
    });

    // app网络状态变更通知
    AppDeviceEventEmitter.addListener('networkStateChange', d => {
      if (typeof d === 'undefined' || typeof d.state === 'undefined') return;
      Event.emit('networkStateChange', { appOnline: d.state });
    });

    // 设备信息变更通知,只通知,无数据
    AppDeviceEventEmitter.addListener('linkageTimeUpdate', () => {
      Event.emit('linkageTimeUpdate', {});
    });

    // app 是否为局域网在线通知
    AppDeviceEventEmitter.addListener('deviceLocalStateChange', d => {
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
    App.getWiFiSsid = () =>
      new Promise(resolve => {
        _TYAppNative.getWiFiSsid(t => {
          resolve(t);
        });
      });

    // 获取客户端网络状态
    // {type: 'WIFI|GPRS|NONE'}
    App.getNetworkState = () =>
      new Promise(resolve => {
        _TYAppNative.getNetworkType(t => {
          resolve(t);
        });
      });

    App.is24Hour = () =>
      new Promise(resolve => {
        _TYAppNative.is24Hour(is24 => resolve(is24));
      });

    // App related
    App.verSupported = version => {
      if (_TYAppNative && _TYAppNative.mobileInfo && _TYAppNative.mobileInfo.appRnVersion) {
        return _TYAppNative.mobileInfo.appRnVersion >= version;
      }
      return false;
    };

    // 获取客户端信息
    App.getMobileInfo = () =>
      new Promise((resolve, reject) => {
        if (TYMobileData && Object.keys(TYMobileData).length > 0) {
          resolve(TYMobileData);
          return;
        }
        _TYAppNative.getMobileInfo(d => resolve(d));
      }).then(
        d => {
          TYMobileData = d;
          return TYMobileData;
        },
        () => TYMobileData
      );

    App.jumpTo = url => {
      _TYAppNative.jumpTo(url || '');
    };

    // 展示loading，有问题 （在ios中，在modal的上层显示dialog，会导致生命周期异常无法控制）
    App.showLoading = title => {
      _TYAppNative.showLoading({
        title: title || '',
      });
    };

    App.hideLoading = () => {
      _TYAppNative.hideLoading();
    };

    App.back = () => {
      _TYAppNative.back();
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

    App.showPromptDialog = (
      confirmText,
      cancelText,
      title,
      message,
      defaultValue,
      onConfirmed,
      onCanceled
    ) => {
      if (Platform.OS === 'ios') {
        try {
          AlertIOS.prompt(
            title,
            message,
            [
              {
                text: confirmText,
                onPress: inputText => onConfirmed(inputText),
                style: 'default',
              },
              {
                text: cancelText,
                onPress: () => onCanceled(),
                style: 'cancel',
              },
            ],
            'plain-text',
            defaultValue
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

    // 分享。rn 0.38.0 智能台灯定制
    App.shareMsg = map => {
      _TYAppNative.shareMsg(map);
    };

    // 面板跳面板
    if (App && NativeModules) {
      const _TYAppNativeNav = NativeModules.TYRCTNavManager;
      const _AppSupport = App.verSupported(5.23) && _TYAppNativeNav;
      const NavEventName = 'message';

      /* istanbul ignore next */
      class SubPageNav {
        constructor() {
          this.emitter = null;
          this.subscription = null;
        }

        createEmitter() {
          if (!_AppSupport) {
            console.log('-----AppRnVersion must >= 5.23');
            return;
          }
          this.emitter = new NativeEventEmitter(NativeModules.TYRCTNavManager);
        }

        addListener(callback) {
          if (!_AppSupport) {
            console.log('-----AppRnVersion must >= 5.23');
            return;
          }
          if (this.emitter) {
            this.subscription = this.emitter.addListener('receiveBroadcast', callback);
          }
        }

        removeEmitter() {
          if (!_AppSupport) {
            console.log('-----AppRnVersion must >= 5.23');
            return;
          }
          if (this.subscription) {
            this.subscription.remove();
          }
        }

        registerEventListener() {
          if (!_AppSupport) {
            console.log('-----AppRnVersion must >= 5.23');
            return;
          }
          _TYAppNativeNav.broadcastReceiverRegister(NavEventName);
        }

        sendEvent(props) {
          if (!_AppSupport) {
            console.log('-----AppRnVersion must >= 5.23');
            return;
          }
          _TYAppNativeNav.broadcastMessage(NavEventName, props);
        }

        pushWithUiID(uiId, props) {
          if (!_AppSupport) {
            console.log('-----AppRnVersion must >= 5.23');
            return;
          }
          _TYAppNativeNav.pushWithUIID(uiId, props);
        }
      }

      const uiIdNavEventEmitter = new SubPageNav();

      App.jumpSubPage = (uiIdParams, pageParams) => {
        const { uiId } = uiIdParams;
        uiIdNavEventEmitter.pushWithUiID(uiId, pageParams);
      };
    }

    // =====================================================================
    // ============================ App end ================================
    // =====================================================================

    apiRequest = (a, postData, v = '1.0') =>
      new Promise((resolve, reject) => {
        _TYDeviceDevice.apiRNRequest(
          {
            a,
            postData,
            v,
          },
          d => {
            const data = parseJson(d);
            if (__DEV__) {
              console.log(`API Success: %c${a}%o`, sucStyle, data);
            }
            resolve(data);
          },
          err => {
            const e = parseJson(err);
            if (__DEV__) {
              console.log(`API Failed: %c${a}%o`, errStyle, e.message || e.errorMsg || e);
            }
            reject(e);
          }
        );
      });
  }
}

const TYSdk = {
  mobile: App,
  device: Device,
  apiRequest,
  native: Native,
  event: Event,
  DeviceEventEmitter: AppDeviceEventEmitter,
  get devInfo() {
    return TYDeviceData.devInfo;
  },
  get __unInitializeDps() {
    return TYDeviceData.__unInitializeDps;
  },
};

// NavigatorLayout里特殊处理设置....
TYSdk.Navigator = {};
TYSdk.applyNavigator = navigator => {
  TYSdk.Navigator = navigator;
};

export default TYSdk;
