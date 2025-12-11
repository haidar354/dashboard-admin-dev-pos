<script setup lang="ts">
import { VCard, VCardText, VCardTitle, VCol, VRow } from 'vuetify/lib/components/index.mjs'

definePage({
  meta: {
    name: 'Sales Returns',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle>Sales Returns</VCardTitle>
          <VCardText>
            <div class="text-center py-8">
              <h2>Under Construction</h2>
              <p>This page is currently under development.</p>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
