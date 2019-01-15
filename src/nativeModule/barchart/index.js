import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  requireNativeComponent,
  Platform,
  UIManager,
  NativeModules,
  ReactNative,
} from 'react-native';

class BarChart extends Component {
  // 点击选择 value 触发事件
  onValueSelect (event) {
    if (!this.props.onValueSelect) {
      return;
    }
    this.props.onValueSelect(event);
  }
  // 放大缩小触发事件
  onScale (event) {
    if (!this.props.onScale) {
      return;
    }
    this.props.onScale(event);
  }
  // 平移触发事件
  onTranslate (event) {
    if (!this.props.onTranslate) {
      return;
    }
    this.props.onTranslate(event);
  }
  // 点击未选择 value 触发事件
  onNothingSelect (event) {
    if (!this.props.onNothingSelect) {
      return;
    }
    this.props.onNothingSelect(event);
  }
  // 清空图表数据
  clear() {
    if (Platform.OS === 'ios') {
      const manager = NativeModules.TYRCBarChartViewManager;
      manager.clear();
    } else {
      const r = this.ref;
      UIManager.dispatchViewManagerCommand(
        ReactNative.findNodeHandle(r),
        UIManager.TYRCBarChartView.Commands.clear,
        null
      );
    }
  }
  // 刷新图表数据
  refresh() {
    if (Platform.OS === 'ios') {
      const manager = NativeModules.TYRCBarChartViewManager;
      manager.refresh();
    } else {
      const r = this.ref.getRef();
      UIManager.dispatchViewManagerCommand(
        ReactNative.findNodeHandle(r),
        UIManager.TYRCBarChartView.Commands.refresh,
        null
      );
    }
  }
  render() {
    const {
      width,
      height,
      bgColor,
      title,
      xAxis,
      yAxis,
      legend,
      group,
      data,
    } = this.props;

    return (
      <View>
        <TYRCBarChart
          ref={ref => this.ref = ref}
          backgroundColor={bgColor}
          width={width}
          height={height}
          title={title}
          xAxis={xAxis}
          yAxis={yAxis}
          legend={legend}
          group={group}
          data={data}
          onValueSelect={event => this.onValueSelect(event)}
          onScale={event => this.onScale(event)}
          onTranslate={event => this.onTranslate(event)}
          onNothingSelect={event => this.onNothingSelect(event)}
        />
      </View>
    );
  }
}

BarChart.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  bgColor: PropTypes.string.isRequired,
  title: PropTypes.object.isRequired,
  xAxis: PropTypes.object.isRequired,
  yAxis: PropTypes.object.isRequired,
  legend: PropTypes.object.isRequired,
  markType: PropTypes.number.isRequired,
  data: PropTypes.array.isRequired,
  group: PropTypes.object.isRequired,
  onValueSelect: PropTypes.func.isRequired,
  onScale: PropTypes.func.isRequired,
  onTranslate: PropTypes.func.isRequired,
  onNothingSelect: PropTypes.func.isRequired,
  ...View.propTypes,
};

const TYRCBarChart = requireNativeComponent('TYRCBarChartView', {
  name: 'TYRCBarChartView',
  propTypes: BarChart.propTypes,
});

export default BarChart;
