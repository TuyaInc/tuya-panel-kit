import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  View,
  ViewPropTypes,
  Animated,
  Easing,
  ColorPropType,
  StyleSheet,
  PanResponder,
} from 'react-native';
import { CoreUtils, RatioUtils } from '../../utils';
import { FRICTION_LEVEL, DECELERATION } from './constant';
import {
  Center,
  StyledTab,
  StyledTabBtn,
  StyledTabText,
  AnimatedView,
  AnimatedUnderline,
} from './styled';
import {
  getTabWidth,
  getIndexByDeltaX,
  getNearestIndexByDeltaX,
  getCenteredScrollIndex,
  isValidPress,
  isValidSwipe,
  reduceTabLayoutLeft,
} from './utils';
import TabMask from './tab-mask';
import TabPanel from './tab-panel';
import TabContent from './tab-content';
import TabScrollView from './tab-scroll-view';
import TYText from '../TYText';

const { get } = CoreUtils;
const { winWidth } = RatioUtils;

export default class Tabs extends Component {
  static TabPanel = TabPanel;
  static TabContent = TabContent;
  static TabScrollView = TabScrollView;
  static propTypes = {
    accessibilityLabel: PropTypes.string,
    /**
     * Tabs 的样式
     */
    style: ViewPropTypes.style,
    /**
     * 存在 TabContent 时，包裹着 Tabs 以及 TabContent 的容器样式
     */
    wrapperStyle: ViewPropTypes.style,
    /**
     * 单个 Tab 的样式
     */
    tabStyle: ViewPropTypes.style,
    /**
     * 单个激活 Tab 的样式
     */
    tabActiveStyle: ViewPropTypes.style,
    tabTextStyle: TYText.propTypes.style,
    tabActiveTextStyle: TYText.propTypes.style,
    tabContentStyle: ViewPropTypes.style,
    underlineStyle: ViewPropTypes.style,
    /**
     * 下环线的宽度，不设置则默认跟随文字大小
     */
    underlineWidth: PropTypes.number,
    defaultActiveKey: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    activeKey: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    dataSource: PropTypes.array.isRequired,
    disabled: PropTypes.bool,
    /**
     * 一屏下最多可存在的tab数量
     */
    maxItem: PropTypes.number,
    /**
     * Tab 与 TabContent 同时存在时，Tab 的排列位置
     */
    tabPosition: PropTypes.oneOf(['top', 'bottom']),
    /**
     * Tab Content 是否可滚动
     */
    swipeable: PropTypes.bool,
    /**
     * Tabs 和下划线激活时的颜色
     */
    activeColor: ColorPropType,
    /**
     * Tabs 的背景色
     */
    background: ColorPropType,
    /**
     * TabContent 是否需要预加载
     */
    preload: PropTypes.bool,
    /**
     * TabContent 预加载延迟时间
     */
    preloadTimeout: PropTypes.number,
    /**
     * 按需完毕之前的占位元素
     */
    renderPlaceholder: PropTypes.func,
    onChange: PropTypes.func,
    children: PropTypes.array,
    animationConfig: PropTypes.shape({
      duration: PropTypes.number,
      easing: PropTypes.func,
      delay: PropTypes.number,
      isInteraction: PropTypes.bool,
      useNativeDriver: PropTypes.bool, // always false
    }),
  };

  static defaultProps = {
    accessibilityLabel: 'Tabs',
    style: null,
    wrapperStyle: null,
    tabStyle: null,
    tabActiveStyle: null,
    tabTextStyle: null,
    tabActiveTextStyle: null,
    tabContentStyle: null,
    underlineStyle: null,
    underlineWidth: undefined,
    defaultActiveKey: 0,
    activeKey: undefined,
    disabled: false,
    maxItem: 4,
    tabPosition: 'top',
    swipeable: true,
    activeColor: undefined, // 默认跟随主题色
    background: '#fff',
    onChange: undefined,
    preload: true,
    preloadTimeout: 375,
    renderPlaceholder: undefined,
    children: undefined,
    animationConfig: {
      duration: 200,
      easing: Easing.linear,
      delay: 0,
      isInteraction: true,
      useNativeDriver: false,
    },
  };

