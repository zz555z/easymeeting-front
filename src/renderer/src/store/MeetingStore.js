import { update } from 'js-md5'
import { defineStore } from 'pinia'
export const useMeetingStore = defineStore('meetingInfo', {
  state: () => {
    return {
      lastUpdate: null,
      inMeeting: false
    }
  },
  actions: {
    updateMeeting(inMeeting) {
      this.lastUpdate = new Date().getTime()
      this.inMeeting = inMeeting
    }
  }
})
