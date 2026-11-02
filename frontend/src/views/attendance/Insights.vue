<template>
	<ion-page>
		<ion-header class="ion-no-border app-shell-header">
			<div class="w-full app-shell">
				<div class="flex flex-row bg-white shadow-sm py-4 px-3 items-center border-b">
					<Button variant="ghost" class="!px-1 mr-1 hover:bg-white" @click="router.back()">
						<FeatherIcon name="chevron-left" class="h-5 w-5" />
					</Button>
					<div class="min-w-0">
						<h2 class="text-xl font-semibold text-gray-900">{{ __("Insights") }}</h2>
						<p class="text-xs text-gray-500">{{ spanTitle }}</p>
					</div>
				</div>
			</div>
		</ion-header>
		<ion-content class="app-shell-content">
			<div class="flex flex-col min-h-full w-full app-shell p-4 gap-4">
				<div class="flex gap-2">
					<button
						v-for="option in spans"
						:key="option.value"
						type="button"
						class="flex-1 rounded-full px-3 py-2 text-sm font-semibold border"
						:class="span === option.value ? 'border-blue-600 bg-blue-600 text-white' : 'border-[#c8c8c8] bg-white text-gray-800'"
						@click="setSpan(option.value)"
					>
						{{ option.label }}
					</button>
				</div>

				<div v-if="insights.loading && !insights.data" class="text-sm text-gray-500 py-10 text-center">
					{{ __("Loading") }}
				</div>

				<template v-else-if="insights.data">
					<div v-if="upcoming" class="rounded-2xl bg-white px-4 py-3 flex items-center gap-3">
						<span class="h-9 w-9 shrink-0 rounded-full flex items-center justify-center" :class="kindChip(upcoming.kind)">
							<FeatherIcon :name="kindIcon(upcoming.kind)" class="h-4 w-4" />
						</span>
						<div class="min-w-0">
							<div class="text-sm font-semibold text-gray-900">{{ upcomingTitle }}</div>
							<div class="text-xs text-gray-500 mt-0.5">{{ upcomingDates }}</div>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<article v-for="card in cards" :key="card.label" class="rounded-2xl bg-white px-4 py-3 border-l-4" :class="card.edge">
							<div class="text-xs font-medium text-gray-500">{{ card.label }}</div>
							<div class="mt-1 text-2xl font-semibold tabular-nums text-gray-900 leading-none">{{ card.value }}</div>
							<div class="mt-1.5 text-xs text-gray-500">{{ card.hint }}</div>
						</article>
					</div>

					<section class="rounded-2xl bg-white p-4">
						<div class="flex items-start justify-between gap-3">
							<div>
								<h3 class="text-base font-semibold text-gray-900">{{ __("Target and actual") }}</h3>
								<p class="text-xs text-gray-500 mt-0.5">{{ soFar }}</p>
							</div>
							<div class="text-right">
								<div class="text-sm font-semibold tabular-nums" :class="balanceClass(insights.data.balance)">
									{{ formatBalance(insights.data.balance) }}
								</div>
								<div class="text-[11px] text-gray-500">{{ __("so far") }}</div>
							</div>
						</div>
						<svg
							:ref="bindChart"
							class="hours-chart mt-3"
							:viewBox="`0 0 ${plotWidth} ${plotHeight}`"
							role="img"
							:aria-label="chartLabel"
						>
							<line
								v-for="line in chart.grid"
								:key="line.text"
								:x1="line.x1"
								:x2="line.x2"
								:y1="line.y"
								:y2="line.y"
								stroke="currentColor"
								stroke-opacity="0.18"
							/>
							<text
								v-for="line in chart.grid"
								:key="`label-${line.text}`"
								x="0"
								:y="line.y + 3"
								fill="currentColor"
								font-size="11"
							>
								{{ line.text }}
							</text>
							<path v-for="(area, index) in chart.areas" :key="index" :d="area.d" :class="area.kind === 'plus' ? 'area-plus' : 'area-minus'" />
							<path v-if="chart.plan" class="line-plan" :d="chart.plan" />
							<path v-if="chart.target" class="line-target" :d="chart.target" />
							<path v-if="chart.actual" class="line-actual" :d="chart.actual" />
							<circle
								v-for="(dot, index) in chart.dots"
								:key="`dot-${index}`"
								:cx="dot.x"
								:cy="dot.y"
								r="3.2"
								:class="dot.kind"
							/>
							<text
								v-for="label in chart.labels"
								:key="label.date"
								:x="label.x"
								:y="plotHeight - 6"
								text-anchor="middle"
								font-size="11"
								:fill="label.today ? '#0070cc' : 'currentColor'"
								:font-weight="label.today ? 700 : 500"
							>
								{{ label.text }}
							</text>
						</svg>
						<div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
							<span class="inline-flex items-center gap-1.5">
								<span class="legend-target h-0.5 w-4 rounded-full" />
								{{ __("Target") }}
							</span>
							<span class="inline-flex items-center gap-1.5">
								<span class="h-0.5 w-4 rounded-full bg-[#059669]" />
								{{ __("Actual") }}
							</span>
							<span class="inline-flex items-center gap-1.5">
								<span class="legend-plus h-2.5 w-2.5 rounded-sm" />
								{{ __("+ hours") }}
							</span>
							<span class="inline-flex items-center gap-1.5">
								<span class="legend-minus h-2.5 w-2.5 rounded-sm" />
								{{ __("− hours") }}
							</span>
						</div>
					</section>

					<section v-if="projectSummary" class="rounded-2xl bg-white p-4">
						<div class="flex items-start justify-between gap-3">
							<div>
								<h3 class="text-base font-semibold text-gray-900">{{ __("Projects") }}</h3>
								<p class="text-xs text-gray-500 mt-0.5">{{ projectCaption }}</p>
							</div>
							<div v-if="projectSummary.booked" class="text-right">
								<div class="text-sm font-semibold tabular-nums text-gray-900">{{ formatHours(projectSummary.booked, 1) }}</div>
								<div class="text-[11px] text-gray-500">{{ __("booked") }}</div>
							</div>
						</div>
						<div v-if="projectSummary.rows.length || projectSummary.open" class="mt-3 flex flex-col gap-3">
							<div class="project-track h-2 overflow-hidden rounded-full flex">
								<div
									v-for="(row, index) in projectSummary.rows"
									:key="row.project"
									class="h-full"
									:style="{ width: `${allocationShare(row.hours)}%`, background: projectColor(index) }"
								/>
								<div
									v-if="projectSummary.open"
									class="project-unassigned h-full"
									:style="{ width: `${allocationShare(projectSummary.open)}%` }"
								/>
							</div>
							<div class="flex flex-col gap-2.5">
								<div v-for="(row, index) in projectSummary.rows" :key="row.project">
									<div class="flex items-baseline justify-between gap-3 text-sm">
										<span class="min-w-0 truncate font-medium text-gray-900">{{ row.name }}</span>
										<span class="shrink-0 tabular-nums text-gray-600">
											{{ formatHours(row.hours, 1) }}
											<span class="text-gray-400">· {{ allocationShare(row.hours) }}%</span>
										</span>
									</div>
									<div class="project-track mt-1 h-2.5 overflow-hidden rounded-full">
										<div class="flex h-full" :style="{ width: `${allocationShare(row.hours)}%` }">
											<div
												v-for="part in row.parts"
												:key="part.activity"
												class="h-full"
												:style="{
													width: `${part.share}%`,
													background: projectColor(index),
													opacity: part.activity === 'Operational' ? 0.45 : 1,
												}"
											/>
										</div>
									</div>
								</div>
								<div v-if="projectSummary.open">
									<div class="flex items-baseline justify-between gap-3 text-sm">
										<span class="min-w-0 truncate font-medium text-gray-500">{{ __("Not assigned yet") }}</span>
										<span class="shrink-0 tabular-nums text-gray-600">
											{{ formatHours(projectSummary.open, 1) }}
											<span class="text-gray-400">· {{ allocationShare(projectSummary.open) }}%</span>
										</span>
									</div>
									<div class="project-track mt-1 h-2.5 overflow-hidden rounded-full">
										<div
											class="project-unassigned h-full"
											:style="{ width: `${allocationShare(projectSummary.open)}%` }"
										/>
									</div>
								</div>
							</div>
							<div class="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-600">
								<span class="inline-flex items-center gap-1.5">
									<span class="h-2.5 w-2.5 rounded-sm bg-[#0f766e]" />
									{{ __("Development") }}
								</span>
								<span class="inline-flex items-center gap-1.5">
									<span class="h-2.5 w-2.5 rounded-sm bg-[#0f766e] opacity-45" />
									{{ __("Operational work") }}
								</span>
								<span v-if="projectSummary.open" class="inline-flex items-center gap-1.5">
									<span class="project-unassigned h-2.5 w-2.5 rounded-sm" />
									{{ __("Not assigned yet") }}
								</span>
							</div>
						</div>
						<p v-else class="mt-3 text-sm text-gray-500">{{ __("Nothing booked on a project in this period.") }}</p>
					</section>

					<section v-if="yearMonths.length" class="rounded-2xl bg-white p-4">
						<div class="flex items-baseline justify-between gap-3">
							<h3 class="text-base font-semibold text-gray-900">{{ __("Check-in timeline") }}</h3>
							<p class="text-xs text-gray-500">{{ timelineCaption }}</p>
						</div>
						<div class="mt-3 flex flex-col gap-1">
							<div
								v-for="month in yearMonths"
								:key="month.key"
								class="grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-2"
							>
								<div class="text-[11px] font-semibold" :class="month.current ? 'text-blue-700' : 'text-gray-500'">
									{{ month.label }}
								</div>
								<div class="year-days">
									<span
										v-for="cell in month.cells"
										:key="cell.date || cell.key"
										class="year-day"
										:class="yearDayClass(cell)"
										:title="yearTitle(cell)"
									/>
								</div>
							</div>
						</div>
						<div class="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-600">
							<span v-for="item in yearLegend" :key="item.label" class="inline-flex items-center gap-1.5">
								<span class="year-day year-swatch" :class="item.class" />
								{{ item.label }}
							</span>
						</div>
					</section>

					<section v-else-if="insights.data.timeline?.length" class="rounded-2xl bg-white p-4">
						<div class="flex items-baseline justify-between gap-3">
							<h3 class="text-base font-semibold text-gray-900">{{ __("Check-in timeline") }}</h3>
							<p class="text-xs text-gray-500">{{ timelineCaption }}</p>
						</div>
						<div class="mt-3 grid grid-cols-[3.25rem_minmax(0,1fr)_2.6rem] items-center gap-x-2 gap-y-1.5">
							<div />
							<div class="relative h-4 text-[10px] text-gray-500">
								<span
									v-for="tick in ticks"
									:key="tick.label"
									class="absolute top-0 -translate-x-1/2 tabular-nums"
									:style="{ left: tick.left }"
								>
									{{ tick.label }}
								</span>
							</div>
							<div />
							<template v-for="day in insights.data.timeline" :key="day.date">
								<div class="leading-tight" :class="day.date === insights.data.today ? 'text-blue-700' : 'text-gray-800'">
									<div class="text-[13px] font-semibold">{{ dayLabel(day).weekday }}</div>
									<div class="text-[11px] text-gray-500">{{ dayLabel(day).date }}</div>
								</div>
								<div class="track relative h-8 overflow-hidden rounded-full">
									<div
										v-if="pill(day)"
										class="absolute inset-1 flex items-center justify-center rounded-full text-[11px] font-medium"
										:class="pillClass(day)"
									>
										{{ pill(day) }}
									</div>
									<div
										v-for="(segment, index) in day.segments"
										:key="`${day.date}-${index}`"
										class="absolute top-1.5 bottom-1.5 rounded-full"
										:class="[segmentClass(day), segment.open ? 'opacity-80' : '']"
										:style="segmentStyle(segment)"
									/>
								</div>
								<div class="text-right text-[11px] font-medium tabular-nums text-gray-700">
									{{ day.actual ? formatHours(day.actual, 1) : "" }}
								</div>
							</template>
						</div>
					</section>

					<section v-if="extra.length" class="rounded-2xl bg-white px-4 py-3 flex flex-col gap-2">
						<div v-for="row in extra" :key="row.label" class="flex items-center justify-between gap-3 text-sm">
							<span class="text-gray-600">{{ row.label }}</span>
							<span class="font-semibold tabular-nums text-gray-900">{{ row.value }}</span>
						</div>
					</section>
				</template>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, ref } from "vue"
