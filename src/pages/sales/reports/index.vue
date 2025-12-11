<script setup lang="ts">
definePage({
  meta: {
    name: 'Laporan Penjualan',
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
        icon="tabler-report-analytics"
        size="100"
        color="primary"
        class="mb-6"
      />
      <h1 class="text-h3 mb-4">
        Laporan Penjualan
      </h1>
      <p
        class="text-body-1 text-medium-emphasis mb-6 text-center"
        style="max-width: 500px;"
      >
        Halaman laporan penjualan sedang dalam pengembangan. Anda akan dapat melihat laporan komprehensif tentang penjualan berdasarkan periode, channel, dan outlet.
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
