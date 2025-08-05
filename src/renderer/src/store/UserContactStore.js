import { defineStore } from 'pinia'
export const useContactStore = defineStore('userContact', {
  state: () => {
    return {
      lastUpdateTime: null
    }
  },
  actions: {
    updateLastUpdateTime() {
      this.lastUpdateTime = new Date().getTime()
    }
  }
})
