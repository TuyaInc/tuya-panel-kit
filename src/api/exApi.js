/* eslint-disable */
import { Platform, AppState, AppStateIOS, NativeModules } from 'react-native';
import moment from 'moment';
import RNFetchBlob from 'rn-fetch-blob';
import TYNative from './api';
import Strings from '../i18n';
import Utils from '../utils';

const AppLife = Platform.OS === 'ios' ? AppStateIOS : AppState;

const sucStyle = 'background: green; color: #fff;';
const errStyle = 'background: red; color: #fff;';

TYNative.request = function(a, postData, v = '1.0') {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest(
      {
        a,
        postData,
        v,
      },
      d => {
        const data = Utils.parseJSON(d);
        console.log(`API Success: %c${a}%o`, sucStyle, data);
        resolve(data);
      },
      err => {
        const e = Utils.parseJSON(err);
        console.log(`API Failed: %c${a}%o`, errStyle, e.message || e.errorMsg || e);
        reject(err);
      },
    );
  });
};

// =====================================================================
// ============================== Cloud ================================
// =====================================================================
/**
 * 获取设备预览时的界面配置信息
 */
TYNative.getPanelConfig = () => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 'tuya.m.device.ui.panel.config.get',
      postData: {
        gwId: TYNative.devInfo.devId,
        devId: TYNative.devInfo.devId,
        uiPhase: 'preview',
      },
      v: '1.0',
    }, (d) => {
      const data = Utils.parseJSON(d);
      if (data && data.layout) {
        resolve(data.layout);
      } else {
        resolve(null);
      }
    }, (error) => {
      reject(error);
    });
  });
};


/**
 * 从云端获取设备信息
 */
TYNative.getDeviceInfo = () => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 's.m.dev.list',
      postData: {
        gwId: TYNative.devInfo.devId,
      },
      v: '2.0',
    }, (d) => {
      const data = Utils.parseJSON(d);
      if (data && data[0] && data[0].devices && data[0].devices.length > 0) {
        const devInfo = data[0].devices.filter(v => v.devId === TYNative.devInfo.devId);
        if (devInfo[0]) {
          resolve(devInfo[0]);
        } else {
          reject();
        }
      } else {
        reject();
      }
    }, (error) => {
      reject(error);
    });
  });
};


TYNative.forceUpdatePanelConfig = () => {
  return Promise.all([
    TYNative.getDeviceInfo(),
    TYNative.getNetworkType(),
    TYNative.getPanelConfig(),
    Strings.forceUpdateNetworkLang(),
  ]).then((d) => {
    let networkState = d[1].type;
    if (typeof networkState === 'undefined') networkState = d[1];
    TYNative.setDevInfo(Object.assign({
      networkType: networkState,
    }, d[0]));
    return d[2] || {};
  }, () => ({}));
};


/**
 * 获取设备激活所在地的空气质量信息
 */
TYNative.getWeatherQuality = () => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 's.m.dev.build.in.dp.get',
      postData: {
        gwId: TYNative.devInfo.devId,
        devId: TYNative.devInfo.devId,
        codes: [
          'city.id',
          'city.name',
          'weather.air.qualityLevel',
          'weather.air.pm25',
          'weather.air.quality',
          'weather.now.temperature',
          'weather.now.hum',
          'weather.now.condIconUrl',
          'weather.now.condTxt',
        ],
      },
      v: '1.0',
    }, (d) => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, (error) => {
      reject(error);
    });
  });
};


/**
 * 获取当地空气质量信息
 */
