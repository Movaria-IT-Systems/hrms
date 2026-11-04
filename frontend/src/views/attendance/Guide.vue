<template>
	<ion-page>
		<ion-header class="ion-no-border app-shell-header">
			<div class="w-full app-shell">
				<div class="flex flex-row items-center border-b bg-white px-3 py-4 shadow-sm">
					<Button variant="ghost" class="!px-1 mr-1 hover:bg-white" @click="router.back()">
						<FeatherIcon name="chevron-left" class="h-5 w-5" />
					</Button>
					<div class="min-w-0">
						<h2 class="text-xl font-semibold text-gray-900">{{ __("How this app works") }}</h2>
						<p class="text-xs text-gray-500">{{ __("For your roles. Press ? to open this page.") }}</p>
					</div>
				</div>
			</div>
		</ion-header>
		<ion-content class="app-shell-content">
			<div class="mx-auto grid w-full max-w-6xl gap-6 p-4 app-shell lg:grid-cols-[13rem_minmax(0,1fr)] lg:px-8">
				<nav class="hidden lg:block">
					<div class="sticky top-2 space-y-0.5 text-sm">
						<p class="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
							{{ __("On this page") }}
						</p>
						<a
							v-for="item in toc"
							:key="item.id"
							href="#"
							class="block rounded px-2 py-1.5"
							:class="linkClass(item)"
							@click.prevent="jump(item.id)"
						>
							{{ item.title }}
						</a>
					</div>
				</nav>

				<article class="min-w-0 space-y-4">
					<div class="flex gap-2 overflow-x-auto pb-1 lg:hidden">
						<button
							v-for="item in toc"
							:key="item.id"
							type="button"
							class="shrink-0 rounded-full border px-3 py-1 text-xs font-medium"
							:class="active === item.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700'"
							@click="jump(item.id)"
						>
							{{ item.title }}
						</button>
					</div>

					<header class="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
						<p class="text-xs font-semibold uppercase tracking-wider text-[#0065bd]">{{ __("Guide") }}</p>
						<h1 class="mt-1 text-2xl font-semibold tracking-tight text-gray-900">{{ __("How this app works") }}</h1>
						<p class="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
							{{
								__(
									"Hours, vacation, sick days, home office and project time. The app reads Frappe HR, ERPNext and HR Addon. It finds you through the active Employee whose User ID is your user."
								)
							}}
						</p>
						<div v-if="roleLine" class="mt-3 flex flex-wrap gap-1.5">
							<span
								v-for="role in roles"
								:key="role"
								class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800"
							>
								{{ role }}
							</span>
						</div>
						<p v-if="scopeLine" class="mt-2 text-sm text-gray-700">{{ scopeLine }}</p>
						<div class="mt-4 grid gap-2 sm:grid-cols-3">
							<div v-for="step in steps" :key="step.title" class="rounded-xl bg-gray-50 p-3">
								<span
									class="flex h-8 w-8 items-center justify-center rounded-lg text-white"
									:style="{ background: step.color }"
								>
									<FeatherIcon :name="step.icon" class="h-4 w-4" />
								</span>
								<p class="mt-2 text-sm font-semibold text-gray-900">{{ step.title }}</p>
								<p class="mt-0.5 text-xs leading-relaxed text-gray-600">{{ step.text }}</p>
							</div>
						</div>
					</header>

					<template v-for="(section, index) in sections" :key="section.id">
						<div v-if="dividerBefore(index)" class="flex items-center gap-3 pt-2">
							<span class="h-px flex-1" :class="dividerClass(section.audience)" />
							<span
								class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
								:class="dividerChip(section.audience)"
							>
								<FeatherIcon name="shield" class="h-3.5 w-3.5" />
								{{ dividerLabel(section.audience) }}
							</span>
							<span class="h-px flex-1" :class="dividerClass(section.audience)" />
						</div>
						<section
							:id="section.id"
							class="help rounded-2xl border border-gray-100 bg-white p-5 sm:p-6"
							:class="sectionClass(section.audience)"
						>
							<h2>{{ section.title }}</h2>
							<template v-for="(block, blockIndex) in section.blocks" :key="blockIndex">
								<p v-if="block.type === 'p'">{{ block.text }}</p>
								<h3 v-else-if="block.type === 'h3'">{{ block.text }}</h3>
								<ul v-else-if="block.type === 'ul'">
									<li v-for="item in block.items" :key="item.lead">
										<b>{{ item.lead }}.</b>
										{{ item.text }}
									</li>
								</ul>
								<p v-else-if="block.type === 'note'" class="note">{{ block.text }}</p>
							</template>
						</section>
					</template>
				</article>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup>
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { IonPage, IonHeader, IonContent } from "@ionic/vue"
import { Button, FeatherIcon, createResource } from "frappe-ui"

import { guideSections, guideSteps, knownRoles } from "@/utils/guide"

const __ = inject("$translate")
const user = inject("$user")
const router = useRouter()
const active = ref("check-in")

const access = createResource({
	url: "hr_addon.api.organigram.get_my_hr_access",
	auto: true,
})

