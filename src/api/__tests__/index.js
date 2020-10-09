/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */
require('./utils/setup');
const { MOCK_NATIVE_MODULES } = require('./utils/constant');

describe('TYSdk', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('TYSdk should contain core modules', () => {
    const TYSdk = require('../api').default;
    expect(TYSdk).toHaveProperty('apiRequest');
    expect(TYSdk).toHaveProperty('device');
    expect(TYSdk).toHaveProperty('event');
    expect(TYSdk).toHaveProperty('mobile');
    expect(TYSdk).toHaveProperty('native');
    expect(TYSdk).toHaveProperty('applyNavigator');
    expect(TYSdk).toHaveProperty('Navigator');
    expect(TYSdk).toHaveProperty('DeviceEventEmitter');
  });

  it('TYSdk.device should contain right modules', () => {
    const TYSdk = require('../api').default;
    expect(TYSdk.device).toHaveProperty('checkDpExist');
    expect(TYSdk.device).toHaveProperty('deleteDeviceInfo');
    expect(TYSdk.device).toHaveProperty('formatDps');
    expect(TYSdk.device).toHaveProperty('getBleManagerState');
    expect(TYSdk.device).toHaveProperty('getBluetoothState');
    expect(TYSdk.device).toHaveProperty('getDeviceInfo');
    expect(TYSdk.device).toHaveProperty('getDpCodeById');
    expect(TYSdk.device).toHaveProperty('getDpCodes');
    expect(TYSdk.device).toHaveProperty('getDpDataFromDevice');
    expect(TYSdk.device).toHaveProperty('getDpIdByCode');
    expect(TYSdk.device).toHaveProperty('getDpSchema');
    expect(TYSdk.device).toHaveProperty('getFunConfig');
    expect(TYSdk.device).toHaveProperty('getGState');
    expect(TYSdk.device).toHaveProperty('getState');
    expect(TYSdk.device).toHaveProperty('getUnpackPanelInfo');
    expect(TYSdk.device).toHaveProperty('gotoBlePermissions');
    expect(TYSdk.device).toHaveProperty('gotoDeviceWifiNetworkMonitor');
    expect(TYSdk.device).toHaveProperty('initDevice');
    expect(TYSdk.device).toHaveProperty('isBleDevice');
    expect(TYSdk.device).toHaveProperty('isLocalLAN');
    expect(TYSdk.device).toHaveProperty('isMeshWifiDevice');
    expect(TYSdk.device).toHaveProperty('isMeshDevice');
    expect(TYSdk.device).toHaveProperty('isShareDevice');
    expect(TYSdk.device).toHaveProperty('isSigMeshDevice');
    expect(TYSdk.device).toHaveProperty('isWifiDevice');
    expect(TYSdk.device).toHaveProperty('putDeviceData');
    expect(TYSdk.device).toHaveProperty('putLocalDpData');
    expect(TYSdk.device).toHaveProperty('setDevState');
    expect(TYSdk.device).toHaveProperty('setDeviceInfo');
    expect(TYSdk.device).toHaveProperty('setGState');
    expect(TYSdk.device).toHaveProperty('setState');
    expect(TYSdk.device).toHaveProperty('showDeviceMenu');
  });

  it('TYSdk.event should contain right modules', () => {
    const TYSdk = require('../api').default;
    expect(TYSdk.event).toHaveProperty('on');
    expect(TYSdk.event).toHaveProperty('off');
    expect(TYSdk.event).toHaveProperty('once');
    expect(TYSdk.event).toHaveProperty('emit');
    expect(TYSdk.event).toHaveProperty('fire');
    expect(TYSdk.event).toHaveProperty('remove');
  });

  it('TYSdk.mobile should contain right modules', () => {
    const TYSdk = require('../api').default;
    expect(TYSdk.mobile).toHaveProperty('back');
    expect(TYSdk.mobile).toHaveProperty('bottomListDialog');
    expect(TYSdk.mobile).toHaveProperty('disablePopGesture');
    expect(TYSdk.mobile).toHaveProperty('enablePopGesture');
    expect(TYSdk.mobile).toHaveProperty('getMobileInfo');
    expect(TYSdk.mobile).toHaveProperty('getNetworkState');
    expect(TYSdk.mobile).toHaveProperty('getWiFiSsid');
    expect(TYSdk.mobile).toHaveProperty('hideLoading');
    expect(TYSdk.mobile).toHaveProperty('is24Hour');
    expect(TYSdk.mobile).toHaveProperty('jumpSubPage');
    expect(TYSdk.mobile).toHaveProperty('jumpTo');
    expect(TYSdk.mobile).toHaveProperty('shareMsg');
    expect(TYSdk.mobile).toHaveProperty('showEditDialog');
    expect(TYSdk.mobile).toHaveProperty('showLoading');
    expect(TYSdk.mobile).toHaveProperty('showPromptDialog');
    expect(TYSdk.mobile).toHaveProperty('simpleConfirmDialog');
    expect(TYSdk.mobile).toHaveProperty('simpleTipDialog');
    expect(TYSdk.mobile).toHaveProperty('verSupported');
  });

  it('TYSdk.native should contain right modules', () => {
    const TYSdk = require('../api').default;
    const { TYRCTPanelManager, TYRCTPublicManager } = MOCK_NATIVE_MODULES;
    Object.keys(TYRCTPanelManager).forEach(item => {
      expect(TYSdk.native).toHaveProperty(item);
    });
    Object.keys(TYRCTPublicManager).forEach(item => {
      expect(TYSdk.native).toHaveProperty(item);
    });
  });

  it('apiRequest success', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    TYSdk.apiRequest('tuya.api', { productId: 'xxx' }).then(data => {
      expect(data).toEqual({ list: [] });
    });
    NativeModules.TYRCTPanelManager.apiRNRequest.mock.calls[0][1]('{"list":[]}');
  });

  it('apiRequest failed', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    const fn = TYSdk.apiRequest('tuya.api', { productId: 'xxx' });
    expect(fn).rejects.toEqual({ message: '未知异常' });
    NativeModules.TYRCTPanelManager.apiRNRequest.mock.calls[0][2]('{"message":"未知异常"}');
  });

  it('applyNavigator', () => {
    const TYSdk = require('../api').default;
    expect(TYSdk.Navigator).toStrictEqual({});
    const mockNavigator = { push: jest.fn() };
    TYSdk.applyNavigator(mockNavigator);
    expect(TYSdk.Navigator).toStrictEqual(mockNavigator);
  });

  /**
   * Device Test Suites
   */
  it('device.setDeviceInfo', () => {
    const TYSdk = require('../api').default;
    const { MOCK_ORIG_DEV_INFO, MOCK_TRANS_DEV_INFO } = require('./utils/constant');
    TYSdk.device.setDeviceInfo(MOCK_ORIG_DEV_INFO);
    expect(TYSdk.devInfo).toStrictEqual(MOCK_TRANS_DEV_INFO);
  });

  it('device.getDeviceInfo', () => {
    const TYSdk = require('../api').default;
    const { MOCK_ORIG_DEV_INFO, MOCK_TRANS_DEV_INFO } = require('./utils/constant');
    TYSdk.device.setDeviceInfo(MOCK_ORIG_DEV_INFO);
    TYSdk.device.getDeviceInfo().then(devInfo => {
      expect(devInfo).toStrictEqual(MOCK_TRANS_DEV_INFO);
    });
  });

  it('device.initDevice', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    const { MOCK_ORIG_DEV_INFO, MOCK_TRANS_DEV_INFO } = require('./utils/constant');
    TYSdk.device.initDevice().then(devInfo => {
      expect(devInfo).toEqual(MOCK_TRANS_DEV_INFO);
    });
    // 模拟触发 getDevInfo 的第二个回调参数
    NativeModules.TYRCTPanelManager.getDevInfo.mock.calls[0][1](MOCK_ORIG_DEV_INFO);
    // 模拟触发 getNetworkType 的第一个回调参数
    NativeModules.TYRCTPublicManager.getNetworkType.mock.calls[0][0]('WIFI');
  });

  it('device.deleteDeviceInfo', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    return TYSdk.device.deleteDeviceInfo().then(ret => {
      expect(ret).toBeTruthy();
      expect(NativeModules.TYRCTPanelManager.deleteDeviceInfo).toHaveBeenCalled();
    });
  });

  it('device.setDevState', () => {
    const TYSdk = require('../api').default;
    const { createDevInfo } = require('./utils');
    const { MOCK_TRANS_DEV_INFO } = require('./utils/constant');
    TYSdk.device.setDeviceInfo(createDevInfo());
    TYSdk.device.setDevState({ test: 1 });
    expect(TYSdk.devInfo).toEqual({ ...MOCK_TRANS_DEV_INFO, test: 1 });
  });

  it('device.setState', () => {
    const TYSdk = require('../api').default;
    const { createDevInfo } = require('./utils');
    TYSdk.device.setDeviceInfo(createDevInfo());
    expect(TYSdk.devInfo.state).toEqual({ countdown: 0, switch_1: false });
    const newState = { countdown: 30, switch_1: true };
    TYSdk.device.setState(newState);
    expect(TYSdk.devInfo.state).toEqual(newState);
    TYSdk.device.setState({ notExistCode: 1 });
    expect(TYSdk.devInfo.state).toEqual(newState);
    TYSdk.device.setState('notExistCode', 1);
    expect(TYSdk.devInfo.state).toEqual(newState);
    TYSdk.device.setState('countdown', 90);
    expect(TYSdk.devInfo.state).toEqual({ ...newState, countdown: 90 });
  });

  it('device.getState', () => {
    const TYSdk = require('../api').default;
    const { createDevInfo } = require('./utils');
    TYSdk.device.setDeviceInfo(createDevInfo());
    expect(TYSdk.device.getState()).toEqual({
      countdown: 0,
      switch_1: false,
    });
    expect(TYSdk.device.getState('switch_1')).toBe(false);
    expect(TYSdk.device.getState(11)).toBe(0);
    expect(TYSdk.device.getState('not_exist_code')).toBe(undefined);
  });

  it('device.getDpSchema', () => {
    const TYSdk = require('../api').default;
    const { createDevInfo } = require('./utils');
    const { MOCK_TRANS_DEV_INFO } = require('./utils/constant');
    TYSdk.device.setDeviceInfo(createDevInfo());
    expect(TYSdk.device.getDpSchema()).toEqual(MOCK_TRANS_DEV_INFO.schema);
    expect(TYSdk.device.getDpSchema('countdown')).toEqual(MOCK_TRANS_DEV_INFO.schema.countdown);
  });

  it('device.getDpCodes', () => {
    const TYSdk = require('../api').default;
    const { createDevInfo } = require('./utils');
    TYSdk.device.setDeviceInfo(createDevInfo());
    expect(TYSdk.device.getDpCodes()).toEqual(['1', '11']);
  });

  it('device.isShareDevice', () => {
    const TYSdk = require('../api').default;
    const { createDevInfo } = require('./utils');
    TYSdk.device.setDeviceInfo(createDevInfo());
    expect(TYSdk.device.isShareDevice()).toBe(false);
  });

  it('device.isWifiDevice', () => {
    const TYSdk = require('../api').default;
    const { createDevInfo } = require('./utils');
    TYSdk.device.setDeviceInfo(createDevInfo({ capability: 1 }));
    expect(TYSdk.device.isWifiDevice()).toBeTruthy();
    TYSdk.device.setDeviceInfo(createDevInfo({ capability: 1024 }));
    expect(TYSdk.device.isWifiDevice()).toBeFalsy();
  });

  it('device.isBleDevice', () => {
    const TYSdk = require('../api').default;
    const { createDevInfo } = require('./utils');
    TYSdk.device.setDeviceInfo(createDevInfo({ capability: 1 }));
    expect(TYSdk.device.isBleDevice()).toBeFalsy();
    TYSdk.device.setDeviceInfo(createDevInfo({ capability: 1024 }));
    expect(TYSdk.device.isBleDevice()).toBeTruthy();
    TYSdk.device.setDeviceInfo(createDevInfo({ capability: 1025 })); // 双模
    expect(TYSdk.device.isBleDevice()).toBeTruthy();
    TYSdk.device.setDeviceInfo(createDevInfo({ capability: 2048 }));
    expect(TYSdk.device.isBleDevice()).toBeTruthy();
    TYSdk.device.setDeviceInfo(createDevInfo({ capability: 32768 }));
    expect(TYSdk.device.isBleDevice()).toBeTruthy();
  });

  it('device.isMeshDevice', () => {
    const TYSdk = require('../api').default;
    const { createDevInfo } = require('./utils');
    TYSdk.device.setDeviceInfo(createDevInfo({ capability: 1 }));
    expect(TYSdk.device.isMeshDevice()).toBeFalsy();
    TYSdk.device.setDeviceInfo(createDevInfo({ capability: 2048 }));
    expect(TYSdk.device.isMeshDevice()).toBeTruthy();
    TYSdk.device.setDeviceInfo(createDevInfo({ capability: 2049 }));
    expect(TYSdk.device.isMeshDevice()).toBeTruthy();
  });

  it('device.isSigMeshDevice', () => {
    const TYSdk = require('../api').default;
    const { createDevInfo } = require('./utils');
    TYSdk.device.setDeviceInfo(createDevInfo({ capability: 1 }));
    expect(TYSdk.device.isSigMeshDevice()).toBeFalsy();
    TYSdk.device.setDeviceInfo(createDevInfo({ capability: 32768 }));
    expect(TYSdk.device.isSigMeshDevice()).toBeTruthy();
    TYSdk.device.setDeviceInfo(createDevInfo({ capability: 32769 }));
    expect(TYSdk.device.isSigMeshDevice()).toBeTruthy();
  });

  it('device.isMeshWifiDevice', () => {
    const TYSdk = require('../api').default;
    const { createDevInfo } = require('./utils');
    TYSdk.device.setDeviceInfo(createDevInfo());
    expect(TYSdk.device.isMeshWifiDevice()).toBeFalsy();
    TYSdk.device.setDeviceInfo(createDevInfo({ pcc: '0108' }));
    expect(TYSdk.device.isMeshWifiDevice()).toBeTruthy();
  });

  it('isLocalLAN', () => {
    const TYSdk = require('../api').default;
    const { createDevInfo } = require('./utils');
    TYSdk.device.setDeviceInfo(createDevInfo());
    expect(TYSdk.device.isLocalLAN()).toBeFalsy();
    TYSdk.device.setDeviceInfo(createDevInfo({ attribute: '64' }));
    expect(TYSdk.device.isLocalLAN()).toBeTruthy();
    TYSdk.device.setDeviceInfo(createDevInfo({ attribute: '65' }));
    expect(TYSdk.device.isLocalLAN()).toBeTruthy();
  });

  it('device.showDeviceMenu', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    TYSdk.device.showDeviceMenu();
    expect(NativeModules.TYRCTPanelManager.showDeviceMenu).toHaveBeenCalled();
  });

  it('device.getBleManagerState', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    TYSdk.device.getBleManagerState();
    return TYSdk.device.getBleManagerState().then(ret => {
      expect(ret).toBeTruthy();
      expect(NativeModules.TYRCTPanelManager.getBleManagerState).toHaveBeenCalled();
    });
  });

  it('device.getBluetoothState', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    TYSdk.device.getBluetoothState();
    return TYSdk.device.getBluetoothState().then(ret => {
      expect(ret).toBe(3);
      expect(NativeModules.TYRCTBluetoothUtilManager.getBluetoothState).toHaveBeenCalled();
    });
  });

  it('device.putLocalDpData valid', () => {
    const { NativeModules } = require('react-native');
    const { createDevInfo } = require('./utils');
    const TYSdk = require('../api').default;
    TYSdk.device.setDeviceInfo(createDevInfo());
    TYSdk.device.putLocalDpData({ switch_1: true, countdown: 30 }).then(() => {
      expect(NativeModules.TYRCTPanelManager.putLocalDpData).toHaveBeenCalled();
    });
    NativeModules.TYRCTPanelManager.putLocalDpData.mock.calls[0][1]();
  });

  it('device.putLocalDpData invalid', () => {
    const { NativeModules } = require('react-native');
    const { createDevInfo } = require('./utils');
    const TYSdk = require('../api').default;
    TYSdk.device.setDeviceInfo(createDevInfo());
    // 下发不存在的 dp 点
    TYSdk.device.putLocalDpData({ switch_2: true }).then(() => {
      expect(NativeModules.TYRCTPanelManager.putLocalDpData).not.toHaveBeenCalled();
    });
    NativeModules.TYRCTPanelManager.putLocalDpData.mock.calls[0][1]();
  });

  it('device.putDeviceData valid', () => {
    const { NativeModules } = require('react-native');
    const { createDevInfo } = require('./utils');
    const TYSdk = require('../api').default;
    TYSdk.device.setDeviceInfo(createDevInfo());
    TYSdk.device.putDeviceData({ switch_1: true, countdown: 30 }).then(() => {
      expect(NativeModules.TYRCTPanelManager.putDpData).toHaveBeenCalled();
    });
    NativeModules.TYRCTPanelManager.putDpData.mock.calls[0][1]();
  });

  it('device.putDeviceData invalid', () => {
    const { NativeModules } = require('react-native');
    const { createDevInfo } = require('./utils');
    const TYSdk = require('../api').default;
    TYSdk.device.setDeviceInfo(createDevInfo());
    // 下发不存在的 dp 点
    TYSdk.device.putDeviceData({ switch_2: true }).then(() => {
      expect(NativeModules.TYRCTPanelManager.putDpData).not.toHaveBeenCalled();
    });
    NativeModules.TYRCTPanelManager.putDpData.mock.calls[0][1]();
  });

  it('device.getDpDataFromDevice', () => {
    const { NativeModules } = require('react-native');
    const { createDevInfo } = require('./utils');
    const TYSdk = require('../api').default;
    TYSdk.device.setDeviceInfo(createDevInfo());
    TYSdk.device.getDpDataFromDevice('switch_1').then(() => {
      expect(NativeModules.TYRCTPanelManager.getDpDataFromDevice).toHaveBeenCalled();
    });
    TYSdk.device.getDpDataFromDevice('not_exist_code').then(() => {
      expect(NativeModules.TYRCTPanelManager.getDpDataFromDevice).toHaveBeenCalled();
    });

    TYSdk.device.setDeviceInfo(createDevInfo({ capability: 2048 }));
    TYSdk.device.getDpDataFromDevice('switch_1');
  });

  it('device.getFunConfig', () => {
    const { createDevInfo } = require('./utils');
    const TYSdk = require('../api').default;
    TYSdk.device.setDeviceInfo(createDevInfo());
    const funConfig1 = TYSdk.device.getFunConfig();
    expect(funConfig1).toEqual({});

    TYSdk.device.setDeviceInfo(
      createDevInfo({ panelConfig: { fun: { showCountdown: true, showXXX: '123' } } })
    );
    const funConfig2 = TYSdk.device.getFunConfig();
    expect(funConfig2).toEqual({ panelFunShowCountdown: true, panelFunShowXXX: '123' });
  });

  it('device.getUnpackPanelInfo', () => {
    const { NativeModules } = require('react-native');
    const { createDevInfo } = require('./utils');
    const TYSdk = require('../api').default;
    TYSdk.device.setDeviceInfo(createDevInfo());
    TYSdk.device.getUnpackPanelInfo().then(lang => {
      expect(NativeModules.TYRCTPanelManager.getPanelInfo).toHaveBeenCalled();
      expect(lang).toBe('testLang');
      expect(TYSdk.native.lang).toBe('testLang');
      expect(TYSdk.native.panelInfo).toEqual({ isVDevice: true });
    });
    NativeModules.TYRCTPanelManager.getPanelInfo.mock.calls[0][0]('', {
      lang: 'testLang',
      isVDevice: true,
    });
  });

  /**
   * Event Test Suites
   */
  it('event.dpDataChange when unInitialzed', () => {
    const TYSdk = require('../api').default;
    const evtCb = TYSdk.DeviceEventEmitter.addListener.mock.calls.find(value => {
      return value[0] === 'dpDataChange';
    })[1];
    evtCb({ 1: true, 11: 90 });
    expect(TYSdk.__unInitializeDps).toEqual({ 1: true, 11: 90 });
  });

  it('event.dpDataChange', () => {
    const TYSdk = require('../api').default;
    const { createDevInfo } = require('./utils');
    TYSdk.device.setDeviceInfo(createDevInfo());
    TYSdk.event.on('deviceDataChange', data => {
      expect(data).toEqual({ type: 'dpData', payload: { switch_1: true, countdown: 90 } });
    });
    const evtCb = TYSdk.DeviceEventEmitter.addListener.mock.calls.find(value => {
      return value[0] === 'dpDataChange';
    })[1];
    evtCb({ 1: true, 11: 90 });
  });

  it('event.deviceChanged', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    const { createDevInfo } = require('./utils');
    const { MOCK_ORIG_DEV_INFO, MOCK_TRANS_DEV_INFO } = require('./utils/constant');
    TYSdk.device.setDeviceInfo(createDevInfo());
    TYSdk.event.on('deviceDataChange', data => {
      expect(data).toEqual({ type: 'devInfo', payload: MOCK_TRANS_DEV_INFO });
    });
    const evtCb = TYSdk.DeviceEventEmitter.addListener.mock.calls.find(value => {
      return value[0] === 'deviceChanged';
    })[1];
    evtCb();
    // 模拟触发 getDevInfo 的第二个回调参数
    NativeModules.TYRCTPanelManager.getDevInfo.mock.calls[1][1](MOCK_ORIG_DEV_INFO);
    // 模拟触发 getNetworkType 的第一个回调参数
    NativeModules.TYRCTPublicManager.getNetworkType.mock.calls[1][0]('WIFI');
  });

  it('event.bluetoothChange', () => {
    const TYSdk = require('../api').default;
    TYSdk.event.on('deviceDataChange', data => {
      expect(data).toBe(true);
    });
    const evtCb = TYSdk.DeviceEventEmitter.addListener.mock.calls.find(value => {
      return value[0] === 'bluetoothChange';
    })[1];
    evtCb({ state: true });
  });

  it('event.bluetoothStateChanged', () => {
    const TYSdk = require('../api').default;
    TYSdk.event.on('deviceDataChange', data => {
      expect(data).toBe(3);
    });
    const evtCb = TYSdk.DeviceEventEmitter.addListener.mock.calls.find(value => {
      return value[0] === 'bluetoothStateChanged';
    })[1];
    evtCb({ state: 3 });
  });

  it('event.deviceStateChange', () => {
    const TYSdk = require('../api').default;
    TYSdk.event.on('deviceDataChange', data => {
      expect(data).toEqual({
        type: 'deviceOnline',
        payload: { deviceOnline: false },
      });
    });
    const evtCb = TYSdk.DeviceEventEmitter.addListener.mock.calls.find(value => {
      return value[0] === 'deviceStateChange';
    })[1];
    evtCb();
    evtCb({ state: undefined });
    evtCb({ state: false });
  });

  it('event.networkStateChange', () => {
    const TYSdk = require('../api').default;
    TYSdk.event.on('networkStateChange', data => {
      expect(data).toEqual({ appOnline: true });
    });
    const evtCb = TYSdk.DeviceEventEmitter.addListener.mock.calls.find(value => {
      return value[0] === 'networkStateChange';
    })[1];
    evtCb();
    evtCb({ state: undefined });
    evtCb({ state: true });
  });

  it('event.linkageTimeUpdate', () => {
    const TYSdk = require('../api').default;
    TYSdk.event.on('linkageTimeUpdate', data => {
      expect(data).toEqual({});
    });
    const evtCb = TYSdk.DeviceEventEmitter.addListener.mock.calls.find(value => {
      return value[0] === 'linkageTimeUpdate';
    })[1];
    evtCb();
  });

  it('event.deviceLocalStateChange', () => {
    const TYSdk = require('../api').default;
    TYSdk.event.on('deviceLocalStateChange', data => {
      expect(data).toEqual({ state: true });
    });
    const evtCb = TYSdk.DeviceEventEmitter.addListener.mock.calls.find(value => {
      return value[0] === 'deviceLocalStateChange';
    })[1];
    evtCb();
    evtCb({ state: undefined });
    evtCb({ state: true });
  });

  /**
   * Mobile Test Suites
   */
  it('mobile.jumpTo', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    TYSdk.mobile.jumpTo();
    expect(NativeModules.TYRCTPublicManager.jumpTo).toHaveBeenCalledWith('');
    const url = 'https://www.tuya.com';
    TYSdk.mobile.jumpTo(url);
    expect(NativeModules.TYRCTPublicManager.jumpTo).toHaveBeenCalledWith(url);
  });

  it('mobile.jumpSubPage', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    const params = {
      textLinkStyle: {
        textDecorationLine: 'none',
        color: '#999',
      },
    };
    TYSdk.mobile.jumpSubPage({ uiId: '000000cg8b' }, params);
    expect(NativeModules.TYRCTNavManager.pushWithUIID).toHaveBeenCalledWith('000000cg8b', params);
  });

  it('mobile.showLoading', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    TYSdk.mobile.showLoading();
    expect(NativeModules.TYRCTPublicManager.showLoading).toHaveBeenCalledWith({ title: '' });
    const title = 'Hello World';
    TYSdk.mobile.showLoading(title);
    expect(NativeModules.TYRCTPublicManager.showLoading).toHaveBeenCalledWith({ title });
  });

  it('mobile.hideLoading', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    TYSdk.mobile.hideLoading();
    expect(NativeModules.TYRCTPublicManager.hideLoading).toHaveBeenCalled();
  });

  it('mobile.back', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    TYSdk.mobile.back();
    expect(NativeModules.TYRCTPublicManager.back).toHaveBeenCalled();
  });

  it('mobile.disablePopGesture', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    TYSdk.mobile.disablePopGesture();
    expect(NativeModules.TYRCTPanelManager.disablePopGesture).toHaveBeenCalled();
  });

  it('mobile.enablePopGesture', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    TYSdk.mobile.enablePopGesture();
    expect(NativeModules.TYRCTPanelManager.enablePopGesture).toHaveBeenCalled();
  });

  it('mobile.showPromptDialog', () => {
    const { AlertIOS } = require('react-native');
    const TYSdk = require('../api').default;
    TYSdk.mobile.showPromptDialog();
    expect(AlertIOS.prompt).toHaveBeenCalled();
  });

  it('mobile.bottomListDialog', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    const args = ['itemList', 'selected', 'onConfirmed'];
    TYSdk.mobile.bottomListDialog(...args);
    expect(NativeModules.TYRCTPublicManager.bottomListDialog).toHaveBeenCalledWith(...args);
  });

  it('mobile.showEditDialog', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    const args = ['title', 'editString', 'onConfirmed', 'onCanceled'];
    TYSdk.mobile.showEditDialog(...args);
    expect(NativeModules.TYRCTPublicManager.showEditDialog).toHaveBeenCalledWith(...args);
  });

  it('mobile.simpleConfirmDialog', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    const args = ['title', 'msg', 'onConfirmed', 'onCanceled'];
    TYSdk.mobile.simpleConfirmDialog(...args);
    expect(NativeModules.TYRCTPublicManager.simpleConfirmDialog).toHaveBeenCalledWith(...args);
  });

  it('mobile.simpleTipDialog', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    const args = ['msg', 'onConfirmed'];
    TYSdk.mobile.simpleTipDialog(...args);
    expect(NativeModules.TYRCTPublicManager.simpleTipDialog).toHaveBeenCalledWith(...args);
  });

  it('mobile.shareMsg', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    const args = ['map'];
    TYSdk.mobile.shareMsg(...args);
    expect(NativeModules.TYRCTPublicManager.shareMsg).toHaveBeenCalledWith(...args);
  });

  it('mobile.getWiFiSsid', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    TYSdk.mobile.getWiFiSsid().then(ssid => {
      expect(ssid).toBe('123');
      expect(NativeModules.TYRCTPublicManager.getWiFiSsid).toHaveBeenCalled();
    });
    NativeModules.TYRCTPublicManager.getWiFiSsid.mock.calls[0][0]('123');
  });

  it('mobile.is24Hour', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    TYSdk.mobile.is24Hour().then(ssid => {
      expect(ssid).toBe(true);
      expect(NativeModules.TYRCTPublicManager.is24Hour).toHaveBeenCalled();
    });
    NativeModules.TYRCTPublicManager.is24Hour.mock.calls[0][0](true);
  });

  it('mobile.getMobileInfo', () => {
    const { NativeModules } = require('react-native');
    const TYSdk = require('../api').default;
    TYSdk.mobile.getMobileInfo().then(mobileInfo => {
      expect(mobileInfo).toEqual(NativeModules.TYRCTPublicManager.mobileInfo);
      expect(NativeModules.TYRCTPublicManager.getMobileInfo).toHaveBeenCalled();
    });
    NativeModules.TYRCTPublicManager.getMobileInfo.mock.calls[0][0](
      NativeModules.TYRCTPublicManager.mobileInfo
    );
  });
});