// PM25("pm25","pm2.5指数"),
// AQI("aqi","空气质量指数"),
// TEMPERATURE("temp","温度"),
// HUMIDITY("humidity","湿度"),
// CONDITION("condition","天气情况(阴晴雨雪)"),
// PRESSURE("pressure","气压"),
// REAL_FEEL("realFeel","温度实感"),
// UVI("uvi","紫外线指数"),
// TIPS("tips","天气贴士"),
// WIND_DIR("windDir","风向"),
// WIND_LEVEL("windLevel","风等级"),
// WIND_SPEED("windSpeed","风速"),
// SUNRISE("sunRise","日出时间"),
// SUNSET("sunSet","日落时间"),
// SO2("so2","二氧化硫指数"),
// RANK("rank","空气评分"),
// PM10("pm10","pm10指数"),
// O3("o3","o3指数"),
// NO2("no2","no2指数"),
// CO("co","co指数"),
TYNative.getWeatherQualityByApp = () => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 'tuya.p.weather.city.get',
      postData: {},
      v: '1.0',
    }, (d) => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, (error) => {
      reject(error);
    });
  });
};


/**
 * 获取MP2.5曲线数据
 */
TYNative.getPm25HistoryCurve = () => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 'm.smart.history.curve',
      postData: {
        productId: TYNative.devInfo.productId,
        devId: TYNative.devInfo.devId,
        dataType: 1,
        dayNum: 5,
        dpId: 3,
      },
      v: '1.0',
    }, (d) => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, (error) => {
      reject(error);
    });
  });
};


/**
 * 获取某个dp点历史数据
 * @param dpCode
 * @param dayNum
 */
TYNative.getDpHistoryData = (dpCode, dayNum = 5) => new Promise((resolve, reject) => {
  const dpId = TYNative.getDpIdByCode(dpCode);
  const { productId, devId } = TYNative.devInfo;

  TYNative.apiRNRequest(
    {
      a: 'm.smart.history.curve',
      postData: {
        dataType: 1,
        productId,
        devId,
        dayNum,
        dpId,
      },
      v: '1.0',
    },
      d => {
        const data = Platform.OS === 'android' ? JSON.parse(d) : d;
        resolve(data);
      },
      reject
    );
});


/**
 * [getTimerList description]
 * @return {[type]} [description]
 * 获取所有定时
 * 支持群组定时
 */
TYNative.getTimerList = () => {
  return new Promise((resolve, reject) => {
    const { groupId, devId } = TYNative.devInfo;

    TYNative.apiRNRequest({
      a: 'tuya.m.timer.all.list',
      postData: {
        type: groupId ? 'device_group' : 'device',
        bizId: groupId || devId,
      },
      v: '2.0',
    }, d => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, e => {
      reject(e);
    });
  });
};


/**
 * [getCategoryTimerList description]
 * @param  {[type]} category [description]
 * @return {[type]}          [description]
 * 获取某个分类下的定时
 * 支持群组定时
 */
TYNative.getCategoryTimerList = category => {
  return new Promise((resolve, reject) => {
    const { groupId, devId } = TYNative.devInfo;
    TYNative.apiRNRequest({
      a: 'tuya.m.timer.group.list',
      postData: {
        type: groupId ? 'device_group' : 'device',
        bizId: groupId || devId,
        category,
      },
      v: '2.0',
    }, d => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, e => {
      reject(e);
    });
  });
};


TYNative.getSunsetRise = () => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 'tuya.m.device.sunsetrise.query',
      postData: {
        devId: TYNative.devInfo.devId,
      },
      v: '1.0',
    }, d => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, e => {
      reject(e);
    });
  });
};


/**
 * [addTimer description]
 * @param {[type]} category [description]
 * @param {[type]} loops    [description]
 * @param {[type]} instruct [description]
 * @param {Object} devInfo [设备信息]
 * 添加定时
 * 支持群组定时
 */
TYNative.addTimer = (category, loops, instruct, devInfo) => {
  return new Promise((resolve, reject) => {
    const { groupId, devId } = devInfo || TYNative.devInfo;
    TYNative.apiRNRequest({
      a: 'tuya.m.timer.group.add',
      postData: {
        type: groupId ? 'device_group' : 'device',
        bizId: groupId || devId,
        timeZone: Utils.timezone(),
        category,
        loops,
        instruct,
      },
      v: '3.0',
    }, d => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, e => {
      reject(e);
    });
  });
};