const roles = computed(() => {
	if (access.data?.roles) return access.data.roles
	return knownRoles(user.data?.roles)
})

const showManager = computed(
	() => !!access.data?.sees_all_approvals || roles.value.includes("HR Manager") || roles.value.includes("System Manager")
)
const showHr = computed(() => showManager.value || roles.value.includes("HR User"))
const showApprover = computed(
	() =>
		showManager.value ||
		roles.value.includes("Leave Approver") ||
		(access.data?.approves_employees || 0) > 0 ||
		(access.data?.approves_departments || []).length > 0
)

const sections = computed(() =>
	guideSections({
		showApprover: showApprover.value,
		showHr: showHr.value,
		showManager: showManager.value,
	})
)
const toc = computed(() => sections.value.map((section) => ({ id: section.id, title: section.title, audience: section.audience })))
const steps = computed(() => guideSteps(showApprover.value))
const roleLine = computed(() => roles.value.length > 0)

const scopeLine = computed(() => {
	const data = access.data
	if (!data) return ""
	const parts = []
	if (data.sees_all_approvals) {
		parts.push(__("You see every open approval because you are HR Manager or System Manager."))
	}
	if (data.approves_employees) {
		parts.push(
			data.approves_employees === 1
				? __("You are the leave approver for 1 employee.")
				: __("You are the leave approver for {0} employees.", [data.approves_employees])
		)
	}
	if (data.approves_departments?.length) {
		parts.push(__("You approve the departments {0}.", [data.approves_departments.join(", ")]))
	}
	if (!parts.length) {
		parts.push(__("You see your own requests. Approvals stays empty until you are set as someone's leave approver."))
	}
	return parts.join(" ")
})

function dividerBefore(index) {
	const audience = sections.value[index].audience
	if (audience === "all") return false
	return !sections.value.slice(0, index).some((section) => section.audience === audience)
}

function dividerLabel(audience) {
	if (audience === "manager") return __("HR Manager and System Manager")
	if (audience === "hr") return __("HR on the desk")
	return __("Approvers")
}

function dividerClass(audience) {
	if (audience === "manager") return "bg-purple-300"
	if (audience === "hr") return "bg-teal-300"
	return "bg-blue-300"
}

function dividerChip(audience) {
	if (audience === "manager") return "bg-purple-100 text-purple-900"
	if (audience === "hr") return "bg-teal-100 text-teal-900"
	return "bg-blue-100 text-blue-900"
}

function sectionClass(audience) {
	if (audience === "manager") return "is-manager"
	if (audience === "hr") return "is-hr"
	if (audience === "approver") return "is-approver"
	return ""
}

function linkClass(item) {
	const tone =
		item.audience === "manager" ? "text-purple-900" : item.audience === "hr" ? "text-teal-900" : "text-gray-600"
	return [tone, active.value === item.id ? "bg-white font-medium shadow-sm" : "hover:bg-white/70"]
}

function jump(id) {
	active.value = id
	document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

let observer = null

function observeSections() {
	observer?.disconnect()
	document.querySelectorAll("article section[id]").forEach((section) => observer?.observe(section))
}

onMounted(() => {
	observer = new IntersectionObserver(
		(entries) => {
			const visible = entries
				.filter((entry) => entry.isIntersecting)
				.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
			if (visible.length) active.value = visible[0].target.id
		},
		{ rootMargin: "0px 0px -70% 0px" }
	)
	observeSections()
})
watch(sections, () => nextTick(observeSections))
onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.help {
	scroll-margin-top: 0.75rem;
	font-size: 0.875rem;
	line-height: 1.65;
	color: #374151;
}
.help h2 {
	margin-bottom: 0.5rem;
	font-size: 1rem;
	font-weight: 600;
	color: #111827;
}
.help h3 {
	margin: 1rem 0 0.25rem;
	font-size: 0.875rem;
	font-weight: 600;
	color: #111827;
}
.help p + p,
.help ul + p,
.help p + ul,
.help ul + ul {
	margin-top: 0.5rem;
}
.help ul {
	list-style: disc;
	padding-left: 1.15rem;
}
.help li + li {
	margin-top: 0.35rem;
}
.help b {
	font-weight: 600;
	color: #111827;
}
.help .note {
	margin-top: 0.75rem;
	border-left: 3px solid #0065bd;
	border-radius: 0.25rem;
	background: #e9f1f9;
	padding: 0.5rem 0.75rem;
	font-size: 0.8125rem;
}
.is-approver {
	box-shadow: inset 3px 0 0 #0065bd;
}
.is-hr {
	box-shadow: inset 3px 0 0 #0f766e;
}
.is-manager {
	box-shadow: inset 3px 0 0 #7e22ce;
}
@media (prefers-color-scheme: dark) {
	.help {
		color: #d1d5db;
	}
	.help h2,
	.help h3,
	.help b {
		color: #f9fafb;
	}
	.help .note {
		background: rgba(0, 101, 189, 0.2);
	}
}
</style>
