<script setup lang="ts">
definePage({
  meta: {
    name: 'Performa Pelanggan',
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
  <VCard>
    <VCardText
      class="d-flex flex-column align-center justify-center"
      style="min-height: 60vh;"
    >
      <VIcon
        icon="tabler-user-star"
        size="100"
        color="primary"
        class="mb-6"
      />
      <h1 class="text-h3 mb-4">
        Performa Pelanggan
      </h1>
      <p
        class="text-body-1 text-medium-emphasis mb-6 text-center"
        style="max-width: 500px;"
      >
        Halaman performa pelanggan sedang dalam pengembangan. Anda akan dapat melihat customer lifetime value, segmentasi pelanggan, dan behavior analysis.
      </p>
      <VChip
        color="warning"
        variant="tonal"
        size="large"
      >
        <VIcon
          icon="tabler-tool"
          start
        />
        Under Construction
      </VChip>
    </VCardText>
  </VCard>
</template>
