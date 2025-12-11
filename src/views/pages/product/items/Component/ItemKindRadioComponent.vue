<script setup lang="ts">
import { itemTypes } from '@/constants/inventory/material'
import type { CustomInputContent } from '@core/types'

const props = defineProps<{
  readonly?: boolean
  rules?: any[]
  errorMessages?: any[] | string
  items?: typeof itemTypes[number][]
}>()

const contentList = computed(() => {
  if (props.items)
    return props.items

  return itemTypes
})

const radioContent: CustomInputContent[] = contentList.value.map(item => ({
  title: item.title,
  desc: item.desc,
  value: item.value,
  icon: { icon: item.icon, size: '28' },
}))

const selectedRadio = ref('raw')
</script>

<template>
  <CustomRadiosWithIcon
    v-model:selected-radio="selectedRadio"
    :radio-content="radioContent"
    :grid-column="{ sm: contentList.length === 4 ? '3' : contentList.length === 3 ? '4' : '6', cols: '12' }"
    :readonly="readonly"
    :rules="rules"
    :error-messages="errorMessages"
  />
</template>
