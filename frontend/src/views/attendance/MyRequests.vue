<template>
	<ion-page>
		<ion-header class="ion-no-border app-shell-header">
			<div class="w-full app-shell">
				<div class="flex flex-row bg-white shadow-sm py-4 px-3 items-center border-b">
					<Button variant="ghost" class="!px-1 mr-1 hover:bg-white" @click="router.back()">
						<FeatherIcon name="chevron-left" class="h-5 w-5" />
					</Button>
					<div class="min-w-0 flex-1">
						<h2 class="text-xl font-semibold text-gray-900">{{ __("My requests") }}</h2>
						<p class="text-xs text-gray-500">
							{{ __("Vacation, sick leave and home office") }}
						</p>
					</div>
					<Button variant="solid" class="shrink-0" @click="create">
						{{ __("New") }}
					</Button>
				</div>
			</div>
		</ion-header>
		<ion-content class="app-shell-content">
			<div class="flex flex-col min-h-full w-full app-shell p-4 gap-4">
				<div class="flex flex-wrap gap-2">
					<button
						v-for="option in filters"
						:key="option.value"
						type="button"
						class="rounded-full px-3 py-1.5 text-sm font-medium border"
						:class="filter === option.value ? option.active : 'border-gray-200 bg-white text-gray-700'"
						@click="filter = option.value"
					>
						{{ option.label }}
						<KindBadge
							class="ml-1.5"
							:kind="option.value"
							:count="count(option.value)"
							:inverted="filter === option.value"
						/>
					</button>
				</div>

				<div v-if="requests.loading && !requests.data" class="text-sm text-gray-500 py-10 text-center">
					{{ __("Loading") }}
				</div>
				<div v-else-if="!shown.length" class="text-sm text-gray-500 py-10 text-center">
					{{ __("You have no requests yet.") }}
				</div>

				<button
					v-for="row in shown"
					:key="row.name"
					type="button"
					class="rounded-2xl border p-4 flex flex-col gap-2 text-left"
					:class="cardClass(row)"
					@click="open(row)"
				>
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0">
							<div class="text-base font-semibold">{{ titleOf(row) }}</div>
							<div class="text-sm mt-0.5 opacity-80">{{ datesOf(row) }}</div>
						</div>
						<span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium" :class="statusClass(row)">
							{{ statusOf(row) }}
						</span>
					</div>
					<p v-if="row.note" class="text-sm opacity-80 line-clamp-2">{{ row.note }}</p>
					<p class="text-xs opacity-70">
						{{ row.editable ? __("Tap to change or withdraw") : __("Tap to view") }}
					</p>
				</button>
			</div>
		</ion-content>

		<RequestSheet
			:open="sheetOpen"
			:request="selected"
			:initialKind="sheetKind"
			@close="sheetOpen = false"
			@saved="reload"
			@deleted="reload"
		/>
	</ion-page>
</template>

<script setup>
import { computed, inject, ref } from "vue"
import { useRouter } from "vue-router"
import { IonPage, IonHeader, IonContent, onIonViewWillEnter } from "@ionic/vue"
import { createResource, FeatherIcon } from "frappe-ui"

import KindBadge from "@/components/KindBadge.vue"
import RequestSheet from "@/components/RequestSheet.vue"
import { REQUEST_STYLES } from "@/utils/dayKinds"

const __ = inject("$translate")
const dayjs = inject("$dayjs")
const router = useRouter()

const filter = ref("all")
const sheetOpen = ref(false)
const selected = ref(null)
const sheetKind = ref("leave")

const requests = createResource({
	url: "hr_addon.api.my_requests.get_my_requests",
	auto: true,
})

const filters = computed(() => [
	{ value: "all", label: __("All"), active: "border-gray-900 bg-gray-900 text-white" },
	{ value: "leave", label: __("Vacation"), active: "border-blue-700 bg-blue-100 text-blue-900" },
	{ value: "sick", label: __("Sick"), active: "border-red-700 bg-red-100 text-red-900" },
	{ value: "home", label: __("Home office"), active: "border-purple-700 bg-purple-100 text-purple-900" },
])

const rows = computed(() => requests.data || [])
const shown = computed(() =>
	filter.value === "all" ? rows.value : rows.value.filter((row) => row.kind === filter.value)
)

function count(value) {
	if (value === "all") return rows.value.length
	return rows.value.filter((row) => row.kind === value).length
}

function titleOf(row) {
	if (row.kind === "home") return __("Home office")
	if (row.kind === "sick") return __("Sick leave")
	return row.leave_type || __("Vacation")
}

function datesOf(row) {
	const start = dayjs(row.from_date)
	const end = dayjs(row.to_date)
	const when = start.isSame(end, "day")
		? start.format("D MMM YYYY")
		: `${start.format("D MMM")} – ${end.format("D MMM YYYY")}`
	const days = Number(row.days || 0)
	const booked = days.toFixed(1).replace(/\.0$/, "")
	if (row.kind === "home") return `${when} · ${row.calendar_days}d`
	return `${when} · ${__("counts as {0} leave days", [booked])}`
}

function statusOf(row) {
	if (row.docstatus === 1 || row.status === "Approved") return __("Approved")
	if (row.status === "Rejected") return __("Rejected")
	if (row.status === "Cancelled") return __("Cancelled")
	return __("Waiting")
}

function statusClass(row) {
	if (row.docstatus === 1 || row.status === "Approved") return "bg-green-100 text-green-900"
	if (row.status === "Rejected" || row.status === "Cancelled") return "bg-gray-200 text-gray-700"
	return "bg-orange-100 text-orange-900"
}

function cardClass(row) {
	const style = REQUEST_STYLES[row.kind] || REQUEST_STYLES.leave
	return row.editable ? `${style.soft} border-dashed ${style.border}` : style.solid
}

function open(row) {
	selected.value = { kind: row.request_kind, name: row.name }
	sheetKind.value = row.kind === "home" ? "home_office" : row.kind
	sheetOpen.value = true
}

function create() {
	selected.value = null
	sheetKind.value = filter.value === "home" ? "home_office" : filter.value === "sick" ? "sick" : "leave"
	sheetOpen.value = true
}

function reload() {
	sheetOpen.value = false
	requests.reload()
}

onIonViewWillEnter(() => {
	if (requests.data) requests.reload()
})
</script>
