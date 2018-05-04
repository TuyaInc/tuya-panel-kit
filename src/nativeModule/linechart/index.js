import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, requireNativeComponent } from 'react-native';

class LineChart extends Component {
  constructor(props) {
    super(props)
    this.onValueSelect = this.onValueSelect.bind(this)
    this.onScale = this.onScale.bind(this)
    this.onTranslate = this.onTranslate.bind(this)
    this.onNothingSelect = this.onNothingSelect.bind(this)
  }
  // 点击选择 value 触发事件
  onValueSelect (event) {
    // arr: [ series, group, index ]
    // position: { x, y };
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
  render() {
    const {
      width,
      height,
      title,
      xAxis,
      yAxis,
      legend,
      group,
      data,
      modal
    } = this.props;

    return (
      <View style={{
        width,
        height,
        position: 'relative'
      }}>
        <TYRCLineChart
          ref={(ref) => this.ref = ref}
          style={{ width, height }}
          width={width}
          height={height}
          title={title}
          xAxis={xAxis}
          yAxis={yAxis}
          legend={legend}
          group={group}
          data={data}
          onValueSelect={this.onValueSelect}
          onScale={this.onScale}
          onTranslate={this.onTranslate}
          onNothingSelect={this.onNothingSelect}
        />
        {modal}
      </View>
    );
  }
  getRef() {
    return this.ref;
  }
}

LineChart.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  title: PropTypes.object,
  xAxis: PropTypes.object,
  yAxis: PropTypes.object,
  legend: PropTypes.object,
  data: PropTypes.array,
  group: PropTypes.object,
  modal: PropTypes.element,
  onValueSelect: PropTypes.func,
  onScale: PropTypes.func,
  onTranslate: PropTypes.func,
  onNothingSelect: PropTypes.func,
  ...View.propTypes,
};

var TYRCLineChart = requireNativeComponent('TYRCLineChartView', {
  name: 'TYRCLineChartView',
  propTypes: LineChart.propTypes,
});

export default LineChart;