import { useRouter } from "vue-router"
import { IonPage, IonHeader, IonContent, onIonViewWillEnter } from "@ionic/vue"
import { createResource, Button, FeatherIcon } from "frappe-ui"

const __ = inject("$translate")
const dayjs = inject("$dayjs")
const router = useRouter()

const span = ref("month")
const insights = createResource({
	url: "hr_addon.api.insights.get_my_insights",
})

const spans = computed(() => [
	{ value: "week", label: __("Week") },
	{ value: "month", label: __("Month") },
	{ value: "year", label: __("Year") },
])

function setSpan(value) {
	if (span.value === value && insights.data) return
	span.value = value
	insights.submit({ span: value })
}

onIonViewWillEnter(() => insights.submit({ span: span.value }))

const spanTitle = computed(() => {
	const data = insights.data
	if (!data) return __("Your hours, leave and check-ins")
	if (data.span === "week") {
		return `${dayjs(data.from_date).format("D MMM")} – ${dayjs(data.to_date).format("D MMM")}`
	}
	if (data.span === "year") return dayjs(data.from_date).format("YYYY")
	return dayjs(data.from_date).format("MMMM YYYY")
})

const cards = computed(() => {
	const data = insights.data
	if (!data) return []
	const vacation = data.vacation || {}
	return [
		{
			label: __("Vacation left"),
			value: vacation.has_allocation ? formatDays(vacation.remaining) : "—",
			hint: vacation.has_allocation
				? vacationHint(vacation)
				: __("No allocation"),
			edge: "border-blue-400",
		},
		{
			label: __("Sick days"),
			value: formatDays(data.sick),
			hint: sickHint(data),
			edge: "border-red-400",
		},
		{
			label: __("Home office"),
			value: formatDays(data.home_office),
			hint: data.home_office_pending
				? __("{0} waiting", [formatDays(data.home_office_pending)])
				: __("Approved days"),
			edge: "border-purple-400",
		},
		{
			label: __("Worked days"),
			value: formatDays(data.worked_days),
			hint: data.missing_days
				? __("{0} to fix", [data.missing_days])
				: __("Nothing to fix"),
			edge: "border-green-400",
		},
	]
})

