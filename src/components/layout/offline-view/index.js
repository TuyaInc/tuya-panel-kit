import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Image, View, StyleSheet, ViewPropTypes } from 'react-native';
import TYSdk from '../../../TYNativeApi';
import RefText from '../../TYText';
import { RatioUtils, NumberUtils } from '../../../utils';
import BleOfflineView from './ble-offline-view';

const TYEvent = TYSdk.event;
const TYMobile = TYSdk.mobile;
const TYDevice = TYSdk.device;

const { convert } = RatioUtils;

const OFFLINE_API_SUPPORT = TYMobile.verSupported('2.91');

const Res = {
  offline: require('../../res/offline.png'),
};

export default class OfflineView extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    textStyle: ViewPropTypes.style,
    text: PropTypes.string,
    // isShare: PropTypes.bool,
    appOnline: PropTypes.bool,
    deviceOnline: PropTypes.bool,
    capability: PropTypes.number,
    isBleOfflineOverlay: PropTypes.bool,
  };

  static defaultProps = {
    style: null,
    textStyle: null,
    text: null,
    // isShare: false,
    appOnline: true,
    deviceOnline: true,
    capability: 1,
    isBleOfflineOverlay: true,
  };

  state = {
    bluetoothStatus: null,
  };

  async componentDidMount() {
    try {
      if (OFFLINE_API_SUPPORT) {
        const bluetoothStatus = await TYDevice.getBleManagerState();
        this.setState({ bluetoothStatus });
      }
    } catch (e) {}
    TYEvent.on('bluetoothChange', this.bluetoothChangeHandle);
  }

  componentWillUnmount() {
    TYEvent.off('bluetoothChange', this.bluetoothChangeHandle);
  }

  bluetoothChangeHandle = bluetoothStatus => {
    this.setState({ bluetoothStatus });
  };

  renderBleView() {
    const { deviceOnline, capability, isBleOfflineOverlay } = this.props;
    // 在蓝牙状态未获取到之前不渲染该页面
    if (typeof this.state.bluetoothStatus !== 'boolean') {
      return null;
    }
    return (
      <BleOfflineView
        bluetoothValue={this.state.bluetoothStatus}
        deviceOnline={deviceOnline}
        capability={capability}
        isBleOfflineOverlay={isBleOfflineOverlay}
      />
    );
  }

  renderOldView() {
    return (
      <View accessibilityLabel="OfflineView_Wifi" style={[styles.container, this.props.style]}>
        <Image style={styles.icon} source={Res.offline} />
        <RefText style={[styles.tip, this.props.textStyle]}>{this.props.text}</RefText>
      </View>
    );
  }

  render() {
    /*
      app版本不支持的，继续走老的离线提示
      部分老的面板未用NavigatorLayout，继续走老的离线提示
      分享的设备不支持删除操作
    */
    const { appOnline, capability } = this.props;

    if (appOnline && OFFLINE_API_SUPPORT && TYSdk.Navigator && TYSdk.Navigator.push) {
      const isWifiDevice = capability === 1;
      const isBle = !!NumberUtils.getBitValue(capability, 10);
      const isBleMesh = !!NumberUtils.getBitValue(capability, 11);
      const isSigMesh = !!NumberUtils.getBitValue(capability, 15);
      const isBleDevice = isBle || isBleMesh || isSigMesh;
      if (isWifiDevice || !appOnline) {
        return this.renderOldView();
      } else if (isBleDevice) {
        return this.renderBleView();
      }
    }

    return this.renderOldView();
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: `rgba(0, 0, 0, 0.8)`,
  },
  icon: {
    resizeMode: 'stretch',
    width: convert(121),
    height: convert(81),
  },
  tip: {
    marginTop: convert(14),
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});