/**
 * [updateTimer description]
 * @param {[type]} groupId  [description]
 * @param {[type]} category [description]
 * @param {[type]} loops    [description]
 * @param {[type]} instruct [description]
 * @param {Object} devInfo [设备信息]
 * @return {[type]}          [description]
 * 更新定时
 * 支持群组定时
 */
TYNative.updateTimer = (groupId, category, loops, instruct, devInfo) => {
  return new Promise((resolve, reject) => {
    const { groupId: devGroupId, devId } = devInfo || TYNative.devInfo;

    TYNative.apiRNRequest({
      a: 'tuya.m.timer.group.update',
      postData: {
        type: devGroupId ? 'device_group' : 'device',
        bizId: devGroupId || devId,
        timeZone: Utils.timezone(),
        loops,
        category,
        instruct,
        groupId,
      },
      v: '3.0',
    }, d => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, e => {
      reject(e);
    });
  });
};


/**
 * [removeTimer description]
 * @param {[type]} groupId  [description]
 * @param {[type]} category [description]
 * @param {Object} devInfo [设备信息]
 * @return {[type]}          [description]
 * 删除定时
 * 支持群组定时
 */
TYNative.removeTimer = (groupId, category, devInfo) => {
  return new Promise((resolve, reject) => {
    const { groupId: devGroupId, devId } = devInfo || TYNative.devInfo;

    TYNative.apiRNRequest({
      a: 'tuya.m.timer.group.remove',
      postData: {
        type: devGroupId ? 'device_group' : 'device',
        bizId: devGroupId || devId,
        groupId,
        category,
      },
      v: '2.0',
    }, d => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, e => {
      reject(e);
    });
  });
};


/**
 * [updateStatus description]
 * @param {[type]} category [description]
 * @param {[type]} groupId  [description]
 * @param {[type]} status   [description]
 * @param {Object} devInfo [设备信息]
 * @return {[type]}          [description]
 * 更新某个组定时的状态
 * 支持群组定时
 */
TYNative.updateStatus = (category, groupId, status, devInfo) => {
  return new Promise((resolve, reject) => {
    const { groupId: devGroupId, devId } = devInfo || TYNative.devInfo;
    TYNative.apiRNRequest({
      a: 'tuya.m.timer.group.status.update',
      postData: {
        type: devGroupId ? 'device_group' : 'device',
        bizId: devGroupId || devId,
        category,
        groupId,
        status,
      },
      v: '2.0',
    }, d => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, e => {
      reject(e);
    });
  });
};


/**
 * [updateCategoryStatus description]
 * @param {[type]} category [description]
 * @param {[type]} groupId  [description]
 * @param {[type]} status   [description]
 * @param {Object} devInfo [设备信息]
 * @return {[type]}          [description]
 * 更新某个分类下所有定时状态
 */
TYNative.updateCategoryStatus = (category, status, devInfo) => {
  return new Promise((resolve, reject) => {
    const { devId } = devInfo || TYNative.devInfo;
    TYNative.apiRNRequest({
      a: 's.m.linkage.timer.category.status',
      postData: {
        category,
        status,
        devId,
      },
      v: '1.0',
    }, (d) => {
      const data = typeof d === 'string' ? JSON.parse(d) : d;
      resolve(data);
    }, (e) => {
      reject(e);
    });
  });
};

/**
 * 获取某个DP点最近的定时
 * @param  {[type]} dpId
 * @param  {number} inDay 最近几天之内
 */
