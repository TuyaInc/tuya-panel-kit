import { MOCK_ORIG_DEV_INFO } from './constant';

// eslint-disable-next-line import/prefer-default-export
export const createDevInfo = extra => {
  return {
    ...MOCK_ORIG_DEV_INFO,
    ...extra,
  };
};
