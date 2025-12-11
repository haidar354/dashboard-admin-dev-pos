<script setup lang="ts">
import { useTheme } from 'vuetify'
import { hexToRgb } from '@/@layouts/utils'
import { useAuthStore } from '@/stores/authStore'
import congoImg from '@images/illustrations/congo-illustration.png'

const vuetifyTheme = useTheme()

const primaryColor = computed(() => {
  return `rgba(${hexToRgb(vuetifyTheme.current.value.colors.primary)},90%)`
})

const appName = import.meta.env.VITE_APPS_NAME
const authStore = useAuthStore()
const { userData } = storeToRefs(authStore)
</script>

<template>
  <div
    class="header-container"
    :style="{ '--primary': primaryColor }"
  >
    <div class="background-container">
      <svg
        class="background-svg"
        viewBox="0 0 1124 122"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id="filter0_d_8093_14016"
            x="0"
            y="0"
            width="1160"
            height="183.335"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood
              flood-opacity="0"
              result="BackgroundImageFix"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="9" />
            <feComposite
              in2="hardAlpha"
              operator="out"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.294118 0 0 0 0 0.27451 0 0 0 0 0.360784 0 0 0 0.1 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_8093_14016"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_8093_14016"
              result="shape"
            />
          </filter>
          <pattern
            id="pattern0_8093_14016"
            patternContentUnits="objectBoundingBox"
            width="1"
            height="1"
          >
            <use
              xlink:href="#image0_8093_14016"
              transform="scale(0.00248139 0.00195366)"
            />
          </pattern>
        </defs>
        <g filter="url(#filter0_d_8093_14016)">
          <rect
            class="background-rect"
            width="100%"
            height="122"
            rx="6"
            shape-rendering="crispEdges"
          />
          <mask
            id="mask0_8093_14016"
            style="mask-type: alpha;"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="100%"
            height="122"
          >
            <rect
              width="100%"
              height="122"
              rx="6"
              fill="#D9D9D9"
            />
          </mask>
          <g mask="url(#mask0_8093_14016)">
            <path
              d="M79.86 53.8471C58.272 26.6663 -44.5495 21.7957 -93.2618 22.758L-101.248 128.785L240.745 146.941C246.196 135.165 245.359 110.566 198.404 106.37C139.711 101.126 106.845 87.8232 79.86 53.8471Z"
              fill="white"
              fill-opacity="0.27"
            />
            <path
              d="M84.0892 72.6802C64.4187 51.0278 -21.4596 51.5168 -61.9399 54.4679V143H223.821C227.62 132.966 225.381 112.545 186.04 111.128C136.864 109.358 108.677 99.7457 84.0892 72.6802Z"
              fill="white"
            />
            <path
              d="M983.563 34.2078C989.823 62.8616 1055.17 102.763 1101.92 126.87C1114.97 133.6 1131.04 128.587 1138.48 115.937L1164.98 70.8492C1172.81 57.5172 1168.22 40.5985 1154.72 33.0603L897.034 -110.802C886.865 -116.479 872.149 -115.173 871.193 -103.666C870.322 -93.1755 876.621 -79.5134 900.276 -65.1633C950.658 -34.6006 974.304 -8.18115 983.563 34.2078Z"
              fill="white"
              fill-opacity="0.27"
            />
          </g>
          <rect
            x="35"
            y="-25"
            width="116"
            height="147.335"
            fill="url(#pattern0_8093_14016)"
          />
        </g>
      </svg>
    </div>
    <div class="user-container">
      <img
        :src="congoImg"
        alt="Congo Illustration"
        class="user-img"
      >
    </div>
    <div class="greeting-container">
      <div class="greeting-welcome d-none d-sm-block">
        Selamat Datang, {{ userData.profile?.name }}
      </div>
      <div class="greeting-system-name">
        {{ appName }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header-container {
  position: relative;
  block-size: 122px;
  inline-size: 100%;
}

.background-container {
  position: absolute;
  block-size: 100%;
  inline-size: 100%;
  inset-block-start: 0;
  inset-inline-start: 0;
}

.background-svg {
  block-size: 100%;
  inline-size: 100%;
}

.user-container {
  position: relative;
  z-index: 1;
  inline-size: 100px;
  inset-block-start: -20px;
  inset-inline-start: 20px;
}

.user-img {
  block-size: 142px;
  inline-size: 100px;
}

.greeting-container {
  position: absolute;
  z-index: 1;
  font-size: medium;
  inset-block-start: 30px;
  inset-inline-start: 150px;
}

.greeting-welcome {
  color: #fff;
  font-size: large;
}

.greeting-system-name {
  color: #e4e4e4;
  font-size: medium;
}

.background-rect {
  fill: var(--primary);
}
</style>
