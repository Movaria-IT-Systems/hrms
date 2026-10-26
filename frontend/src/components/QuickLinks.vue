<template>
	<div class="flex flex-col gap-5 my-4 w-full">
		<div class="text-lg font-medium text-gray-900">{{ title || __("Quick Links") }}</div>
		<div class="flex flex-col bg-white rounded">
			<router-link
				class="flex flex-row flex-start p-4 items-center justify-between"
				:class="link !== props.items[props.items.length - 1] && 'border-b'"
				v-for="link in props.items"
				:key="link.title"
				:to="{ name: link.route }"
			>
				<div class="flex flex-row items-center gap-3 grow">
					<component :is="link.icon" class="h-5 w-5 text-gray-500" />
					<div class="text-base font-normal text-gray-800">
						{{ link.title }}
					</div>
				</div>
				<span v-if="link.badges?.length" class="mr-2 inline-flex items-center gap-1">
					<KindBadge
						v-for="badge in link.badges"
						:key="badge.kind"
						:kind="badge.kind"
						:count="badge.count"
					/>
				</span>
				<FeatherIcon name="chevron-right" class="h-5 w-5 text-gray-500" />
			</router-link>
		</div>
	</div>
</template>

<script setup>
import { FeatherIcon } from "frappe-ui"

import KindBadge from "@/components/KindBadge.vue"

const props = defineProps({
	title: {
		type: String,
		required: false,
		default: "",
	},
	items: {
		type: Array,
		required: true,
	},
})
</script>
