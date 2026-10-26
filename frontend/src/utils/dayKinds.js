// Colours and icons for leave, illness and home office, shared by the
// personal workday calendar and the team calendar.
export const REQUEST_STYLES = {
	leave: {
		solid: "bg-blue-100 text-blue-900 border border-blue-300",
		soft: "bg-blue-50 text-blue-800",
		border: "border-blue-400",
		icon: "sun",
	},
	sick: {
		solid: "bg-red-100 text-red-900 border border-red-300",
		soft: "bg-red-50 text-red-800",
		border: "border-red-400",
		icon: "thermometer",
	},
	home: {
		solid: "bg-purple-100 text-purple-900 border border-purple-300",
		soft: "bg-purple-50 text-purple-800",
		border: "border-purple-400",
		icon: "home",
	},
}

export const KIND_BADGE = {
	leave: "bg-blue-100 text-blue-900",
	sick: "bg-red-100 text-red-900",
	home: "bg-purple-100 text-purple-900",
	all: "bg-gray-200 text-gray-800",
}

const KIND_ORDER = ["leave", "sick", "home"]

export function typeBadges(rows) {
	return KIND_ORDER.map((kind) => ({
		kind,
		count: rows.filter((row) => row.kind === kind).length,
	})).filter((badge) => badge.count > 0)
}

export const PENDING_BORDER = "border-2 border-dashed"

// The request that decides how a day from get_my_workdays looks, or null.
export function requestOnDay(day) {
	const leaveStatuses = ["On Leave", "Pending Leave", "Half Day"]
	if (day.leave && leaveStatuses.includes(day.status)) {
		return {
			kind: day.leave.illness ? "sick" : "leave",
			pending: day.leave.docstatus === 0,
			halfDay: day.status === "Half Day",
		}
	}
	if (day.home_office && !["Missing", "Absent"].includes(day.status)) {
		return {
			kind: "home",
			pending: day.home_office.docstatus === 0,
			halfDay: Boolean(day.home_office.half_day),
		}
	}
	return null
}

export function requestClass(kind, pending) {
	const style = REQUEST_STYLES[kind]
	if (!style) return ""
	return pending ? `${style.soft} ${PENDING_BORDER} ${style.border}` : style.solid
}
