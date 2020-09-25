import Vue from 'vue'
import Vuex from 'vuex'
import persistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
    SetFileid(state, params) {
      state.fileid = params;
    },
    SetFilepath(state, params) {
      state.filepath = params;
    },
    setHeight(state, params) {
      state.h_height = params;
    },
  },
  actions: {
  },
  modules: {
  },
  plugins: [persistedState()]
})
