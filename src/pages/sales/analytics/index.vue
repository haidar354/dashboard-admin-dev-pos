<script setup lang="ts">
definePage({
  meta: {
    name: 'Analitik Penjualan',
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
        icon="tabler-chart-dots"
        size="100"
        color="primary"
        class="mb-6"
      />
      <h1 class="text-h3 mb-4">
        Analitik Penjualan
      </h1>
      <p
        class="text-body-1 text-medium-emphasis mb-6 text-center"
        style="max-width: 500px;"
      >
        Halaman analitik penjualan sedang dalam pengembangan. Anda akan dapat melihat insights mendalam, trends, dan perbandingan performa penjualan.
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
