<template>
	<ion-page>
		<ion-header class="ion-no-border app-shell-header">
			<div class="w-full app-shell">
				<div class="flex flex-row items-center border-b bg-white px-3 py-4 shadow-sm">
					<Button variant="ghost" class="!px-1 mr-1 hover:bg-white" @click="router.back()">
						<FeatherIcon name="chevron-left" class="h-5 w-5" />
					</Button>
					<div class="min-w-0">
						<div class="flex items-center gap-2">
							<h2 class="text-xl font-semibold text-gray-900">{{ __("Organigram") }}</h2>
							<span class="rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Beta</span>
						</div>
						<p class="truncate text-xs text-gray-500">{{ subtitle }}</p>
					</div>
				</div>
			</div>
		</ion-header>
		<ion-content class="app-shell-content">
			<div class="flex min-h-full w-full flex-col gap-4 p-4 app-shell lg:px-8">
				<div class="flex flex-wrap items-center gap-2">
					<button
						v-for="option in views"
						:key="option.value"
						type="button"
						class="rounded-full border px-3 py-1.5 text-sm font-medium"
						:class="view === option.value ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700'"
						@click="rememberStructure(option.value)"
					>
						{{ option.label }}
					</button>
					<input
						v-model="query"
						type="search"
						class="min-w-[12rem] flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800"
						:placeholder="__('Search name, role, department')"
					/>
				</div>

				<div class="flex flex-wrap gap-1.5">
					<button
						v-for="role in roleFilters"
						:key="role"
						type="button"
						class="rounded-full border px-2.5 py-1 text-xs font-semibold"
						:class="selectedRole === role ? 'border-blue-700 bg-blue-700 text-white' : 'border-gray-200 bg-white text-gray-700'"
						@click="selectedRole = selectedRole === role ? '' : role"
					>
						{{ role }}
					</button>
				</div>

				<p v-if="view === 'organisation' && chart.data && !chart.data.has_reporting_line" class="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
					{{ __("No reporting line is set. People are grouped by department. Set Employee → Reports To to build the tree.") }}
				</p>
				<p v-else-if="view === 'approval' && chart.data" class="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
					{{
						chart.data.has_approval_line
							? __("Each person sits under the colleague named in Employee → Leave Approver. HR Manager and System Manager can still approve every request. A department leave approver also sees that department.")
							: __("No leave approver points at a colleague in this company, so there is no approval tree yet. Set Employee → Leave Approver. HR Manager and System Manager can still approve every request.")
					}}
				</p>

				<div v-if="chart.loading && !chart.data" class="py-10 text-center text-sm text-gray-500">
					{{ __("Loading") }}
				</div>
				<p v-else-if="chart.error" class="text-sm text-red-700">{{ __("The organigram could not be loaded.") }}</p>
				<p v-else-if="!visiblePeople.length" class="py-10 text-center text-sm text-gray-500">
					{{ __("Nobody matches.") }}
				</p>

				<div v-else-if="view === 'roles'" class="flex flex-col gap-6">
					<section v-for="group in roleGroups" :key="group.role">
						<h3 class="mb-2 text-sm font-semibold text-gray-900">
							{{ group.role }}
							<span class="font-normal text-gray-500">{{ group.people.length }}</span>
						</h3>
						<p class="mb-3 max-w-3xl text-xs leading-relaxed text-gray-500">{{ group.text }}</p>
						<div class="flex flex-wrap gap-3">
							<PersonCard v-for="person in group.people" :key="person.name" :person="person" />
						</div>
					</section>
				</div>

				<div v-else-if="showTree" class="overflow-x-auto pb-6">
					<ul class="hr-org w-max min-w-full">
						<OrgNode v-for="node in prunedRoots" :key="node.name" :node="node" />
					</ul>
				</div>

				<div v-else-if="view === 'approval'" class="flex flex-wrap gap-3">
					<PersonCard v-for="person in visiblePeople" :key="person.name" :person="person" />
				</div>

				<div v-else class="flex flex-col gap-6">
					<section v-for="group in departmentGroups" :key="group.department">
						<h3 class="mb-2 text-sm font-semibold text-gray-900">{{ group.department }}</h3>
						<div class="flex flex-wrap gap-3">
							<PersonCard v-for="person in group.people" :key="person.name" :person="person" />
						</div>
					</section>
				</div>

				<section v-if="chart.data?.legend" class="mt-2 rounded-2xl border border-gray-100 bg-white p-4">
					<h3 class="text-sm font-semibold text-gray-900">{{ __("Roles on the chart") }}</h3>
					<ul class="mt-2 space-y-1.5 text-sm text-gray-600">
						<li v-for="item in chart.data.legend" :key="item.role">
							<span class="font-semibold text-gray-900">{{ item.role }}.</span>
							{{ item.text }}
						</li>
					</ul>
				</section>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup>