const extra = computed(() => {
	const data = insights.data
	if (!data) return []
	const rows = [
		{ label: __("Vacation taken"), value: formatDays(data.vacation_taken) },
		{ label: __("Usual check-in"), value: data.average_start || "—" },
		{ label: __("Usual check-out"), value: data.average_end || "—" },
	]
	if (data.vacation_pending) {
		rows.splice(1, 0, { label: __("Vacation waiting"), value: formatDays(data.vacation_pending) })
	}
	if (data.overtime_enabled) {
		rows.push({ label: __("Overtime balance"), value: formatBalance(data.overtime_balance) })
	}
	return rows
})

const PROJECT_COLORS = ["#0f766e", "#7c3aed", "#2563eb", "#d97706", "#db2777", "#0891b2"]

const projectSummary = computed(() => insights.data?.projects || null)

const projectPool = computed(() => {
	const summary = projectSummary.value
	if (!summary) return 0
	return Math.max(Number(summary.worked) || 0, Number(summary.booked) || 0)
})

function allocationShare(hours) {
	const pool = projectPool.value
	if (!pool) return 0
	return (Math.round((Number(hours) / pool) * 1000) / 10).toFixed(1)
}

const projectCaption = computed(() => {
	const summary = projectSummary.value
	if (!summary) return ""
	if (summary.over > 0) return __("{0} over the worked hours", [formatHours(summary.over, 1)])
	if (summary.booked > 0 && summary.open > 0) return __("{0} of the worked hours still open", [formatHours(summary.open, 1)])
	if (summary.booked > 0) return __("Worked hours are booked")
	return __("Booked from your check-in time")
})

