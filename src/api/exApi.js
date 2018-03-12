import moment from 'moment';
import TYNative from './api';
import Strings from '../i18n';
import Utils from '../utils';

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
        gwId: TYNative.devInfo.gwId,
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
        gwId: TYNative.devInfo.gwId,
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
        gwId: TYNative.devInfo.gwId,
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
 * [getTimerList description]
 * @return {[type]} [description]
 * 获取所有定时
 */
TYNative.getTimerList = () => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 's.m.linkage.timer.category.list.all',
      postData: {
        devId: TYNative.devInfo.devId,
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


/**
 * [getCategoryTimerList description]
 * @param  {[type]} category [description]
 * @return {[type]}          [description]
 * 获取某个分类下的定时
 */
TYNative.getCategoryTimerList = () => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 's.m.linkage.timer.category.group.list',
      postData: {
        category,
        devId: TYNative.devInfo.devId,
      },
      v: '2.0',
    }, (d) => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, (e) => {
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
    }, (d) => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, (e) => {
      reject(e);
    });
  });
};


/**
 * [addTimer description]
 * @param {[type]} category [description]
 * @param {[type]} loops    [description]
 * @param {[type]} instruct [description]
 * 添加定时
 */
TYNative.addTimer = (category, loops, instruct) => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 's.m.linkage.timer.category.group.add',
      postData: {
        category,
        devId: TYNative.devInfo.devId,
        loops,
        timeZone: Utils.timezone(),
        instruct,
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


/**
 * [updateTimer description]
 * @param  {[type]} groupId  [description]
 * @param  {[type]} category [description]
 * @param  {[type]} loops    [description]
 * @param  {[type]} instruct [description]
 * @return {[type]}          [description]
 * 更新定时
 */
TYNative.updateTimer = (groupId, category, loops, instruct) => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 's.m.linkage.timer.category.group.update',
      postData: {
        groupId,
        category,
        devId: TYNative.devInfo.devId,
        loops,
        timeZone: Utils.timezone(),
        instruct,
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


/**
 * [removeTimer description]
 * @param  {[type]} groupId  [description]
 * @param  {[type]} category [description]
 * @return {[type]}          [description]
 * 删除定时
 */
TYNative.removeTimer = (groupId, category) => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 's.m.linkage.timer.category.group.remove',
      postData: {
        groupId,
        category,
        devId: TYNative.devInfo.devId,
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


/**
 * [updateStatus description]
 * @param  {[type]} category [description]
 * @param  {[type]} groupId  [description]
 * @param  {[type]} status   [description]
 * @return {[type]}          [description]
 * 更新某个组定时的状态
 */
TYNative.updateStatus = (category, groupId, status) => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 's.m.linkage.timer.category.group.status',
      postData: {
        category,
        groupId,
        status,
        devId: TYNative.devInfo.devId,
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


/**
 * [updateCategoryStatus description]
 * @param  {[type]} category [description]
 * @param  {[type]} groupId  [description]
 * @param  {[type]} status   [description]
 * @return {[type]}          [description]
 * 更新某个分类下所有定时状态
 */
TYNative.updateCategoryStatus = (category, status) => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 's.m.linkage.timer.category.status',
      postData: {
        category,
        status,
        devId: TYNative.devInfo.devId,
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
    TYNative.apiRNRequest({
      a: 's.m.linkage.timer.nearest.get',
      postData: {
        type: 'device',
        bizId: TYNative.devInfo.devId,
        instruct: JSON.stringify({
          devId: TYNative.devInfo.devId,
          dpId,
        }),
      },
      v: '1.0',
    }, (d) => {
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
    }, (e) => {
      reject(e);
    });
  });
};


TYNative.getDPsLastTimer = (dpCodes) => {
  return Promise.all(
    dpCodes.map(dpCode => TYNative.getDPLastTimer(TYNative.getDpIdByCode(dpCode))),
  ).then((d) => {
    const data = {};
    // eslint-disable-next-line
    for (const i in dpCodes) {
      data[dpCodes[i]] = d[i];
    }
    return data;
  }, () => ({}));
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
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 's.m.dev.dp.get',
      postData: {
        gwId: TYNative.devInfo.devId,
        devId: TYNative.devInfo.devId,
      },
      v: '2.0',
    }, (d) => {
      const data = Utils.parseJSON(d);
      resolve(data);
    }, (e) => {
      reject(e);
    });
  });
};


/**
 * 获取指定dp点的名称
 */
TYNative.getDpName = (dpName) => {
  return new Promise((resolve, reject) => {
    TYNative.getDpsInfos().then(
      (d) => {
        let result = '';
        // eslint-disable-next-line
        for (const dp of d) {
          if (dp.code === dpName) {
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
 * @param  {string} dpName
 * @param  {string} name
 */
TYNative.updateDpName = (dpName, name) => {
  return new Promise((resolve, reject) => {
    TYNative.apiRNRequest({
      a: 's.m.dev.dp.name.update',
      postData: {
        gwId: TYNative.devInfo.devId,
        devId: TYNative.devInfo.devId,
        dpId: TYNative.getDpIdByCode(dpName),
        name,
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
    }, (d) => {
      let data = Utils.parseJSON(d);
      const dpId = TYNative.getDpIdByCode(dpCode);
      if (dpCode) {
        data = data[dpId] || {};
      }
      resolve(data);
    }, (e) => {
      reject(e);
    });
  });
};

export default TYNative;
