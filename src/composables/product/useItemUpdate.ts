import { storeToRefs } from 'pinia'
import { computed, nextTick, ref, watch } from 'vue'
import { normalizeItemResponse } from '@/composables/product/item-normalizer'
import { useUnitStore } from '@/stores/global/unitStore'
import { useOutletStore } from '@/stores/outletStore'
import { useItemCategoryStore } from '@/stores/product/itemCategoryStore'
import { useItemSkuStore } from '@/stores/product/itemSkuStore'
import { useItemStore } from '@/stores/product/itemStore'
import { useModifierStore } from '@/stores/product/modifierStore'

import type { Outlet } from '@/types/models/outlet'
import type { ItemImage } from '@/types/models/product/item-image'
import type {
  BomPayload,
  ConfigPayload,
  ModifierPayload,
  OutletPayload,
  SkuPayload,
  UnitPayload,
  VariantPayload,
  VariantUnitPayload,
} from '@/types/models/product/item-payload'

/* ---------------------------------
 * Utils
 * --------------------------------- */

const slugify = (s: string) =>
  s.toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 64)

const debounce = <T extends (...args: any[]) => void>(fn: T, delay = 250): T => {
  let timer: ReturnType<typeof setTimeout>

  return ((...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}

const buildSkuDisplayName = (itemName: string, variant?: VariantPayload, unit?: UnitPayload) => {
  const parts: string[] = []
  if (itemName)
    parts.push(itemName.trim())
  if (variant?.options?.length)
    parts.push(variant.options.map(o => o.value.replace(/-/g, ' ')).join(' – '))
  if (unit?.unit?.code)
    parts.push(`(${unit.unit.code})`)

  return parts.join(' ').trim() || '-'
}

const buildSkuCode = (itemName: string, variant?: VariantPayload, unit?: UnitPayload) => {
  const base = slugify(itemName)
  const variantPart = variant?.options?.map(o => slugify(o.value)).join('-')
  const unitPart = unit?.unit?.code ? slugify(unit.unit.code) : ''

  return [base, variantPart, unitPart].filter(Boolean).join('-').toUpperCase()
}

/* ---------------------------------
 * Composable (EDIT)
 * --------------------------------- */
export function useItemUpdate() {
  // === Stores ===
  const itemStore = useItemStore()
  const outletStore = useOutletStore()
  const unitStore = useUnitStore()
  const categoryStore = useItemCategoryStore()
  const modifierStore = useModifierStore()
  const itemSkuStore = useItemSkuStore()

  const {
    updateForm,
    updateFormErrors,
    isLoadingUpdate,
    variantGroups,
    isInitializingUpdate: isInitializing,
    isReadyToGenerateUpdate: isReadyToGenerate,
  } = storeToRefs(itemStore)

  const { data: units, isLoadingFetchData: isLoadingUnits } = storeToRefs(unitStore)
  const { data: outlets, isLoadingFetchData: isLoadingOutlets } = storeToRefs(outletStore)
  const { data: itemCategories, isLoadingFetchData: isLoadingCategories } = storeToRefs(categoryStore)
  const { data: modifiers, isLoadingFetchData: isLoadingModifiers } = storeToRefs(modifierStore)
  const { data: materials, isLoadingFetchData: isLoadingMaterials } = storeToRefs(itemSkuStore)

  const outletsData = computed<OutletPayload[]>(() =>
    (outlets.value || []).map(o => ({
      outletId: o.outletId,
      isActive: true,
      sortOrder: null,
      name: o.name,
    })),
  )

  const defaultUnit = computed<UnitPayload | undefined>(() => {
    return updateForm.value.units?.find(u => u.isBase)
  })

  /* ---------------------------------
   * Global config sync
   * --------------------------------- */
  watch(
    [() => updateForm.value.config, () => updateForm.value.useSameConfig],
    ([cfg, same]) => {
      if (!same)
        return
      updateForm.value.skus.forEach(sku => (sku.config = { ...cfg }))
    },
    { deep: true },
  )

  watch(
    () => updateForm.value.useSameConfig,
    same => {
      if (!same)
        return
      updateForm.value.skus.forEach(sku => (sku.config = { ...updateForm.value.config }))
    },
  )

  const applyGlobalConfigToAll = () => {
    updateForm.value.skus.forEach(sku => (sku.config = { ...updateForm.value.config }))
  }

  const deriveGlobalConfig = (skus: SkuPayload[]): ConfigPayload => {
    if (!skus.length)
      return { ...updateForm.value.config }
    const base = { ...skus[0].config }
    for (const sku of skus) {
      for (const key in base) {
        if (sku.config?.[key as keyof ConfigPayload] !== base[key as keyof ConfigPayload]) {
          ;(base as any)[key] = undefined
        }
      }
    }

    return base
  }

  const resetSkuToGlobal = (sku: SkuPayload) => {
    sku.config = { ...updateForm.value.config }
  }

  /* ---------------------------------
   * Factories
   * --------------------------------- */
  const makeOutlet = (outlet: Outlet): OutletPayload => ({
    outletId: outlet.outletId,
    isActive: true,
    name: outlet.name,
  })

  const makeUnit = (isBase = false): UnitPayload => ({
    tempId: crypto.randomUUID(),
    unitId: '',
    conversion: 1,
    minSalesQty: 1,
    isBase,
    isStock: isBase,
    isPurchase: isBase,
    isSales: isBase,
    isTransfer: isBase,
  })

  const makeImage = (): ItemImage => ({
    itemImageId: crypto.randomUUID(),
    imageKeyOriginal: '',
    imageKeyMedium: null,
    imageKeySmall: null,
    imageUrlOriginal: '',
    title: null,
    isPrimary: false,
    isActive: true,
  })

  const makeModifier = (): ModifierPayload => ({
    tempId: crypto.randomUUID(),
    modifierGroupId: '',
    isActive: true,
    isRequired: false,
    sortOrder: (updateForm.value.modifiers?.length || 0) + 1,
  })

  const makeBom = (): BomPayload => ({
    yield: 1,
    notes: '',
    lines: [],
  })

  /* ---------------------------------
   * SKU regeneration (stable)
   * --------------------------------- */
  // generated combinations (variant x unit) that are not yet persisted
  const generatedSkus = ref<SkuPayload[]>([])

  const regenerateSkus = debounce(() => {
    const itemUnits = updateForm.value.units || []
    const variants = updateForm.value.variants || []
    const variantUnits = updateForm.value.variantUnits || []
    const hasVariant = updateForm.value.hasVariant || (!!variants && variants.length > 0)
    const existingSkus = updateForm.value.skus || []

    const newSkus: SkuPayload[] = []

    console.log('[useItemUpdate] regenerateSkus called', {
      name: updateForm.value.name,
      hasVariant,
      variants: variants.length,
      units: itemUnits.length,
      existingSkus: existingSkus.length,
    })

    const findExistingSku = (variant?: VariantPayload, unit?: UnitPayload) => {
      const code = buildSkuCode(updateForm.value.name, variant, unit)

      return existingSkus.find(s => s.code === code) ?? null
    }

    if (!hasVariant || !variants.length) {
      for (const u of itemUnits) {
        const existing = findExistingSku(undefined, u)
        const old = !!existing?.itemSkuId

        newSkus.push({
          tempId: existing?.itemSkuId ?? crypto.randomUUID(),
          itemSkuId: existing?.itemSkuId,
          displayName: buildSkuDisplayName(updateForm.value.name, undefined, u),
          code: buildSkuCode(updateForm.value.name, undefined, u),
          barcode: existing?.barcode ?? '',
          isActive: existing?.isActive ?? true,
          unitTempId: u.tempId,
          itemUnitId: u.itemUnitId,
          variantUnitTempId: undefined,
          itemVariantUnitId: undefined,
          config: old ? { ...existing!.config } : { ...updateForm.value.config },
          cost: old
            ? {
                ...existing!.cost,
                cost: existing!.cost?.cost ?? 0,
                lastCost: existing!.cost?.lastCost ?? 0,
                method: existing!.cost?.method ?? 'FIFO',
              }
            : { cost: 0, lastCost: 0, method: 'FIFO' },
          price: old
            ? {
                ...existing!.price,
                price: existing!.price?.price ?? 0,
                taxInclusive: existing!.price?.taxInclusive ?? false,
                qtyThreshold: existing!.price?.qtyThreshold ?? 1,
              }
            : { price: 0, taxInclusive: false, qtyThreshold: 1 },
          bom: old
            ? {
                ...existing!.bom,
                yield: existing!.bom?.yield ?? 1,
                notes: existing!.bom?.notes ?? '',
                lines: existing!.bom?.lines ?? [],
              }
            : { yield: 1, notes: '', lines: [] },
          overrides: old ? [...(existing!.overrides ?? [])] : [],
        })
      }
    }
    else {
      for (const v of variants) {
        for (const u of itemUnits) {
          const matchedVarUnit = variantUnits.find(
            vu => vu.variantTempId === v.tempId && vu.unitTempId === u.tempId,
          )

          const existing = findExistingSku(v, u)

          // 💣 JANGAN generate baru saat init
          console.log('isInitializing.value', isInitializing.value)
          if (!existing && isInitializing.value)
            continue

          const old = !!existing?.itemSkuId

          newSkus.push({
            tempId: existing?.itemSkuId ?? crypto.randomUUID(),
            itemSkuId: existing?.itemSkuId,
            displayName: buildSkuDisplayName(updateForm.value.name, v, u),
            code: buildSkuCode(updateForm.value.name, v, u),
            barcode: existing?.barcode ?? '',
            isActive: existing?.isActive ?? true,
            unitTempId: u.tempId,
            itemUnitId: u.itemUnitId,
            variantUnitTempId: matchedVarUnit?.tempId ?? null,
            itemVariantUnitId: matchedVarUnit?.itemVariantUnitId,
            config: old ? { ...existing!.config } : { ...updateForm.value.config },
            cost: old
              ? { cost: existing!.cost?.cost || 0, lastCost: existing!.cost?.lastCost || 0, method: existing!.cost?.method || 'FIFO' }
              : { cost: 0, lastCost: 0, method: 'FIFO' },
            price: old
              ? { price: existing!.price?.price || 0, taxInclusive: existing!.price?.taxInclusive || false, qtyThreshold: existing!.price?.qtyThreshold || 1 }
              : { price: 0, taxInclusive: false, qtyThreshold: 1 },
            bom: old
              ? { yield: existing!.bom?.yield || 1, notes: existing!.bom?.notes || '', lines: existing!.bom?.lines || [] }
              : { yield: 1, notes: '', lines: [] },
            overrides: old ? [...(existing!.overrides ?? [])] : [],
          })
        }
      }
    }

    // Do NOT overwrite updateForm.value.skus here.
    // Keep generated combinations in a separate ref so UI can show "missing" combos.
    generatedSkus.value = newSkus
    ;(updateForm as any)._generatedSkus = newSkus
    console.log('[useItemUpdate] Generated SKU combinations computed:', generatedSkus.value.length)
  }, 200)

  watch(
    [() => updateForm.value.units, () => updateForm.value.hasVariant, () => updateForm.value.variants, () => updateForm.value.name],
    regenerateSkus,
    { deep: true },
  )

  /* ---------------------------------
   * VariantUnits generator
   * --------------------------------- */
  const generateVariantUnits = () => {
    const variants = updateForm.value.variants || []
    const itemUnits = updateForm.value.units || []
    const prevVariantUnits = updateForm.value.variantUnits || []
    const newVariantUnits: VariantUnitPayload[] = []

    for (const v of variants) {
      for (const u of itemUnits) {
        const existing = prevVariantUnits.find(
          vu => vu.variantTempId === v.tempId && vu.unitTempId === u.tempId,
        )

        newVariantUnits.push({
          tempId: existing?.itemVariantUnitId ?? crypto.randomUUID(),
          itemVariantUnitId: existing?.itemVariantUnitId,
          itemVariantId: existing?.itemVariantId ?? v.itemVariantId,
          itemUnitId: existing?.itemUnitId ?? u.itemUnitId,
          variantTempId: v.tempId,
          unitTempId: u.tempId,
          displayName: buildSkuDisplayName(updateForm.value.name, v, u),
          isActive: existing?.isActive ?? true,
        })
      }
    }

    updateForm.value.variantUnits = newVariantUnits
  }

  /* ---------------------------------
   * VariantGroups builder (for edit)
   * --------------------------------- */
  function buildVariantGroupsFromVariants(variants: VariantPayload[]) {
    const groups: Record<string, Set<string>> = {}
    for (const variant of variants) {
      for (const opt of variant.options || []) {
        if (!groups[opt.axis])
          groups[opt.axis] = new Set()
        groups[opt.axis].add(opt.value)
      }
    }

    return Object.entries(groups).map(([axis, values]) => ({
      tempId: crypto.randomUUID(),
      name: axis,
      options: Array.from(values).map(v => ({
        tempId: crypto.randomUUID(),
        name: v.replace(/-/g, ' '),
        isActive: true,
      })),
    }))
  }

  /* ---------------------------------
   * Initialization
   * --------------------------------- */
  const initializeForm = async (itemId: string) => {
    isInitializing.value = true
    isReadyToGenerate.value = false

    await Promise.all([
      outletStore.fetchAllData(),
      unitStore.fetchAllData(),
      categoryStore.fetchAllData(),
      modifierStore.fetchAllData({ include: ['options'] }),
      itemSkuStore.fetchAllData({ manageStock: true }),
    ])

    const response = await itemStore.fetchDetail(itemId, {
      include: [
        'itemOutlets.outlet',
        'images',
        'category',
        'units.unit',
        'variants',
        'variantUnits',
        'skus',
        'skus.cost',
        'skus.price',
        'modifiers.group.options',
        'salesBom.lines',
      ],
    })

    const normalized = normalizeItemResponse(response.data)

    Object.assign(updateForm.value, normalized)
    variantGroups.value = buildVariantGroupsFromVariants(normalized.variants || [])

    for (const u of updateForm.value.units || []) u.tempId = u.itemUnitId || ''
    for (const v of updateForm.value.variants || []) v.tempId = v.itemVariantId || ''
    for (const vu of updateForm.value.variantUnits || []) {
      vu.tempId = vu.itemVariantUnitId || ''
      vu.variantTempId = vu.itemVariantId || ''
      vu.unitTempId = vu.itemUnitId || ''
    }
    for (const s of updateForm.value.skus || []) {
      s.tempId = s.itemSkuId || ''
      s.unitTempId = s.itemUnitId || ''
      s.variantUnitTempId = s.itemVariantUnitId
    }

    await nextTick()
    setTimeout(() => {
      isReadyToGenerate.value = true
      isInitializing.value = false
      regenerateSkus()
    }, 100)
  }

  const generateVariants = debounce(() => {
    if (!variantGroups.value.length) {
      updateForm.value.variants = []
      regenerateSkus()

      return
    }
    type AttrMap = Record<string, string>
    let acc: AttrMap[] = [{}]

    for (const group of variantGroups.value) {
      const axis = slugify(group.name || 'axis')
      const activeOpts = group.options.filter(o => o.isActive && o.name.trim())
      const next: AttrMap[] = []
      for (const base of acc)
        for (const opt of activeOpts) next.push({ ...base, [axis]: slugify(opt.name) })

      acc = next
    }

    updateForm.value.variants = acc.map((attrs, i): VariantPayload => ({
      tempId: crypto.randomUUID(),
      optionsKey: Object.entries(attrs).map(([axis, value]) => `${axis}:${value}`).join('|'),
      options: Object.entries(attrs).map(([axis, value]) => ({ axis, value })),
      displayName: Object.values(attrs).map(v => v.replace(/-/g, ' ')).join(' – '),
      isActive: true,
      sortOrder: i + 1,
    }))

    generateVariantUnits()
    regenerateSkus()
  }, 250)

  /* ---------------------------------
   * CRUD helpers (unit, variant, modifier, image, bom, outlet)
   * --------------------------------- */
  const addOutlet = (outlet: Outlet) => {
    if (!updateForm.value.outlets.find(o => o.outletId === outlet.outletId))
      updateForm.value.outlets.push(makeOutlet(outlet))
  }

  const removeOutlet = (outletId: string) => {
    updateForm.value.outlets = updateForm.value.outlets.filter(o => o.outletId !== outletId)
  }

  const addUnit = () => {
    updateForm.value.units.push(makeUnit())
    regenerateSkus()
  }

  const removeUnit = (i: number) => {
    updateForm.value.units.splice(i, 1)
    generateVariantUnits()
    regenerateSkus()
  }

  const onChangeUnit = async (i: number) => {
    await nextTick()

    const unit = units.value.find(u => u.unitId === updateForm.value.units[i].unitId)
    const chosenUnitId = unit ? unit.unitId : null
    if (unit && chosenUnitId) {
      updateForm.value.units[i].unit = unit
      generateVariantUnits()
      regenerateSkus()
    }
  }

  const addBlankVariantGroup = () => {
    variantGroups.value.push({
      tempId: crypto.randomUUID(),
      name: '',
      options: [{ tempId: crypto.randomUUID(), name: '', isActive: true }],
    })
  }

  const removeVariantGroup = (i: number) => {
    variantGroups.value.splice(i, 1)
    generateVariants()
  }

  const addBlankVariantGroupOption = (groupIndex: number) => {
    variantGroups.value[groupIndex].options.push({
      tempId: crypto.randomUUID(),
      name: '',
      isActive: true,
    })
  }

  const removeVariantGroupOption = (groupIndex: number, optionIndex: number) => {
    variantGroups.value[groupIndex].options.splice(optionIndex, 1)
    generateVariants()
  }

  watch(variantGroups, generateVariants, { deep: true })

  const addModifier = () => {
    if (updateForm.value.modifiers !== undefined)
      updateForm.value.modifiers.push(makeModifier())
  }

  const removeModifier = (i: number) => {
    if (updateForm.value.modifiers !== undefined)
      updateForm.value.modifiers.splice(i, 1)
  }

  const addImage = () => {
    if (updateForm.value.images !== undefined)
      updateForm.value.images.push(makeImage())
  }

  const removeImage = (i: number) => {
    if (updateForm.value.images !== undefined)
      updateForm.value.images.splice(i, 1)
  }

  const enableBom = () => {
    if (!updateForm.value.bom)
      updateForm.value.bom = makeBom()
    if (!updateForm.value.bom.lines.length) {
      updateForm.value.bom.lines.push({
        materialItemSkuId: '',
        quantity: 1,
        wastePct: 0,
        consumeFromStock: true,
        sortOrder: 1,
        notes: '',
      })
    }
  }

  const disableBom = () => (updateForm.value.bom = null)

  const addBomLine = () => {
    if (!updateForm.value.bom)
      enableBom()
    updateForm.value.bom!.lines.push({
      materialItemSkuId: '',
      quantity: 1,
      wastePct: 0,
      consumeFromStock: true,
      sortOrder: (updateForm.value.bom!.lines.length || 0) + 1,
      notes: '',
    })
  }

  const removeBomLine = (i: number) => updateForm.value.bom?.lines.splice(i, 1)

  const removeSku = (id: string | number) => {
    // Remove SKU by tempId or by index (legacy)
    if (typeof id === 'number') {
      updateForm.value.skus.splice(id, 1)

      return
    }

    updateForm.value.skus = (updateForm.value.skus || []).filter(s => s.tempId !== id && s.itemSkuId !== id)
  }

  const missingCombinations = computed(() => {
    // Compare by SKU code to determine missing combos; codes are deterministic from name+variant+unit
    const existingCodes = new Set((updateForm.value.skus || []).map(s => (s.code || '').toString()))

    // Use generated combinations (from regenerateSkus) and filter out those that already exist by code
    return (generatedSkus.value || []).filter(c => !existingCodes.has((c.code || '').toString()))
  })

  // Debug: log missing combinations when generated or skus change
  watch([generatedSkus, () => updateForm.value.skus], () => {
    try {
      const missing = (generatedSkus.value || []).filter(c => !new Set((updateForm.value.skus || []).map(s => `${s.itemVariantUnitId || ''}__${s.itemUnitId || ''}`)).has(`${c.itemVariantUnitId || ''}__${c.itemUnitId || ''}`))

      console.log('[useItemUpdate] missingCombinations computed:', missing.length)

      // also log sample codes for easier debugging
      if (missing.length)
        console.log('[useItemUpdate] missing sample:', missing.map(m => m.code).slice(0, 5))
    }
    catch (e) {
      console.error('[useItemUpdate] error computing missingCombinations debug', e)
    }
  }, { immediate: true })

  const serverSkus = computed(() => (updateForm.value.skus || []).filter(s => !!s.itemSkuId))
  const localSkus = computed(() => (updateForm.value.skus || []).filter(s => !s.itemSkuId))

  const addSelectedCombinations = (selected: Array<SkuPayload | string | number>) => {
    console.log('[useItemUpdate] addSelectedCombinations called with:', selected)
    if (!selected || !selected.length) {
      console.log('[useItemUpdate] addSelectedCombinations: nothing to add')

      return
    }

    // Add selected combos into updateForm.skus as new (no itemSkuId)
    for (const s of selected) {
      // if the selected item is just a tempId string/number, try to find the object in generatedSkus
      const selObj: SkuPayload | undefined = typeof s === 'string' || typeof s === 'number'
        ? (generatedSkus.value || []).find(g => g.tempId === String(s)) as SkuPayload | undefined
        : s as SkuPayload

      if (!selObj) {
        console.warn('[useItemUpdate] selected item could not be resolved to object:', s)
        continue
      }

      // ensure not duplicate (compare by code)
      const exists = updateForm.value.skus.some(u => (u.code || '').toString() === (selObj.code || '').toString())
      if (!exists) {
        // Resolve itemVariantUnitId: only set it when it's a persisted id present in updateForm.variantUnits
        let resolvedItemVariantUnitId: string | undefined
        if (selObj.itemVariantUnitId) {
          const found = (updateForm.value.variantUnits || []).find(vu => vu.itemVariantUnitId === selObj.itemVariantUnitId)
          if (found && found.itemVariantUnitId)
            resolvedItemVariantUnitId = found.itemVariantUnitId
        }

        // Fallback: if selObj.variantUnitTempId points to a variantUnit in updateForm that has a persisted id, use it
        if (!resolvedItemVariantUnitId && selObj.variantUnitTempId) {
          const found2 = (updateForm.value.variantUnits || []).find(vu => vu.tempId === selObj.variantUnitTempId && vu.itemVariantUnitId)
          if (found2 && found2.itemVariantUnitId)
            resolvedItemVariantUnitId = found2.itemVariantUnitId
        }

        const newSku: SkuPayload = {
          tempId: crypto.randomUUID(),
          itemSkuId: undefined,
          displayName: selObj.displayName,
          code: selObj.code,
          barcode: selObj.barcode ?? '',
          isActive: true,
          unitTempId: selObj.unitTempId,
          itemUnitId: selObj.itemUnitId,
          variantUnitTempId: selObj.variantUnitTempId ?? null,

          // only include itemVariantUnitId if it's a real persisted id (avoid sending temp ids)
          itemVariantUnitId: resolvedItemVariantUnitId,
          config: { ...selObj.config },
          cost: selObj.cost ?? { cost: 0, lastCost: 0, method: 'FIFO' },
          price: selObj.price ?? { price: 0, taxInclusive: false, qtyThreshold: 1 },
          bom: selObj.bom ?? { yield: 1, notes: '', lines: [] },
          overrides: selObj.overrides ?? [],
        }

        updateForm.value.skus.push(newSku)
        console.log('[useItemUpdate] added new SKU:', newSku.code)
      }
      else {
        console.log('[useItemUpdate] SKU already exists, skipping:', selObj.code)
      }
    }
  }

  /* ---------------------------------
   * Expose
   * --------------------------------- */
  return {
  // state
    updateForm,
    updateFormErrors,
    isLoadingUpdate,

    variantGroups,

    // lookup data
    outlets,
    units,
    itemCategories,
    modifiers,
    materials,
    outletsData,
    defaultUnit,

    // loading flags
    isLoadingOutlets,
    isLoadingUnits,
    isLoadingCategories,
    isLoadingModifiers,
    isLoadingMaterials,

    // helpers / lifecycle
    initializeForm,
    applyGlobalConfigToAll,
    resetSkuToGlobal,
    deriveGlobalConfig,

    // entity handlers
    addOutlet,
    removeOutlet,

    addUnit,
    removeUnit,
    onChangeUnit,

    addImage,
    removeImage,

    addModifier,
    removeModifier,

    addBlankVariantGroup,
    removeVariantGroup,
    addBlankVariantGroupOption,
    removeVariantGroupOption,

    generateVariants,
    generateVariantUnits,
    regenerateSkus,

    // SKU separation helpers
    serverSkus,
    localSkus,
    generatedSkus,
    missingCombinations,
    addSelectedCombinations,

    // lifecycle flags
    isInitializing,

    enableBom,
    disableBom,
    addBomLine,
    removeBomLine,

    removeSku,
  }
}
