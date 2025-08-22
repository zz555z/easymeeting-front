import { update } from 'js-md5'
import { defineStore } from 'pinia'
export const useMeetingStore = defineStore('meetingInfo', {
  state: () => {
    return {
      lastUpdate: null,
      inMeeting: false,
      noReadChatCount: 0,
      chatOpen: false,
      allMemberList: [],
      memberList: []
    }
  },
  actions: {
    updateMeeting(inMeeting) {
      this.lastUpdate = new Date().getTime()
      this.inMeeting = inMeeting
    },
    addNoReadChatCount() {
      if (this.chatOpen) {
        return
      }
      this.noReadChatCount++
    },
    updateChatOpen(open) {
      if (open) {
        this.noReadChatCount = 0
      }
      this.chatOpen = open
    },
    setAllMemberList(allMemberList) {
      this.allMemberList = allMemberList
    },
    setMemberList(memberList) {
      this.memberList = memberList
    }
  }
})
