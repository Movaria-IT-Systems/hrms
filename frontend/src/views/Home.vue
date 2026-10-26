<template>
	<BaseLayout>
		<template #body>
			<div class="grid grid-cols-1 lg:grid-cols-2 lg:items-start my-7 p-4 lg:px-8 gap-7 lg:gap-x-10">
				<div class="flex flex-col items-center gap-7 min-w-0">
					<CheckInPanel @changed="refreshHours" />
					<HoursSummary ref="hours" />
				</div>
				<div class="flex flex-col items-center gap-7 min-w-0">
					<QuickLinks :items="quickLinks" :title="__('Quick Links')" />
				</div>
			</div>
		</template>
	</BaseLayout>
</template>

<script setup>
import { computed, inject, markRaw, onBeforeUnmount, ref } from "vue"
import { onIonViewWillEnter, onIonViewWillLeave } from "@ionic/vue"
import { createResource } from "frappe-ui"

import CheckInPanel from "@/components/CheckInPanel.vue"
import HoursSummary from "@/components/HoursSummary.vue"
import QuickLinks from "@/components/QuickLinks.vue"
import BaseLayout from "@/components/BaseLayout.vue"
import AttendanceIcon from "@/components/icons/AttendanceIcon.vue"
import ShiftIcon from "@/components/icons/ShiftIcon.vue"
import LeaveIcon from "@/components/icons/LeaveIcon.vue"
import ExpenseIcon from "@/components/icons/ExpenseIcon.vue"
import EmployeeAdvanceIcon from "@/components/icons/EmployeeAdvanceIcon.vue"
import SalaryIcon from "@/components/icons/SalaryIcon.vue"
import TeamIcon from "@/components/icons/TeamIcon.vue"
import ProjectIcon from "@/components/icons/ProjectIcon.vue"
import { typeBadges } from "@/utils/dayKinds"

const __ = inject("$translate")
const hours = ref(null)
let refreshTimer = null

const pendingApprovals = createResource({
	url: "hr_addon.api.approvals.get_pending_requests",
	auto: true,
})

const myRequests = createResource({
	url: "hr_addon.api.my_requests.get_my_requests",
	auto: true,
})

function refreshHours() {
	hours.value?.reload()
	pendingApprovals.reload()
	myRequests.reload()
}

function onVisible() {
	if (document.visibilityState === "visible") refreshHours()
}

onIonViewWillEnter(() => {
	refreshHours()
	document.removeEventListener("visibilitychange", onVisible)
	document.addEventListener("visibilitychange", onVisible)
	clearInterval(refreshTimer)
	refreshTimer = setInterval(() => {
		if (document.visibilityState !== "hidden") refreshHours()
	}, 60_000)
})

onIonViewWillLeave(() => {
	document.removeEventListener("visibilitychange", onVisible)
	clearInterval(refreshTimer)
	refreshTimer = null
})

onBeforeUnmount(() => {
	document.removeEventListener("visibilitychange", onVisible)
	clearInterval(refreshTimer)
})

const quickLinks = computed(() => [
	{
		icon: markRaw(ProjectIcon),
		title: __("Project hours"),
		route: "ProjectHoursView",
	},
	{
		icon: markRaw(TeamIcon),
		title: __("Team Calendar"),
		route: "TeamCalendarView",
	},
	{
		icon: markRaw(LeaveIcon),
		title: __("Approvals"),
		route: "ApprovalsView",
		badges: typeBadges(pendingApprovals.data || []),
	},
	{
		icon: markRaw(LeaveIcon),
		title: __("My requests"),
		route: "MyRequestsView",
		badges: typeBadges((myRequests.data || []).filter((row) => row.editable)),
	},
	{
		icon: markRaw(AttendanceIcon),
		title: __("Request Attendance"),
		route: "AttendanceRequestFormView",
	},
	{
		icon: markRaw(ShiftIcon),
		title: __("Request a Shift"),
		route: "ShiftRequestFormView",
	},
	{
		icon: markRaw(LeaveIcon),
		title: __("Request Leave"),
		route: "LeaveApplicationFormView",
	},
	{
		icon: markRaw(ExpenseIcon),
		title: __("Claim an Expense"),
		route: "ExpenseClaimFormView",
	},
	{
		icon: markRaw(EmployeeAdvanceIcon),
		title: __("Request an Advance"),
		route: "EmployeeAdvanceFormView",
	},
	{
		icon: markRaw(SalaryIcon),
		title: __("View Salary Slips"),
		route: "SalarySlipsDashboard",
	},
])
</script>
