<template>
	<span
		class="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums leading-none"
		:class="tone"
		:title="label"
	>
		{{ count }}
	</span>
</template>

<script setup>
import { computed, inject } from "vue"

import { KIND_BADGE } from "@/utils/dayKinds"

const __ = inject("$translate")

const props = defineProps({
	kind: {
		type: String,
		required: true,
	},
	count: {
		type: Number,
		required: true,
	},
	inverted: {
		type: Boolean,
		default: false,
	},
})

const label = computed(
	() =>
		({
			leave: __("Vacation"),
			sick: __("Sick"),
			home: __("Home office"),
			all: __("All"),
		})[props.kind] || props.kind
)

const tone = computed(() => {
	if (!props.inverted) return KIND_BADGE[props.kind] || KIND_BADGE.all
	if (props.kind === "all") return "bg-[#ffffff] text-[#111827]"
	return "bg-[#111827] text-white"
})
</script>