import { computed, inject, ref } from "vue"
import { useRouter } from "vue-router"
import { IonPage, IonHeader, IonContent } from "@ionic/vue"
import { Button, FeatherIcon, createResource } from "frappe-ui"

import OrgNode from "@/components/OrgNode.vue"
import PersonCard from "@/components/PersonCard.vue"

const __ = inject("$translate")
const router = useRouter()
const STRUCTURES = ["organisation", "approval", "roles"]
const storedStructure = window.localStorage.getItem("hr-organigram-structure")
const view = ref(STRUCTURES.includes(storedStructure) ? storedStructure : "organisation")
const query = ref("")
const selectedRole = ref("")

const chart = createResource({
	url: "hr_addon.api.organigram.get_organigram",
	auto: true,
})

const views = computed(() => [
	{ value: "organisation", label: __("Organisation") },
	{ value: "approval", label: __("Approval") },
	{ value: "roles", label: __("Roles") },
])

const subtitle = computed(() => {
	const company = chart.data?.company
	const structure =
		view.value === "approval"
			? __("Who approves requests")
			: view.value === "roles"
				? __("HR roles")
				: __("Who people report to")
	return company ? `${company} · ${structure}` : structure
})

const showTree = computed(() => {
	if (view.value === "approval") return !!chart.data?.has_approval_line
	if (view.value === "organisation") return !!chart.data?.has_reporting_line
	return false
})

function rememberStructure(value) {
	view.value = value
	window.localStorage.setItem("hr-organigram-structure", value)
}

const people = computed(() => chart.data?.people || [])

const roleFilters = computed(() => chart.data?.legend?.map((item) => item.role) || [])

function matches(person) {
	if (selectedRole.value && !(person.roles || []).includes(selectedRole.value)) return false
	const needle = query.value.trim().toLowerCase()
	if (!needle) return true
	const haystack = [
		person.employee_name,
		person.designation,
		person.department,
		person.role_profile,
		person.leave_approver_name,
		...(person.roles || []),
		...(person.department_approver_of || []),
	]
		.filter(Boolean)
		.join(" ")
		.toLowerCase()
	return haystack.includes(needle)
}

const visiblePeople = computed(() => people.value.filter(matches))

const roleGroups = computed(() => {
	const legend = chart.data?.legend || []
	return legend
		.map((item) => ({
			role: item.role,
			text: item.text,
			people: visiblePeople.value.filter((person) => (person.roles || []).includes(item.role)),
		}))
		.filter((group) => group.people.length)
})

const departmentGroups = computed(() => {
	const groups = new Map()
	for (const person of visiblePeople.value) {
		const department = person.department || __("No department")
		if (!groups.has(department)) groups.set(department, [])
		groups.get(department).push(person)
	}
	return [...groups.entries()]
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([department, members]) => ({ department, people: members }))
})

function prune(node) {
	const children = (node.children || []).map(prune).filter(Boolean)
	const self = matches(node)
	if (!self && !children.length) return null
	return { ...node, dim: !self, children }
}

const prunedRoots = computed(() => {
	const roots = view.value === "approval" ? chart.data?.approval_roots : chart.data?.roots
	return (roots || []).map(prune).filter(Boolean)
})
</script>
