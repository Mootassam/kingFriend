

import { AuthToken } from 'src/modules/auth/authToken';
import Axios from 'axios';
// import config from 'src/config'; 
import { getLanguageCode } from 'src/i18n';
import Qs from 'qs';
import moment from 'moment';

const authAxios = Axios.create({
  // baseURL: "http://localhost:8082/api",
  baseURL: "/api", // nginx forwards /api to the backend container
  // baseURL: "http://72.62.210.173:8083/api",

  paramsSerializer: function (params) {
    return Qs.stringify(params, {
      arrayFormat: 'brackets',
      filter: (prefix, value) => {
        if (
          moment.isMoment(value) ||
          value instanceof Date
        ) {

          return value.toISOString();
        }
        return value;
      },
    });
  },
});

authAxios.interceptors.request.use(
  async function (options) {
    const token = AuthToken.get();
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    options.headers['ngrok-skip-browser-warning'] = 'true';
    options.headers['Accept-Language'] = getLanguageCode();
    return options;
  },
  function (error) {
    console.log('Request error: ', error);
    return Promise.reject(error);
  },
);

export default authAxios;
