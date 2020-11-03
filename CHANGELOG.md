# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.0.0"></a>
# [2.0.0](http://code.registry.wgine.com/TuyaRN/tuya-native-kit/compare/v1.1.8...v2.0.0) (2020-11-03)


### Code Refactoring

* **TYSdk:** kit 内外部对齐 ([f501ff1](f501ff1))


### Features

* **TYSdk.device:** add getDeviceState method ([ef83010](ef83010))
* **TYSdk.device:** add getFunConfig & getUnpackPanelInfo method ([d9e64f5](d9e64f5))


### BREAKING CHANGES

* **TYSdk:** 移除exApi & TYNative 更名为 TYSdk



<a name="1.1.8"></a>
## [1.1.8](http://code.registry.wgine.com/TuyaRN/tuya-native-kit/compare/v1.1.7...v1.1.8) (2020-09-14)


### Features

* **I18N:** 兼容 app 3.20 版本安卓/IOS 地区多语言 key 变动 ([4d75acb](4d75acb))



<a name="1.1.7"></a>
## [1.1.7](http://code.registry.wgine.com/TuyaRN/tuya-native-kit/compare/v1.1.6...v1.1.7) (2020-08-12)


### Bug Fixes

* **getDpDataFromDevice:** sigmesh 设备内部调用 getDpDataFromMeshDevice ([cc9b24c](cc9b24c))



<a name="1.1.6"></a>
## [1.1.6](http://code.registry.wgine.com/TuyaRN/tuya-native-kit/compare/v1.1.5...v1.1.6) (2020-02-27)


### Bug Fixes

* react / react-native 依赖移至 peerDependencies ([e876b66](e876b66))


### Features

* **uiIdNav:** 新增面板跳面板相关方法封装 ([30a5209](30a5209))



<a name="1.1.5"></a>
## [1.1.5](http://code.registry.wgine.com/TuyaRN/tuya-native-kit/compare/v1.1.4...v1.1.5) (2019-12-17)


### Bug Fixes

* **exApi:** 低版本引入RNFetchBlob崩溃问题修复 ([1c2172c](1c2172c))



<a name="1.1.4"></a>
## [1.1.4](http://code.registry.wgine.com/TuyaRN/tuya-native-kit/compare/v1.1.3...v1.1.4) (2019-12-11)


### Bug Fixes

* **exApi:** 修复uploadImageFile判断系统bug ([9f51585](9f51585))



<a name="1.1.3"></a>
## [1.1.3](http://code.registry.wgine.com/TuyaRN/tuya-native-kit/compare/v1.1.2...v1.1.3) (2019-12-10)


### Features

* **api:** 增加文件上传签名接口3.0及图片上传接口 ([9eb6f1a](9eb6f1a))



<a name="1.1.2"></a>
## [1.1.2](http://code.registry.wgine.com/TuyaRN/tuya-native-kit/compare/v1.1.1...v1.1.2) (2019-11-23)


### Bug Fixes

* **exApi:** 修复 removeTimer 接口群组bug ([ba74d85](ba74d85))



<a name="1.1.1"></a>
## [1.1.1](http://code.registry.wgine.com/TuyaRN/tuya-native-kit/compare/v1.1.0...v1.1.1) (2019-11-12)


### Features

* **I18N:** 避免由于定义顺序问题导致默认语言包不为英文的bug ([0204e5e](0204e5e))



<a name="1.1.0"></a>
# [1.1.0](http://code.registry.wgine.com/TuyaRN/tuya-native-kit/compare/v1.0.16...v1.1.0) (2019-09-24)


### Bug Fixes

* **API:** 缓存组件渲染完毕之前收到的消息推送 ([672a2ab](672a2ab))
* **API:** 设备属性判断统一为使用capability，避免设备类型判断错误 ([4b4b023](4b4b023))


### Features

* **API:** 增加IOS13蓝牙权限相关接口 ([b6e5e8f](b6e5e8f))
* **ExAPI:** 定时相关接口支持自定义devInfo(为了子设备定时) ([63a6500](63a6500))
* **ExApi:** 额外暴露TYNative.request方法 / getDpsInfos updateDpName 自适应群组设备 ([5505efd](5505efd))



<a name="1.0.16"></a>
## [1.0.16](http://code.registry.wgine.com/TuyaRN/tuya-native-kit/compare/v1.0.15...v1.0.16) (2019-06-03)


### Features

* add accessibilityLabel to android PickerView ([7932222](7932222))



<a name="1.0.15"></a>
## [1.0.15](http://code.registry.wgine.com/TuyaRN/tuya-native-kit/compare/v1.0.13...v1.0.15) (2019-04-01)


### Bug Fixes

* fix syntax error ([3778779](3778779))
* 修复陈年老bug ([a5f559d](a5f559d))
* 避免emit内部事件类型 ([bc69d0e](bc69d0e))


### Features

* 功能点配置统一放置于 panelConfig 中 ([946fe12](946fe12))
* 增加群组相关接口支持 ([9374b4b](9374b4b))