function projectColor(index) {
	return PROJECT_COLORS[index % PROJECT_COLORS.length]
}

const upcoming = computed(() => insights.data?.upcoming)

const upcomingTitle = computed(() => {
	const item = upcoming.value
	if (!item) return ""
	const name = item.kind === "sick" ? __("Sick") : item.kind === "home" ? __("Home office") : __("Vacation")
	if (item.started) return __("{0} now", [name])
	return item.pending ? __("{0} waiting", [name]) : name
})

const upcomingDates = computed(() => {
	const item = upcoming.value
	if (!item) return ""
	const start = dayjs(item.from_date)
	const end = dayjs(item.to_date)
	if (start.isSame(end, "day")) return start.format("ddd, D MMM")
	return `${start.format("D MMM")} – ${end.format("D MMM")}`
})

const soFar = computed(() => {
	const data = insights.data
	if (!data) return ""
	return __("Actual {0} · target {1}", [formatHours(data.actual, 1), formatHours(data.target, 1)])
})

const chartLabel = computed(() => soFar.value)

const plotHeight = 148
const plotWidth = ref(320)
let chartObserver

function bindChart(element) {
	chartObserver?.disconnect()
	if (!element || typeof ResizeObserver === "undefined") return
	const measure = () => {
		const width = Math.round(element.clientWidth)
		if (width > 0) plotWidth.value = width
	}
	chartObserver = new ResizeObserver(measure)
	chartObserver.observe(element)
	measure()
}

