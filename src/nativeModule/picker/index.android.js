import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { requireNativeComponent, View, ViewPropTypes } from 'react-native';

var WheelPickerView = requireNativeComponent('TYRCTWheelViewManager', WheelPicker);

class WheelPicker extends Component {
  constructor(props) {
    super(props);
    this.onItemSelected = this.onItemSelected.bind(this);
    this.state = {
      selectedItemPosition: 0
    }
  }

  onItemSelected(event: Event) {
    if (!this.props.onValueChange) {
      return;
    }
    this.props.onValueChange(event.nativeEvent);
  }

  render() {
    return (
      <WheelPickerView
        style={this.props.style}
        items={this.props.items}
        itemTextColor={this.props.itemTextColor}
        selectedItemTextColor={this.props.selectedItemTextColor}
        dividerColor={this.props.dividerColor}
        visibleItemCount={this.props.visibleItemCount}
        itemAlign={this.props.itemAlign}
        selectedIndex={this.props.selectedValue}
        textSize={this.props.textSize}
        loop={this.props.loop}
        onItemSelected={this.onItemSelected}
      />
    );
  }
}

WheelPicker.propTypes = {
  ...ViewPropTypes,
  items: PropTypes.array,
  itemTextColor: PropTypes.string,
  selectedItemTextColor: PropTypes.string,
  dividerColor: PropTypes.string,
  visibleItemCount: PropTypes.number,
  itemAlign: PropTypes.string,
  selectedIndex: PropTypes.number,
  textSize: PropTypes.number,
  loop: PropTypes.bool,
  onItemSelected: PropTypes.func,
};

export default WheelPicker;