TYNative.getDPLastTimer = (dpId, inDay) => {
  return new Promise((resolve, reject) => {
    const { devId, groupId } = TYNative.devInfo;
    const instruct = Object.assign({ dpId }, groupId
      ? { groupId }
      : { devId },
    );
    const postData = {
      type: groupId ? 'device_group' : 'device',
      bizId: devId,
      instruct: JSON.stringify(instruct),
    };
    TYNative.apiRNRequest({
      a: 's.m.linkage.timer.nearest.get',
      postData,
      v: '1.0',
    }, d => {
      let data = Utils.parseJSON(d);
      if (typeof inDay === 'number') {
        const lastDate = moment(`${data.date},${data.time},${data.timeZone}`, 'YYYYMMDD,HH:mm,ZZ');
        const r = lastDate.isSameOrBefore(moment().add(inDay, 'day'), 'day');

        if (!r) {
          data = {};
        } else {
          data.nativeDate = lastDate.toDate();
        }
      }
      resolve(data);
    }, e => {
      reject(e);
    });
  });
};

TYNative.getDPsLastTimer = (dpCodes) => {
  return Promise.all(
    dpCodes.map(dpCode => TYNative.getDPLastTimer(TYNative.getDpIdByCode(dpCode))),
  ).then(d => {
    const data = {};
    // eslint-disable-next-line
    for (const i in dpCodes) {
      data[dpCodes[i]] = d[i];
    }
    return data;
  }, () => ({}));
};

/**
 * 批量获取多个DP点最近的定时
 * @param {Array} dpCodes
 */
TYNative.getDPsLastTimers = (dpCodes) => {
  return new Promise((resolve, reject) => {
    const { devId, groupId } = TYNative.devInfo;
    const dpIds = dpCodes.map(code => TYNative.getDpIdByCode(code)).join(',');
    const instruct = Object.assign({ dpIds }, groupId
      ? { groupId }
      : { devId },
    );
    const postData = {
      type: groupId ? 'device_group' : 'device',
      bizId: devId,
      instruct: JSON.stringify(instruct),
    };
    TYNative.apiRNRequest({
      a: 's.m.linkage.timer.nearest.bat.get',
      postData,
      v: '1.0',
    }, d => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, e => {
      reject(e);
    });
  });
};

TYNative.getDeviceCloudData = key => {
  return new Promise((resolve, reject) => {
    TYNative.getDevProperty(
      d => {
        if (typeof d !== 'undefined') {
          let data = d;
          if (key) {
            data = typeof d[key] !== 'undefined' ? d[key] : {};
          }
          if (typeof data === 'string') data = JSON.parse(data);
          resolve(data);
        } else reject({});
      },
      () => reject({})
    );
  });
};


TYNative.saveDeviceCloudData = (key, data) => {
  return new Promise((resolve, reject) => {
    try {
      const jsonString = typeof data === 'object' ? JSON.stringify(data) : data;
      TYNative.setDevProperty(key, jsonString, resolve, reject);
    } catch (e) {
      reject(e);
    }
  });
};


TYNative.getDeviceTYNativeData = (key) => {
  return new Promise((resolve, reject) => {
    TYNative.getDevProperty((d) => {
      if (typeof d !== 'undefined') {
        let data = d;
        if (key) {
          data = typeof d[key] !== 'undefined' ? d[key] : {};
        }
        if (typeof data === 'string') data = JSON.parse(data);
        resolve(data);
      } else reject({});
    }, () => reject({}));
  });
};


TYNative.saveDeviceTYNativeData = (key, data) => {
  return new Promise((resolve, reject) => {
    try {
      const jsonString = typeof data === 'object' ? JSON.stringify(data) : data;
      TYNative.setDevProperty(key, jsonString,
        () => resolve(),
        () => reject(),
      );
    } catch (e) {
      reject();
    }
  });
};


/**
 * 获取设备所有dp点信息
 */
TYNative.getDpsInfos = () => {
  const key = TYNative.devInfo.groupId ? 'group' : 'device';
  const nameMap = {
    device: 's.m.dev.dp.get',
    group: 's.m.dev.group.dp.get',
  };
  const postDataMap = {
    device: {
      gwId: TYNative.devInfo.devId,
      devId: TYNative.devInfo.devId,
    },
    group: { groupId: TYNative.devInfo.groupId },
  };
  const versionMap = {
    device: '2.0',
    group: '1.0',
  };
  return TYNative.request(nameMap[key], postDataMap[key], versionMap[key]);
};