onBeforeUnmount(() => chartObserver?.disconnect())

const chart = computed(() => buildHoursChart(insights.data, plotWidth.value, plotHeight))

const windowSpan = computed(() => {
	let start = 8 * 60
	let end = 18 * 60
	for (const day of insights.data?.timeline || []) {
		for (const segment of day.segments || []) {
			start = Math.min(start, minutes(segment.start))
			end = Math.max(end, minutes(segment.end))
		}
	}
	start = Math.max(0, Math.floor((start - 30) / 60) * 60)
	end = Math.min(24 * 60, Math.ceil((end + 30) / 60) * 60)
	if (end - start < 8 * 60) end = Math.min(24 * 60, start + 8 * 60)
	return { start, end }
})

const ticks = computed(() => {
	const { start, end } = windowSpan.value
	const span = Math.max(end - start, 1)
	const step = span > 12 * 60 ? 240 : 120
	const marks = []
	for (let minute = Math.ceil(start / step) * step; minute <= end; minute += step) {
		marks.push({
			label: String(minute / 60),
			left: `${((minute - start) / span) * 100}%`,
		})
	}
	return marks
})

const timelineCaption = computed(() => {
	if (insights.data?.span === "year") return __("The year")
	return __("Checked-in time")
})

const yearMonths = computed(() => {
	const data = insights.data
	if (data?.span !== "year") return []
	const groups = []
	const byMonth = new Map()
	for (const day of data.timeline || []) {
		const key = day.date.slice(0, 7)
		if (!byMonth.has(key)) {
			const group = {
				key,
				label: dayjs(day.date).format("MMM"),
				current: key === data.today?.slice(0, 7),
				cells: Array.from({ length: 31 }, (_, index) => ({ pad: true, key: `${key}-${index}` })),
			}
			byMonth.set(key, group)
			groups.push(group)
		}
		const index = Number(day.date.slice(8, 10)) - 1
		byMonth.get(key).cells[index] = day
	}
	return groups
})

const yearLegend = computed(() => [
	{ label: __("Worked"), class: "year-work-3" },
	{ label: __("Home office"), class: "year-home" },
	{ label: __("Vacation"), class: "year-leave" },
	{ label: __("Sick"), class: "year-sick" },
	{ label: __("Missing"), class: "year-missing" },
	{ label: __("Holiday"), class: "year-holiday" },
])

