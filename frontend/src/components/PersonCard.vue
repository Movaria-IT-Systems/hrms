<template>
	<article
		class="w-56 rounded-2xl border bg-white px-3 py-3 text-left"
		:class="person.is_me ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'"
	>
		<div class="flex items-start gap-2">
			<img
				v-if="person.image"
				:src="person.image"
				:alt="person.employee_name"
				class="h-9 w-9 shrink-0 rounded-full object-cover"
			/>
			<span
				v-else
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600"
			>
				{{ initials }}
			</span>
			<div class="min-w-0">
				<div class="truncate text-sm font-semibold text-gray-900">{{ person.employee_name }}</div>
				<div v-if="person.designation" class="truncate text-xs text-gray-500">{{ person.designation }}</div>
				<div v-if="person.department" class="truncate text-[11px] text-gray-500">{{ person.department }}</div>
				<div v-if="!person.designation && !person.department" class="truncate text-xs text-gray-500">{{ person.name }}</div>
			</div>
		</div>
		<div v-if="person.roles?.length" class="mt-2 flex flex-wrap gap-1">
			<span
				v-for="role in person.roles"
				:key="role"
				class="rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4"
				:class="roleClass(role)"
			>
				{{ role }}
			</span>
		</div>
		<p v-else class="mt-2 text-[11px] text-gray-400">{{ __("No HR role on the user") }}</p>
		<p v-if="person.role_profile" class="mt-1.5 truncate text-[11px] text-gray-500">
			{{ person.role_profile }}
		</p>
		<p v-if="person.approves_count" class="mt-1 text-[11px] text-blue-800">
			{{
				person.approves_count === 1
					? __("Leave approver for 1 person")
					: __("Leave approver for {0} people", [person.approves_count])
			}}
		</p>
		<p v-if="person.department_approver_of?.length" class="mt-1 text-[11px] leading-snug text-blue-800">
			{{ __("Department leave approver") }}: {{ person.department_approver_of.join(", ") }}
		</p>
		<p v-if="person.leave_approver_name" class="mt-1 truncate text-[11px] text-gray-500">
			{{ __("Approved by {0}", [person.leave_approver_name]) }}
		</p>
	</article>
</template>

<script setup>
import { computed, inject } from "vue"

const __ = inject("$translate")

const props = defineProps({
	person: { type: Object, required: true },
})

const initials = computed(() =>
	(props.person.employee_name || "?")
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase()
)

const ROLE_CLASS = {
	Employee: "bg-gray-100 text-gray-700",
	"Employee Self Service": "bg-slate-100 text-slate-700",
	"Leave Approver": "bg-blue-100 text-blue-800",
	"Expense Approver": "bg-amber-100 text-amber-900",
	"HR User": "bg-teal-100 text-teal-900",
	"HR Manager": "bg-purple-100 text-purple-900",
	"System Manager": "bg-rose-100 text-rose-900",
}

function roleClass(role) {
	return ROLE_CLASS[role] || "bg-gray-100 text-gray-700"
}
</script>