/**
 * 获取群组设备所有dp点信息
 */
TYNative.getGroupDpsInfos = () => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 's.m.dev.group.dp.get',
      postData: {
        groupId: TYNative.devInfo.groupId,
      },
      v: '1.0',
    }, d => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, e => {
      reject(e);
    });
  });
};

/**
 * 获取指定dp点的名称
 */
TYNative.getDpName = (dpCode) => {
  return new Promise((resolve, reject) => {
    TYNative.getDpsInfos().then(
      (d) => {
        let result = '';
        // eslint-disable-next-line
        for (const dp of d) {
          if (dp.code === dpCode) {
            result = dp.name;
          }
        }
        resolve(result);
      },
      (e) => {
        reject(e);
      });
  });
};

/**
 * 更新设备dp点名称
 * @param {string} dpCode
 * @param {string} name
 */
TYNative.updateDpName = (dpCode, name) => {
  const key = TYNative.devInfo.groupId ? 'group' : 'device';
  const nameMap = {
    device: 's.m.dev.dp.name.update',
    group: 'tuya.m.group.dpname.update',
  };
  const postDataMap = {
    device: {
      gwId: TYNative.devInfo.devId,
      devId: TYNative.devInfo.devId,
      dpId: TYNative.getDpIdByCode(dpCode),
      name,
    },
    group: {
      groupId: TYNative.devInfo.groupId,
      dpId: +TYNative.getDpIdByCode(dpCode),
      name,
    },
  };
  return TYNative.request(nameMap[key], postDataMap[key], '1.0');
};

/**
 * 更新群组设备dp点名称
 * @param  {string} dpCode
 * @param  {string} name
 */
TYNative.updateGroupDpName = (dpCode, name) => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 'tuya.m.group.dpname.update',
      postData: {
        groupId: TYNative.devInfo.groupId,
        dpId: +TYNative.getDpIdByCode(dpCode),
        name,
      },
      v: '1.0',
    }, d => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, e => {
      reject(e);
    });
  });
};

// 获取设备告警列表
TYNative.getDevAlarmList = () => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 'tuya.m.linkage.rule.product.query',
      postData: {
        devId: TYNative.devInfo.devId,
      },
      v: '1.0',
    }, (d) => {
      const data = Utils.parseJSON(d);
      // console.warn('data', data);
      resolve(data);
    }, (e) => {
      reject(e);
    });
  });
};


/**
 *  设置该设备的告警推送是否关闭
 *  设备级管理接口， 仅对当前设备生效
 *
 *  @param {string} ruleIds 要开启或关闭的告警id, 用","隔开
 *  @param {bool} disabled 是否禁用
 *
 */
TYNative.setAlarmSwitch = (ruleIds, disabled) => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 'tuya.m.linkage.dev.warn.set',
      postData: {
        devId: TYNative.devInfo.devId,
        ruleIds,
        disabled,
      },
      v: '1.0',
    }, (d) => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, (e) => {
      reject(e);
    });
  });
};


TYNative.getDpState = (dpCode) => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 'tuya.m.device.dp.get',
      postData: {
        devId: TYNative.devInfo.devId,
        gwId: TYNative.devInfo.devId,
      },
      v: '2.0',
    }, d => {
      let data = Utils.parseJSON(d);
      const dpId = TYNative.getDpIdByCode(dpCode);
      if (dpCode) {
        data = data[dpId] || {};
      }
      resolve(data);
    }, e => {
      reject(e);
    });
  });
};


/**
|--------------------------------------------------
| 获取设备第三方数据
| @param dateDate 数据日期时间戳，单位秒，当前按天来查询
|--------------------------------------------------
*/
TYNative.getThirdData = dateDate => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest(
      {
        a: 'tuya.m.device.third.data.get',
        postData: {
          devId: TYNative.devInfo.devId,
          dateDate,
        },
        v: '1.0',
      },
      d => {
        const data = Utils.parseJSON(d);
        // console.log('data', data);
        resolve(data);
      },
      e => {
        reject(e);
      }
    );
  });
};


