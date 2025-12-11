<script setup lang="ts">
import { useRouter } from 'vue-router'

// Redirect ke halaman utama pos
const router = useRouter()
router.push('/pos')
</script>

<template>
  <div>Redirecting...</div>
</template>
