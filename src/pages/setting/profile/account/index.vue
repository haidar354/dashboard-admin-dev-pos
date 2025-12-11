<script setup lang="ts">
import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import { VIcon } from 'vuetify/components/VIcon'
import { useAccountStore } from '@/stores/accountStore'

definePage({
  meta: {
    name: 'Profil Akun',
    rules: [
      {
        action: 'manage',
        subject: 'Lihat Profil Akun',
      },
      {
        action: 'manage',
        subject: 'Lihat Semua Profil Akun',
      },
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

dayjs.locale(id)

const accountStore = useAccountStore()
const { isLoadingFetchData, userAccount } = storeToRefs(accountStore)

onMounted(() => {
  accountStore.fetchDetailAndSetForm()
})
</script>

<template>
  <div>
    <VSkeletonLoader
      v-if="isLoadingFetchData"
      type="card,divider,card,divider,card"
    />
    <template v-else>
      <!-- Header Card -->
      <VCard class="mb-6">
        <VCardItem>
          <VCardTitle class="d-flex justify-space-between flex-wrap gap-2">
            <div class="d-flex align-center gap-3">
              <span>Profil Akun</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <VBtn
                v-if="$can('manage', 'Edit Profil Akun') || $can('manage', 'default')"
                color="error"
                variant="outlined"
                :to="{
                  name: 'setting-profile-account-password',
                }"
              >
                <VIcon
                  start
                  icon="tabler-key"
                />
                Ubah Password
              </VBtn>
              <VBtn
                v-if="$can('manage', 'Edit Profil Akun') || $can('manage', 'default')"
                color="primary"
                variant="outlined"
                :to="{
                  name: 'setting-profile-account-edit',
                }"
              >
                <VIcon
                  start
                  icon="tabler-edit"
                />
                Edit Profil Akun
              </VBtn>
            </div>
          </VCardTitle>
        </VCardItem>

        <VCardText>
          <div class="d-flex gap-6 flex-column flex-md-row">
            <!-- Outlet Image -->
            <div class="flex-shrink-0">
              <VAvatar
                size="200"
                rounded
              >
                <VImg
                  v-if="userAccount.avatar"
                  :src="userAccount.avatar"
                />
                <VIcon
                  v-else
                  icon="tabler-user"
                  size="200"
                />
              </VAvatar>
            </div>

            <!-- Outlet Information -->
            <div class="flex-grow-1">
              <div class="d-flex align-center gap-3 mb-3">
                <div class="text-h4 font-weight-bold">
                  {{ userAccount.name }}
                </div>
              </div>

              <VRow class="mb-4">
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-3">
                    <div class="text-body-2 text-medium-emphasis mb-1">
                      <VIcon
                        icon="tabler-mail"
                        size="16"
                        class="me-1"
                      />
                      Email
                    </div>
                    <div class="text-body-1">
                      {{ userAccount.email || '-' }}
                    </div>
                  </div>
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-3">
                    <div class="text-body-2 text-medium-emphasis mb-1">
                      <VIcon
                        icon="tabler-calendar"
                        size="16"
                        class="me-1"
                      />
                      Dibuat Pada
                    </div>
                    <div class="text-body-1">
                      {{ dayjs(userAccount.createdAt).format('DD MMMM YYYY, HH:mm') }}
                    </div>
                  </div>
                </VCol>

                <VCol cols="12">
                  <div class="mb-3">
                    <div class="text-body-2 text-medium-emphasis mb-1">
                      <VIcon
                        icon="tabler-phone"
                        size="16"
                        class="me-1"
                      />
                      No. Telepon
                    </div>
                    <div class="text-body-1">
                      {{ userAccount.phone || '-' }}
                    </div>
                  </div>
                </VCol>
              </VRow>
            </div>
          </div>
        </VCardText>
      </VCard>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.border-b {
  border-block-end: 1px solid rgb(var(--v-theme-surface-variant));
}
</style>