/**
|--------------------------------------------------
| 批量查询设备第三方数据
| @param 查询起始时间
| @param 查询终止时间
|--------------------------------------------------
*/
TYNative.queryThirdData = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest(
      {
        a: 'tuya.m.device.third.data.query',
        postData: {
          devId: TYNative.devInfo.devId,
          startDate,
          endDate,
        },
        v: '1.0',
      },
      d => {
        const data = Utils.parseJSON(d);
        // console.log('data', data);
        resolve(data);
      },
      e => {
        reject(e);
      }
    );
  });
};


TYNative.addAppChangeHandle = fn => {
  AppLife.addEventListener('change', fn);
};

TYNative.removeAppChangeHandle = fn => {
  AppLife.removeEventListener('change', fn);
};


// 变态的ZigBee，需要设备返回后才能继续下一步的操作
TYNative.putDpDataOneByOne = (() => {
  const putDpData = TYNative.putDpData.bind(TYNative);
  const cmdS = [];
  let disabled = false;
  let timerId;

  const send = cmd => {
    const promiseHandle = {};
    const promise = new Promise((resolve, reject) => {
      promiseHandle.resolve = resolve;
      promiseHandle.reject = reject;
    });

    promiseHandle.command = cmd;
    promiseHandle.promise = promise;

    if (!cmdS.length) {
      cmdS.push(promiseHandle);
    } else {
      const cmdKeysNew = Object.keys(cmd);
      let hasInQueue = false;
      let index = 0;
      // eslint-disable-next-line
      for (const cmdItem of cmdS) {
        const oldCmd = cmdItem.command;
        const cmdKeysOld = Object.keys(oldCmd);
        if (cmdKeysNew.length === cmdKeysOld.length) {
          hasInQueue = true;
          // eslint-disable-next-line
          for (const item of cmdKeysNew) {
            if (cmdKeysOld.indexOf(item) === -1) {
              hasInQueue = false;
              break;
            } else if (cmd[item] !== oldCmd[item]) {
              hasInQueue = false;
              break;
            }
          }
          if (hasInQueue && cmdS.length > 1) {
            cmdS.splice(index, 1);
            cmdS.push(promiseHandle);
            break;
          }
        }
        index += 1;
      }
      if (!hasInQueue) {
        cmdS.push(promiseHandle);
      }
    }
    if (disabled) {
      return cmdS.length === 1 ? cmdS[0].promise : promise;
    }
    const toDo = () => {
      disabled = true;
      let cmdItem = cmdS[0];
      let { resolve, reject, command, promise: prom } = cmdItem;
      // setTimeout(() => {
      finalSend(resolve, reject, command);
      // }, 3000);
      return prom.finally(d => {
        cmdItem = null;
        resolve = null;
        reject = null;
        command = null;
        prom = null;
        cmdS.splice(0, 1);
        if (!cmdS.length) {
          disabled = false;
          return d;
        }
        toDo();
        return d;
      });
    };

    return toDo();
  };

  const finalSend = (resolve, reject, d) => {
    const handle = dps => {
      const dpCodes = Object.keys(dps);
      // eslint-disable-next-line
      for (const code of dpCodes) {
        if (d[code] !== undefined && d[code] === dps[code]) {
          clearTimeout(timerId);
          TYNative.off('dpDataChange', handle);
          resolve({
            success: true,
          });
          break;
        }
      }
    };
    TYNative.on('dpDataChange', handle);
    timerId = setTimeout(() => {
      reject({
        success: false,
      });
    }, 8000);
    putDpData(d).catch(reject);
  };

  return send;
})();

TYNative.signApi = ({biz = 'lock', type = 'image', isIE = false, uploadFileName }) => {
  const d = { biz, type, isIE, uploadFileName };
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 'tuya.m.storage.post.sign',
      postData: d,
      v: '1.0',
    }, (res) => {
      resolve(Utils.formatReturnValue(res));
    }, (error) => {
      reject(Utils.formatReturnValue(error));
    });
  });
}

