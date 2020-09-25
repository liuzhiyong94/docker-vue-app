"use strict";

import Vue from 'vue';
import axios from "axios";
import { Loading } from 'element-ui';

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';


let config = {
  // baseURL: process.env.baseURL || process.env.apiUrl || "",
  baseURL: "/",
  timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
  headers: {
    // Authorization: "Bearer " + sessionStorage.getItem("JwtToken"),
  }
};

// let loadingInstance = null;

const _axios = axios.create(config);

// const ReqGroup = ["DrugListPlus", "GetDruglist"];

_axios.interceptors.request.use(
  function (config) {

    if (sessionStorage.getItem("UserInfo")) {
      config.headers["userid"] = JSON.parse(
        uncompileStr(sessionStorage.getItem("UserInfo"))
      ).id
    }
    config.headers["Authorization"] = "Bearer " + sessionStorage.getItem("JwtToken")
    // Do something before request is sent
    // if (ReqGroup.indexOf(config.url) >= 0) {

    // }
    // else {
    //   loadingInstance = Loading.service();
    // }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
_axios.interceptors.response.use(
  function (response) {
    if (response.data.code == "4042") {
      sessionStorage.setItem("JwtToken", "");
      sessionStorage.setItem("UserInfo", "");
      location.reload();
    }
    // loadingInstance.close();
    // Do something with response data
    return response.status == 200 ? response.data : response.statusText;
  },
  function (error) {
    // loadingInstance.close();
    // Do something with response error
    return Promise.reject(error);
  }
);

Plugin.install = function (Vue) {
  Vue.axios = _axios;
  window.axios = _axios;
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios;
      }
    },
    $axios: {
      get() {
        return _axios;
      }
    },
  });
};

Vue.use(Plugin)

export default Plugin;

function uncompileStr(code) {
  code = unescape(code);
  var c = String.fromCharCode(code.charCodeAt(0) - code.length);
  for (var i = 1; i < code.length; i++) {
    c += String.fromCharCode(code.charCodeAt(i) - c.charCodeAt(i - 1));
  }
  return c;
}