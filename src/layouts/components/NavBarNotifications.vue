<script lang="ts" setup>
import Notifications from '@/layouts/components/Notifications.vue'
import { useAuthStore } from '@/stores/authStore'

import type { ApiResponse } from '@/types/api/response'
import type { Notification } from '@/types/models/notification'

const dialog = ref(false)
const authStore = useAuthStore()
const { isLogin } = storeToRefs(authStore)

const requestQuery = ref({

})

const notificationData = ref<Notification[]>([])

const selectedNotification = ref<Notification | null>(null)

const notificationColorResolver = (type: string): string => {
  if (type === 'course-task')
    return 'warning'
  else if (type === 'course-content')
    return 'primary'
  else if (type === 'announcement')
    return 'info'

  return 'info'
}

const notificationIconResolver = (type: string): string => {
  if (type === 'course-task')
    return 'tabler-file-pencil'
  else if (type === 'course-content')
    return 'tabler-book'
  else if (type === 'announcement')
    return 'tabler-speakerphone'

  return 'tabler-speakerphone'
}

const getNotification = async () => {
  await $rootAPI<ApiResponse<Notification[]>>('notification/notifications', {
    query: requestQuery.value,
  })
    .then(response => {
      notificationData.value = response.data.map((notif: any) => {
        return {
          icon: notificationIconResolver(notif.type),
          color: notificationColorResolver(notif.type),
          id: notif.notificationId,
          title: notif.title,
          subtitle: notif.desc,
          htmlContent: notif.htmlContent,
          time: notif.time,
          isRead: notif.isRead,
          type: notif.type,
        }
      })
    })
}

const removeNotification = (notificationId: string) => {
  notificationData.value.forEach((item, index) => {
    if (notificationId === item.id)
      notificationData.value.splice(index, 1)
  })
}

const markRead = (notificationId: string[]) => {
  notificationData.value.forEach(item => {
    notificationId.forEach(id => {
      if (id === item.id)
        item.isRead = true
    })
  })
}

const markReadAll = async () => {
  await $rootAPI<ApiResponse<any>>('notification/notifications/read-all', {
    method: 'POST',
  })
    .then(() => {
      notificationData.value.forEach(item => {
        item.isRead = true
      })
    })
}

const handleNotificationClick = async (notification: Notification) => {
  dialog.value = true
  selectedNotification.value = notification
  if (!notification.isRead) {
    await $rootAPI<ApiResponse<any[]>>(`notification/notifications/${notification.id}/read`, {
      method: 'POST',
    })
  }
  markRead([notification.id])
}

onMounted(() => {
  if (isLogin.value)
    getNotification()
})
</script>

<template>
  <div>
    <Notifications
      :notifications="notificationData"
      @remove="removeNotification"
      @read="markRead"
      @read-all="markReadAll"
      @click:notification="handleNotificationClick"
    />

    <VDialog
      v-model="dialog"
      width="500px"
    >
      <VCard :title="selectedNotification?.title">
        <VCardText v-html="selectedNotification?.htmlContent" />

        <VCardActions>
          <VSpacer />

          <VBtn
            text="Tutup"
            @click="dialog = false"
          />
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