  constructor(props) {
    super(props);
    if (
      Array.isArray(props.dataSource) &&
      Array.isArray(props.children) &&
      props.dataSource.length !== props.children.length
    ) {
      console.warn('Tabs: 数据源与children数量不匹配，请检查是否配置错误');
    }
    this.state = {
      activeIndex: this.getCurActiveIndex(props),
      scrollX: new Animated.Value(0), // 只在tabs数量超过maxItem时使用到
      underlineLeft: new Animated.Value(0),
      underlineWidth: new Animated.Value(0),
    };
    const styleObj = StyleSheet.flatten([props.style]);
    this._tabsWidth = styleObj.width || winWidth;
    this._tabWidth = getTabWidth(props.maxItem, this._tabsWidth);
    this._bounds = [0, -this._tabWidth * props.dataSource.length + this._tabsWidth]; // x轴左右边界坐标
    this._curDeltaX = 0; // 当前的x轴偏移量
    this._tabIsReady = false;
    this._tabLayouts = [];
    this._cachedChildren = Array.isArray(props.children)
      ? new Array(props.children.length).fill(0)
      : [];
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => !this.props.disabled,
      onStartShouldSetPanResponderCapture: () => !this.props.disabled,
      onMoveShouldSetPanResponder: () => !this.props.disabled,
      onMoveShouldSetPanResponderCapture: () => !this.props.disabled,
      onPanResponderTerminationRequest: () => !this.props.disabled, // 上层的responder是否能中断当前的responder
      onPanResponderGrant: () => {},
      onPanResponderMove: this._handleMove,
      onPanResponderRelease: this._handleRelease,
      onPanResponderTerminate: this._handleRelease,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this._tabIsReady && typeof nextProps.activeKey !== 'undefined') {
      this.setState({ activeIndex: this.getCurActiveIndex(nextProps) }, () => {
        this._startUnderlineAnimation(this.state.activeIndex);
      });
    }
  }

  componentWillUnmount() {
    this._stopAllAnimations();
  }

  get isMultiScreen() {
    return this.props.dataSource.length > this.props.maxItem;
  }

  /**
   * @desc 根据当前的`activeKey`获取当前激活的索引
   * @param {Object} props - 当前
   */
  getCurActiveIndex = props => {
    const { activeKey, defaultActiveKey } = props;
    const activeIndex = this.props.dataSource.findIndex(
      d => d.value === activeKey || d.value === defaultActiveKey
    );
    return activeIndex === -1 ? 0 : activeIndex;
  };

  /**
   * @desc 获取对应索引对应的tab布局属性
   * @param {Number} idx - 索引
   */
  getCurTabLayout = idx => {
    const curTabLayout = get(this._tabLayouts, `${idx}`, {});
    return curTabLayout;
  };

  /**
   * @desc 滚动tabs到对应索引的位置
   * @param {Number} idx - 滚动到哪个索引的位置
   * @param {Function} cb - 滚动动画结束回调
   */
  scrollToIndex = (idx, cb) => {
    const { animationConfig, dataSource } = this.props;
    if (idx > dataSource.length - 1) {
      return;
    }
    const toValue = -this._tabWidth * idx;
    this._stopAllAnimations();
    this._curDeltaX = toValue;
    Animated.timing(this.state.scrollX, {
      toValue,
      ...animationConfig,
      useNativeDriver: false,
    }).start(cb);
  };

  /**
   * @desc 滚动下划线到对应索引的位置
   * @param {Number} idx - 要滚动到下划线的索引
   * @param {Function} cb - 滚动动画结束回调
   */
  _startUnderlineAnimation = (idx, cb) => {
    const { animationConfig, dataSource, maxItem } = this.props;
    if (idx > dataSource.length - 1) {
      return;
    }
    const curTabLayout = this.getCurTabLayout(idx);
    this._stopAllAnimations();
    this.animationFn = Animated.parallel([
      Animated.timing(this.state.underlineLeft, {
        toValue: curTabLayout.left,
        ...animationConfig,
        useNativeDriver: false,
      }),
      Animated.timing(this.state.underlineWidth, {
        toValue: curTabLayout.width,
        ...animationConfig,
        useNativeDriver: false,
      }),
    ]);
    this.animationFn.start(() => {
      const scrollIdx = getCenteredScrollIndex(idx, maxItem, dataSource.length);
      this.scrollToIndex(scrollIdx);
      typeof cb === 'function' && cb();
    });
  };

  _stopAllAnimations = () => {
    this.state.scrollX.stopAnimation();
    this.state.underlineLeft.stopAnimation();
    this.state.underlineWidth.stopAnimation();
  };

  /**
   * @desc 根据x轴偏移量计算出tabs滑动的位置
   * @param {Number} dx - x轴偏移量
   */
  _moveTo(dx) {
    let deltaX = this._curDeltaX + dx;
    const [leftBound, rightBound] = this._bounds;
    if (dx > 0 && deltaX >= leftBound) {
      // 超出左边界
      deltaX = leftBound + (deltaX - leftBound) * FRICTION_LEVEL;
    } else if (dx < 0 && deltaX <= rightBound) {
      // 超出右边界
      deltaX = rightBound + (deltaX - rightBound) * FRICTION_LEVEL;
    }
    this.state.scrollX.setValue(deltaX);
    return deltaX;
  }

  _handleMove = (e, { dx }) => {
    if (this.isMultiScreen) {
      this._moveTo(dx);
    }
  };

  _handleRelease = (e, { x0, dx, dy, vx }) => {
    const isPress = isValidPress(dx, dy);
    if (isPress) {
      const deltaX = Math.abs(this._curDeltaX) + Math.abs(x0);
      const idx = getIndexByDeltaX(deltaX, this._tabWidth);
      this._handleTabChange(this.props.dataSource[idx], idx);
    } else if (this.isMultiScreen) {
      const { dataSource } = this.props;
      const deltaX = this._moveTo(dx);
      const minIdx = 0;
      const maxIdx = Math.floor(dataSource.length / 2);
      const idx = getNearestIndexByDeltaX(deltaX, this._tabWidth, maxIdx);
      if ((dx > 0 && idx === minIdx) || (dx < 0 && idx === maxIdx)) {
        this.scrollToIndex(idx);
      } else if (isValidSwipe(vx, dx)) {
        this.state.scrollX.addListener(({ value }) => {
          const [leftBound, rightBound] = this._bounds;
          if (value > leftBound) {
            this._curDeltaX = leftBound;
            this.state.scrollX.stopAnimation();
            this.state.scrollX.setValue(leftBound);
          } else if (value < rightBound) {
            this._curDeltaX = rightBound;
            this.state.scrollX.stopAnimation();
            this.state.scrollX.setValue(rightBound);
          } else {
            this._curDeltaX = value;
          }
        });
        Animated.decay(this.state.scrollX, {
          velocity: vx,
          deceleration: DECELERATION,
        }).start(() => {
          this._curDeltaX = this.state.scrollX._value;
          this.state.scrollX.removeAllListeners();
        });
      } else {
        this._curDeltaX = deltaX;
      }
    }
  };

  _handleTabLayout = ({ nativeEvent: { layout } }, idx) => {
    const { dataSource } = this.props;
    this._tabLayouts[idx] = layout;
    this._tabIsReady = this._tabLayouts.filter(d => !!d).length === dataSource.length;
    if (this._tabIsReady) {
      this._tabLayouts = reduceTabLayoutLeft(this._tabLayouts);
      this._startUnderlineAnimation(this.state.activeIndex);
    }
  };

  _handleTabChange = (tab, idx) => {
    const { dataSource, activeKey, onChange } = this.props;
    if (idx > dataSource.length - 1) {
      return;
    }
    if (typeof activeKey === 'undefined') {
      this.setState({ activeIndex: idx }, () => {
        this._startUnderlineAnimation(idx);
      });
    }
    typeof onChange === 'function' && this.props.onChange(tab, idx);
  };

  /**
   * @desc 根据tabContent滑动的位置动态计算`下划线`的`宽度`和`偏移量`，仿原生动效
   * @param {Object} gestureState
   * @param {Number} idx - 距离当前滑动偏移量最近的索引
   * @param {Number} percent - 当前滑动偏移量相对content宽度的百分比
   */
  _handleTabContentMove = (gestureState, idx, percent) => {
    const { dataSource } = this.props;
    const { dx } = gestureState;
    const minIdx = 0;
    const maxIdx = dataSource.length - 1;
    const isToRight = dx < 0;
    const rPercent = isToRight ? percent : 1 - percent;
    const isNextPage = rPercent >= 0.5;
    if (isToRight) {
      const nextIdx = Math.min(isNextPage ? idx : idx + 1, maxIdx);
      if (this.state.activeIndex === maxIdx && nextIdx === maxIdx) {
        return;
      }
      const curTabLayout = this.getCurTabLayout(this.state.activeIndex);
      const nextTabLayout = this.getCurTabLayout(nextIdx);
      const { left: curLeft, width: curWidth } = curTabLayout;
      const { left: nextLeft, width: nextWidth } = nextTabLayout;
      const moveDelta = curWidth * 0.666667;
      const totalLen = nextLeft + nextWidth * 0.5 - curLeft - curWidth;
      let newWidth = curTabLayout.width + (totalLen - moveDelta) * Math.min(rPercent * 2, 1);
      let newLeft = curLeft + moveDelta * Math.min(rPercent * 2, 1);
      if (isNextPage) {
        const extraWidth = nextLeft - curLeft;
        newWidth -= extraWidth * Math.min((rPercent - 0.5) * 2, 1);
        newLeft += extraWidth * Math.min((rPercent - 0.5) * 2, 1);
      }
      this.state.underlineWidth.setValue(newWidth);
      this.state.underlineLeft.setValue(newLeft);
    } else {
      const nextIdx = Math.max(isNextPage ? idx : idx - 1, minIdx);
      if (this.state.activeIndex === minIdx && nextIdx === minIdx) {
        return;
      }
      const curTabLayout = this.getCurTabLayout(this.state.activeIndex);
      const nextTabLayout = this.getCurTabLayout(nextIdx);
      const { left: curLeft, width: curWidth } = curTabLayout;
      const { left: nextLeft, width: nextWidth } = nextTabLayout;
      const moveDelta = curWidth * 0.333333;
      const totalLen = curLeft - nextLeft - nextWidth * 0.5;
      let newWidth = curTabLayout.width + (totalLen - moveDelta) * Math.min(rPercent * 2, 1);
      let newLeft = curLeft - moveDelta * Math.min(rPercent * 2, 1);
      if (isNextPage) {
        const extraWidth = curLeft - nextLeft;
        newWidth -= extraWidth * Math.min((rPercent - 0.5) * 2, 1);
        newLeft -= extraWidth * Math.min((rPercent - 0.5) * 2, 1);
      }
      this.state.underlineWidth.setValue(newWidth);
      this.state.underlineLeft.setValue(newLeft - (newWidth - curWidth));
    }
  };

  _handleTabContentRelease = (gestureState, idx) => {
    const { dataSource } = this.props;
    this._handleTabChange(dataSource[idx], idx);
    this._startUnderlineAnimation(idx);
  };

  _renderTab = (tab, idx) => {
    const {
      accessibilityLabel,
      tabStyle,
      tabActiveStyle,
      tabTextStyle,
      tabActiveTextStyle,
      activeColor,
      underlineWidth,
    } = this.props;
    const { label, renderTab } = tab;
    const isActive = idx === this.state.activeIndex;
    const isFixedWidth = typeof underlineWidth === 'number';
    const TabText = (
      <StyledTabText
        style={[tabTextStyle, isActive && tabActiveTextStyle]}
        color={activeColor}
        text={label}
        isActive={isActive}
      />
    );
    return (
      <Center
        key={idx}
        accessibilityLabel={`${accessibilityLabel}_${idx}`}
        style={{ width: this._tabWidth }}
      >
        <StyledTabBtn
          style={[isFixedWidth && { width: underlineWidth }, tabStyle, isActive && tabActiveStyle]}
          onLayout={evt => this._handleTabLayout(evt, idx)}
        >
          {!isFixedWidth
            ? typeof renderTab === 'function'
              ? renderTab(isActive, this.state, this.props)
              : TabText
            : null}
        </StyledTabBtn>
        {isFixedWidth
          ? typeof renderTab === 'function'
            ? renderTab(isActive, this.state, this.props)
            : TabText
          : null}
      </Center>
    );
  };

  _renderTabs = () => {
    const { dataSource } = this.props;
    if (this.isMultiScreen) {
      const width = dataSource.length * this._tabWidth;
      return (
        <AnimatedView
          style={{
            width,
            transform: [
              {
                translateX: this.state.scrollX,
              },
            ],
          }}
        >
          {dataSource.map(this._renderTab)}
        </AnimatedView>
      );
    }
    return dataSource.map(this._renderTab);
  };

  _renderUnderline = () => {
    const { activeColor, underlineStyle } = this.props;
    const { backgroundColor } = StyleSheet.flatten([underlineStyle]);
    return (
      <AnimatedUnderline
        style={[
          underlineStyle,
          {
            width: this.state.underlineWidth,
            transform: [{ translateX: Animated.add(this.state.scrollX, this.state.underlineLeft) }],
          },
        ]}
        color={backgroundColor || activeColor}
      />
    );
  };

  render() {
    const {
      accessibilityLabel,
      style,
      wrapperStyle,
      tabContentStyle,
      dataSource,
      tabPosition,
      swipeable,
      maxItem,
      background,
      preload,
      preloadTimeout,
      renderPlaceholder,
      children,
    } = this.props;
    const showMask = this.state.activeIndex <= dataSource.length - maxItem;
    const tabsComponent = (
      <StyledTab
        key="Tabs"
        style={[style, { backgroundColor: background }]}
        {...this._panResponder.panHandlers}
      >
        {this._renderTabs()}
        {this._renderUnderline()}
        <TabMask visible={this.isMultiScreen && showMask} color={background} />
      </StyledTab>
    );
    if (React.Children.count(children) > 0) {
      const content = [
        tabsComponent,
        <TabContent
          key="TabContent"
          accessibilityLabel={accessibilityLabel}
          style={tabContentStyle}
          activeIndex={this.state.activeIndex}
          disabled={!swipeable}
          preload={preload}
          preloadTimeout={preloadTimeout}
          renderPlaceholder={renderPlaceholder}
          onMove={this._handleTabContentMove}
          onRelease={this._handleTabContentRelease}
        >
          {this.props.children}
        </TabContent>,
      ];
      if (tabPosition === 'bottom') content.reverse();
      return <View style={[{ flex: 1 }, wrapperStyle]}>{content}</View>;
    }
    return tabsComponent;
  }
}