TYNative.uploadFile = ({ AWSAccessKeyId, ossAccessId, policy, signature, host, key, file }) => {
  return new Promise((resolve, reject) => {
    const isUndefined = param => {
      return param == undefined;
    }
    if (
      (isUndefined(AWSAccessKeyId) && isUndefined(ossAccessId)) ||
      isUndefined(policy) ||
      isUndefined(signature) ||
      isUndefined(host) ||
      isUndefined(key) ||
      isUndefined(file)
    ) {
      reject({ message: 'missing parameter' });
    }
    const formData = new global.FormData();
    // 外区
    if (AWSAccessKeyId) {
      formData.append('AWSAccessKeyId', AWSAccessKeyId);
    }
    // 中国区
    if (ossAccessId) {
      formData.append('OSSAccessKeyId', ossAccessId);
    }

    formData.append('key', key);
    formData.append('policy', policy);
    formData.append('signature', signature);
    formData.append('file', file);

    const config = {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    };

    global.fetch(host, {
      method: 'POST',
      headers: config,
      body: formData
    }).then(res => res.text())
      .then(() => resolve({ key, ...file }))
      .catch(e => reject(e));
  });
}

TYNative.getUploadSign = function(biz, uploadFileName, type = 'image', method = 'POST') {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 'tuya.m.storage.upload.sign',
      postData: {
        biz,
        type,
        uploadFileName,
        method, // 若仅支持PUT则返回PUT
      },
      v: '3.0',
    }, d => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, error => {
      reject(error);
    });
  });
};

TYNative.uploadImageFile = async(res, biz, filename, fileType) => {
  try {
    const auth = await TYNative.getUploadSign(biz, filename) || {};
    console.log('====auth====', auth);
    const { headers, cloudKey, method, url, type, formData, postData } = auth;
    const isPutMethod = /put/gi.test(method);
    let resData;
    if (isPutMethod) {
      if (!NativeModules.RNFetchBlob) {
        throw new Error('Current Version Not support RN Fetch Blob');
      } else {
        resData = await RNFetchBlob.fetch(
          'PUT',
          url,
          headers,
          isIos ? `RNFetchBlob-${res.uri}` : RNFetchBlob.wrap(res.path)
        );
      }
    } else if (/cos/gi.test(type)) {
      // 腾讯云cos post上传取formData, 其他区取postData，且body结构不同
      const body = new global.FormData();
      Object.keys(formData).forEach(key => {
        body.append(key, formData[key]);
      });
      body.append('file', {
        type: fileType,
        uri: res.uri,
        name: filename,
        size: res.fileSize,
      });
      resData = await global.fetch(url, {
        headers,
        body,
        method: 'POST',
      });
    } else {
      const body = new global.FormData();
      const { sign, AWSAccessKeyId, ossAccessId, policy, bucketUrl } = postData;
      if (AWSAccessKeyId) {
        body.append('AWSAccessKeyId', AWSAccessKeyId);
      }
      if (ossAccessId) {
        body.append('OSSAccessKeyId', ossAccessId);
      }
      body.append('Signature', sign);
      body.append('policy', policy);
      body.append('key', cloudKey);
      body.append('file', {
        type: fileType,
        uri: res.uri,
        name: filename,
        size: res.fileSize,
      });

      resData = await global.fetch(bucketUrl, {
        headers: { 'Content-Type': 'multipart/form-data' },
        body,
        method: 'POST',
      });
    }
    console.log('====xml=====', resData);
    if (!resData) {
      throw new Error('Response Error');
    }
    const statusCode = isPutMethod ? resData.info().status : resData.status;

    return {
      success: /^2\d{2}/.test(statusCode),
      cloudKey,
    };
  } catch (err) {
    console.warn(' ======== upload error ======== ', err);
  }
};

export default TYNative;
