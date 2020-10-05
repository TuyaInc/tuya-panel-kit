const { MOCK_NATIVE_MODULES } = require('./constant');

jest.mock('react-native', () => {
  const OS = process.env.RN_JEST_PLATFORM || 'ios';
  return {
    NativeModules: MOCK_NATIVE_MODULES,

    /**
     * For Android
     */
    DeviceEventEmitter: {
      addListener: jest.fn(),
    },

    /**
     * For IOS
     */
    NativeAppEventEmitter: {
      addListener: jest.fn(),
    },
    Platform: {
      OS,
      select: platforms => () => {
        if (typeof platforms[OS] === 'function') {
          return platforms[OS]();
        }
        return {};
      },
    },
    AlertIOS: {
      prompt: jest.fn(),
    },
  };
});