function buildHoursChart(data, width, height) {
	const points = data?.chart || []
	const padL = 32
	const padT = 8
	const padB = 22
	const innerW = Math.max(width - padL - 8, 1)
	const innerH = height - padT - padB
	const today = data?.today
	const start = data?.from_date ? dayjs(data.from_date) : null
	const end = data?.to_date ? dayjs(data.to_date) : null
	const dayCount = start && end ? Math.max(end.diff(start, "day") + 1, 1) : Math.max(points.length, 1)
	const slot = innerW / dayCount
	const xOf = (date, index) => {
		if (!start) return padL + index * slot + slot / 2
		const dayIndex = Math.min(Math.max(dayjs(date).diff(start, "day"), 0), dayCount - 1)
		return padL + dayIndex * slot + slot / 2
	}
	const nodes = points.map((point, index) => {
		const future = isFuturePoint(point.date, today)
		return {
			date: point.date,
			x: xOf(point.date, index),
			target: Number(point.target) || 0,
			actual: future ? null : Number(point.actual) || 0,
			label: axisLabel(point.date),
			showLabel: showAxisLabel(index, points.length, point.date === today),
			today: point.date === today,
		}
	})
	const peak = Math.max(1, ...nodes.map((node) => Math.max(node.target, node.actual || 0)))
	const max = niceMax(peak)
	const y = (value) => padT + innerH - (value / max) * innerH
	const known = nodes.filter((node) => node.actual != null)
	const areas = []
	for (let index = 0; index < known.length - 1; index++) {
		const from = known[index]
		const to = known[index + 1]
		const startGap = from.actual - from.target
		const endGap = to.actual - to.target
		const pieces = []
		if (startGap * endGap < 0) {
			const split = startGap / (startGap - endGap)
			const mid = {
				x: from.x + (to.x - from.x) * split,
				actual: from.actual + (to.actual - from.actual) * split,
				target: from.target + (to.target - from.target) * split,
			}
			pieces.push([from, mid, startGap > 0 ? "plus" : "minus"])
			pieces.push([mid, to, endGap > 0 ? "plus" : "minus"])
		} else if (startGap !== 0 || endGap !== 0) {
			pieces.push([from, to, startGap > 0 || endGap > 0 ? "plus" : "minus"])
		}
		for (const [start, end, kind] of pieces) {
			areas.push({
				kind,
				d: `M ${start.x} ${y(start.actual)} L ${end.x} ${y(end.actual)} L ${end.x} ${y(end.target)} L ${start.x} ${y(start.target)} Z`,
			})
		}
	}
	if (known.length === 1 && known[0].actual !== known[0].target) {
		const only = known[0]
		const half = slot * 0.42
		areas.push({
			kind: only.actual > only.target ? "plus" : "minus",
			d: `M ${only.x - half} ${y(only.actual)} L ${only.x + half} ${y(only.actual)} L ${only.x + half} ${y(only.target)} L ${only.x - half} ${y(only.target)} Z`,
		})
	}
	const lastKnown = known.length ? known[known.length - 1] : null
	const future = lastKnown ? nodes.filter((node) => node.x >= lastKnown.x) : nodes
	const grid = [0, 0.5, 1].map((step) => ({
		y: y(max * step),
		x1: padL,
		x2: width - 6,
		text: hourTick(max * step),
	}))
	return {
		areas,
		target: pathOf(known, "target", y),
		actual: pathOf(known, "actual", y),
		plan: future.length > 1 ? pathOf(future, "target", y) : "",
		dots: known.length
			? [
					{ x: lastKnown.x, y: y(lastKnown.target), kind: "dot-target" },
					{ x: lastKnown.x, y: y(lastKnown.actual), kind: "dot-actual" },
				]
			: [],
		labels: axisLabels(data, nodes, xOf, width),
		grid,
	}
}

function pathOf(nodes, key, y) {
	return nodes
		.filter((node) => node[key] != null)
		.map((node, index) => `${index ? "L" : "M"} ${node.x.toFixed(2)} ${y(node[key]).toFixed(2)}`)
		.join(" ")
}

function isFuturePoint(date, today) {
	if (!today) return false
	return date > today
}

function niceMax(peak) {
	const padded = Math.max(peak * 1.12, 1)
	const step = padded <= 10 ? 2 : padded <= 24 ? 4 : 10
	return Math.ceil(padded / step) * step
}

