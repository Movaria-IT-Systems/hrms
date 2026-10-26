<template>
	<ion-page>
		<ion-header class="ion-no-border app-shell-header">
			<div class="w-full app-shell">
				<div class="flex flex-row bg-white shadow-sm py-4 px-3 items-center border-b">
					<Button variant="ghost" class="!px-1 mr-1 hover:bg-white" @click="router.back()">
						<FeatherIcon name="chevron-left" class="h-5 w-5" />
					</Button>
					<div>
						<h2 class="text-xl font-semibold text-gray-900">{{ __("Approvals") }}</h2>
						<p class="text-xs text-gray-500">
							{{
								waiting.length === 1
									? __("1 request is waiting")
									: __("{0} requests are waiting", [waiting.length])
							}}
						</p>
					</div>
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

				<div v-if="pending.loading && !pending.data" class="text-sm text-gray-500 py-10 text-center">
					{{ __("Loading") }}
				</div>
				<div v-else-if="!shown.length" class="text-sm text-gray-500 py-10 text-center">
					{{ __("Nothing is waiting for you.") }}
				</div>

				<article
					v-for="row in shown"
					:key="row.name"
					class="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col gap-3"
				>
					<div class="flex items-start justify-between gap-3">
						<div class="flex items-start gap-3">
							<div class="rounded-xl p-2" :class="styleOf(row.kind).solid">
								<FeatherIcon :name="styleOf(row.kind).icon" class="h-5 w-5" />
							</div>
							<div>
								<div class="text-base font-semibold text-gray-900">{{ row.employee_name }}</div>
								<div class="text-sm text-gray-500">{{ row.department || row.employee }}</div>
							</div>
						</div>
						<div class="text-sm font-medium text-right" :class="styleOf(row.kind).solid + ' rounded-lg px-2 py-1'">
							{{ kindLabel(row.kind) }}
						</div>
					</div>

					<div class="text-sm text-gray-800">
						{{ dateLabel(row) }}
						<span class="text-gray-400"> · </span>
						{{ daysLabel(row) }}
					</div>
					<p v-if="row.leave_type && row.kind !== 'home'" class="text-xs text-gray-500">{{ row.leave_type }}</p>
					<p v-if="row.note" class="text-sm text-gray-700 whitespace-pre-wrap">{{ row.note }}</p>
					<p v-if="workedHours(row)" class="rounded-xl bg-gray-50 text-gray-700 text-sm px-3 py-2">
						{{ workedNote(row) }}
					</p>
					<p v-if="errorFor === row.name" class="text-sm text-red-700">{{ errorMessage }}</p>

					<div class="flex flex-wrap gap-2">
						<Button variant="solid" :loading="busy === row.name" @click="choose(row, 'approve')">
							{{ __("Approve") }}
						</Button>
						<Button
							v-if="confirming !== row.name"
							variant="outline"
							theme="red"
							:disabled="busy === row.name"
							@click="confirming = row.name"
						>
							{{ __("Reject") }}
						</Button>
						<template v-else>
							<Button variant="solid" theme="red" :loading="busy === row.name" @click="choose(row, 'reject')">
								{{ row.kind === "home" ? __("Remove request") : __("Reject request") }}
							</Button>
							<Button variant="ghost" @click="confirming = ''">{{ __("Cancel") }}</Button>
						</template>
					</div>
				</article>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup>
import { computed, inject, ref } from "vue"
import { useRouter } from "vue-router"
import { IonPage, IonHeader, IonContent, onIonViewWillEnter } from "@ionic/vue"
import { createResource, FeatherIcon, toast } from "frappe-ui"

import KindBadge from "@/components/KindBadge.vue"
import { REQUEST_STYLES } from "@/utils/dayKinds"

const __ = inject("$translate")
const dayjs = inject("$dayjs")
const router = useRouter()

const filter = ref("all")
const busy = ref("")
const confirming = ref("")
const errorFor = ref("")
const errorMessage = ref("")

const pending = createResource({
	url: "hr_addon.api.approvals.get_pending_requests",
	auto: true,
})

const decision = createResource({
	url: "hr_addon.api.approvals.decide_request",
})

const waiting = computed(() => pending.data || [])
const shown = computed(() =>
	filter.value === "all" ? waiting.value : waiting.value.filter((row) => row.kind === filter.value)
)

const filters = computed(() => [
	{ value: "all", label: __("All"), active: "border-gray-900 bg-gray-900 text-white" },
	{ value: "leave", label: __("Vacation"), active: "border-blue-700 bg-blue-100 text-blue-900" },
	{ value: "sick", label: __("Sick"), active: "border-red-700 bg-red-100 text-red-900" },
	{ value: "home", label: __("Home office"), active: "border-purple-700 bg-purple-100 text-purple-900" },
])

function count(value) {
	return value === "all" ? waiting.value.length : waiting.value.filter((row) => row.kind === value).length
}

function styleOf(kind) {
	return REQUEST_STYLES[kind] || REQUEST_STYLES.leave
}

function kindLabel(kind) {
	return { leave: __("Vacation"), sick: __("Sick"), home: __("Home office") }[kind] || kind
}

function dateLabel(row) {
	const from = dayjs(row.from_date)
	const to = dayjs(row.to_date)
	if (from.isSame(to, "day")) return from.format("ddd, D MMM YYYY")
	return `${from.format("D MMM")} – ${to.format("D MMM YYYY")}`
}

function formatDays(value) {
	return Number(value || 0).toFixed(1).replace(/\.0$/, "")
}

function daysLabel(row) {
	if (row.half_day) return __("Half day")
	if (row.kind === "home") {
		const days = Number(row.days)
		return days === 1 ? __("1 day") : __("{0} days", [days])
	}
	const booked = formatDays(row.days)
	const label = Number(row.days) === 1 ? __("1 leave day") : __("{0} leave days", [booked])
	if (Number(row.calendar_days) > Number(row.days)) {
		return `${label} · ${__("{0} calendar days", [row.calendar_days])}`
	}
	return label
}

function workedHours(row) {
	return (row.worked || []).reduce((sum, day) => sum + Number(day.hours || 0), 0)
}

function workedNote(row) {
	const hours = formatDays(workedHours(row))
	if (row.kind === "home") {
		return __("Already worked {0} h. Check-ins on a home office day count as usual.", [hours])
	}
	return __(
		"Also worked {0} h. Approving keeps the request and counts these hours as overtime.",
		[hours]
	)
}

function messageOf(error) {
	const message = error?.messages?.[0] || error?.message || __("Something went wrong")
	return String(message).replace(/<[^>]+>/g, "")
}

async function choose(row, name) {
	errorFor.value = ""
	errorMessage.value = ""
	busy.value = row.name
	try {
		await decision.submit({ kind: row.request_kind, name: row.name, decision: name })
		confirming.value = ""
		toast({
			title: name === "approve" ? __("Approved") : __("Rejected"),
			icon: "check-circle",
			position: "bottom-center",
			iconClasses: "text-green-500",
		})
		await pending.reload()
	} catch (error) {
		errorFor.value = row.name
		errorMessage.value = messageOf(error)
	} finally {
		busy.value = ""
	}
}

onIonViewWillEnter(() => {
	if (pending.data) pending.reload()
})
</script>