function hourTick(value) {
	const rounded = Math.round(value * 10) / 10
	return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

function axisLabels(data, nodes, xOf, width) {
	if (data?.span === "year" && data.from_date) {
		const labels = []
		let cursor = dayjs(data.from_date).startOf("month")
		const end = dayjs(data.to_date)
		const step = width < 560 ? 2 : 1
		let index = 0
		while ((cursor.isBefore(end) || cursor.isSame(end, "day")) && index < 12) {
			if (index % step === 0) {
				const date = cursor.format("YYYY-MM-DD")
				labels.push({
					date,
					x: xOf(date, 0),
					text: cursor.format("MMM"),
					today: cursor.isSame(data.today, "month"),
				})
			}
			cursor = cursor.add(1, "month")
			index += 1
		}
		return labels
	}
	return nodes
		.filter((node) => node.showLabel)
		.map((node) => ({ date: node.date, x: node.x, text: node.label, today: node.today }))
}

function axisLabel(date) {
	if (insights.data?.span === "year") return dayjs(date).format("MMM")
	if (insights.data?.span === "week") return dayjs(date).format("dd")
	return dayjs(date).format("D")
}

function showAxisLabel(index, count, isToday) {
	if (insights.data?.span === "year") {
		const date = insights.data?.chart?.[index]?.date || ""
		return date.slice(8, 10) === "01"
	}
	if (isToday || index === 0 || index === count - 1) return true
	if (count > 16) return index % 5 === 0
	return true
}

function dayLabel(day) {
	const date = dayjs(day.date)
	return { weekday: date.format("dd"), date: date.format("D") }
}

function pill(day) {
	if (day.segments?.length) return ""
	if (day.kind === "leave") return day.pending ? __("Vacation · waiting") : __("Vacation")
	if (day.kind === "sick") return day.pending ? __("Sick · waiting") : __("Sick")
	if (day.kind === "home") return day.pending ? __("Home office · waiting") : __("Home office")
	if (day.kind === "holiday") return __("Holiday")
	if (day.kind === "missing") return __("Missing")
	return ""
}

function pillClass(day) {
	if (day.kind === "sick") return "bg-red-100 text-red-800"
	if (day.kind === "leave") return "bg-blue-100 text-blue-800"
	if (day.kind === "home") return "bg-purple-100 text-purple-800"
	if (day.kind === "missing") return "bg-orange-100 text-orange-800"
	return "bg-gray-200 text-gray-700"
}

function segmentClass(day) {
	if (day.kind === "home") return "bg-[#7c3aed]"
	if (day.kind === "leave") return "bg-[#2563eb]"
	if (day.kind === "sick") return "bg-[#dc2626]"
	if (day.kind === "missing") return "bg-[#d97706]"
	return "bg-[#059669]"
}

function segmentStyle(segment) {
	const { start, end } = windowSpan.value
	const span = Math.max(end - start, 1)
	const from = minutes(segment.start)
	const to = Math.max(minutes(segment.end), from)
	const left = ((from - start) / span) * 100
	const width = Math.max(((to - from) / span) * 100, segment.open ? 2 : 1.2)
	return { left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }
}

function vacationHint(vacation) {
	const ofAllocated = __("of {0}", [formatDays(vacation.allocated)])
	if (!vacation.pending) return ofAllocated
	return `${ofAllocated} · ${__("{0} waiting", [formatDays(vacation.pending)])}`
}

function sickHint(data) {
	if (data.sick_pending) return __("{0} waiting", [formatDays(data.sick_pending)])
	return __("This period")
}

function yearDayClass(day) {
	if (!day || day.pad) return "year-pad"
	const classes = [`year-${day.kind}`]
	if (day.pending) classes.push("year-pending")
	if (day.date === insights.data?.today) classes.push("year-today")
	if (day.kind === "work") {
		const level = day.actual >= 8 ? 3 : day.actual >= 4 ? 2 : 1
		classes.push(`year-work-${level}`)
	}
	return classes
}

function yearTitle(day) {
	if (!day?.date) return ""
	const names = {
		work: __("Worked"),
		home: __("Home office"),
		leave: __("Vacation"),
		sick: __("Sick"),
		holiday: __("Holiday"),
		missing: __("Missing"),
		off: __("Off"),
	}
	const name = names[day.kind]
	const date = dayjs(day.date).format("D MMM")
	if (!name) return date
	return day.pending ? `${date} · ${name} · ${__("waiting")}` : `${date} · ${name}`
}

function kindChip(kind) {
	if (kind === "sick") return "bg-red-100 text-red-800"
	if (kind === "home") return "bg-purple-100 text-purple-800"
	return "bg-blue-100 text-blue-800"
}

function kindIcon(kind) {
	if (kind === "sick") return "thermometer"
	if (kind === "home") return "home"
	return "sun"
}

function minutes(value) {
	const [hour, minute] = String(value || "0:0").split(":")
	return Number(hour) * 60 + Number(minute)
}

function getDate(value) {
	return String(value || "").slice(0, 10)
}

function formatDays(value) {
	const number = Number(value || 0)
	if (Number.isInteger(number)) return String(number)
	const text = number.toFixed(1)
	return text.endsWith(".0") ? text.slice(0, -2) : text
}

function formatHours(value, digits = 2) {
	return `${Number(value || 0).toFixed(digits)} h`
}

function formatBalance(value) {
	const hours = Number(value || 0)
	const sign = hours > 0 ? "+" : ""
	return `${sign}${hours.toFixed(1)} h`
}

function balanceClass(value) {
	const hours = Number(value || 0)
	if (hours < 0) return "text-orange-700"
	if (hours > 0) return "text-green-700"
	return "text-gray-500"
}
</script>

<style scoped>
.project-track {
	background: #eceff3;
}
.project-unassigned {
	background-color: #d4d4d8;
	background-image: repeating-linear-gradient(
		-45deg,
		transparent,
		transparent 3px,
		rgba(82, 82, 91, 0.45) 3px,
		rgba(82, 82, 91, 0.45) 5px
	);
}
.year-days {
	display: grid;
	grid-template-columns: repeat(31, minmax(0, 1fr));
	gap: 2px;
}
.year-day {
	display: block;
	height: 9px;
	border-radius: 2px;
	background: transparent;
}
@media (min-width: 640px) {
	.year-day {
		height: 12px;
	}
}
.year-swatch {
	width: 10px;
	height: 10px;
}
.year-off,
.year-future,
.year-open {
	background: #eceff3;
}
.year-work-1 {
	background: rgba(5, 150, 105, 0.35);
}
.year-work-2 {
	background: rgba(5, 150, 105, 0.7);
}
.year-work-3 {
	background: #059669;
}
.year-home {
	background: #7c3aed;
}
.year-leave {
	background: #2563eb;
}
.year-sick {
	background: #e11d48;
}
.year-missing {
	background: #f59e0b;
}
.year-holiday {
	background: #a1a1aa;
}
.year-pending {
	opacity: 0.45;
}
.year-today {
	box-shadow: inset 0 0 0 1.5px #0070cc;
}
.hours-chart {
	display: block;
	width: 100%;
	height: 148px;
	color: #525252;
}
.hours-chart .area-plus {
	fill: rgba(16, 185, 129, 0.38);
}
.hours-chart .area-minus {
	fill: rgba(244, 114, 182, 0.42);
}
.hours-chart .line-target,
.hours-chart .line-plan,
.hours-chart .line-actual {
	fill: none;
	stroke-linejoin: round;
	stroke-linecap: round;
}
.hours-chart .line-target {
	stroke: #64748b;
	stroke-width: 1.75;
}
.hours-chart .line-plan {
	stroke: #94a3b8;
	stroke-width: 1.75;
	stroke-dasharray: 4 3;
}
.hours-chart .line-actual {
	stroke: #059669;
	stroke-width: 2.25;
}
.hours-chart .dot-target {
	fill: #64748b;
}
.hours-chart .dot-actual {
	fill: #059669;
}
.legend-target {
	background: #64748b;
}
.legend-plus {
	background: rgba(16, 185, 129, 0.55);
}
.legend-minus {
	background: rgba(244, 114, 182, 0.6);
}
.track {
	background: #eceff3;
}
@media (prefers-color-scheme: dark) {
	.hours-chart {
		color: #a1a1aa;
	}
	.hours-chart .area-plus {
		fill: rgba(52, 211, 153, 0.4);
	}
	.hours-chart .area-minus {
		fill: rgba(251, 113, 133, 0.42);
	}
	.hours-chart .line-target {
		stroke: #d4d4d8;
	}
	.hours-chart .dot-target,
	.legend-target {
		fill: #d4d4d8;
		background: #d4d4d8;
	}
	.hours-chart .line-plan {
		stroke: #71717a;
	}
	.hours-chart .line-actual {
		stroke: #34d399;
	}
	.hours-chart .dot-actual {
		fill: #34d399;
	}
	.legend-plus {
		background: rgba(52, 211, 153, 0.7);
	}
	.legend-minus {
		background: rgba(251, 113, 133, 0.7);
	}
	.track {
		background: #2a3038;
	}
	.project-track {
		background: #2a3038;
	}
	.project-unassigned {
		background-color: #3f3f46;
		background-image: repeating-linear-gradient(
			-45deg,
			transparent,
			transparent 3px,
			rgba(228, 228, 231, 0.38) 3px,
			rgba(228, 228, 231, 0.38) 5px
		);
	}
	.year-off,
	.year-future,
	.year-open {
		background: #2a3038;
	}
	.year-work-1 {
		background: rgba(52, 211, 153, 0.35);
	}
	.year-work-2 {
		background: rgba(52, 211, 153, 0.7);
	}
	.year-work-3 {
		background: #34d399;
	}
	.year-home {
		background: #a78bfa;
	}
	.year-leave {
		background: #60a5fa;
	}
	.year-sick {
		background: #fb7185;
	}
	.year-missing {
		background: #fbbf24;
	}
	.year-holiday {
		background: #71717a;
	}
	.year-today {
		box-shadow: inset 0 0 0 1.5px #7dd3fc;
	}
}
</style>
