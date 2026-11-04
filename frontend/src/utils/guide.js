/** How the HR app works. Sections are shown from the signed-in user's roles. */

export const KNOWN_ROLES = [
	"Employee",
	"Employee Self Service",
	"Leave Approver",
	"Expense Approver",
	"HR User",
	"HR Manager",
	"System Manager",
]

const STEPS = [
	{
		icon: "log-in",
		title: "Check in",
		text: "Home, Check In and Check Out. Each press is one Employee Checkin.",
		color: "#0065bd",
	},
	{
		icon: "calendar",
		title: "Plan the day",
		text: "Open the workday calendar. Past days: fix punches. Future days: vacation, sick or home office.",
		color: "#8a7eb8",
	},
	{
		icon: "check-circle",
		title: "Wait for approval",
		text: "The request stays a draft. The leave approver decides it under Approvals.",
		color: "#079455",
	},
]

const APPROVER_STEP = {
	icon: "check-circle",
	title: "Decide requests",
	text: "Approvals lists the drafts of the people you approve. Approve submits them.",
	color: "#079455",
}

export function guideSteps(showApprover) {
	return showApprover ? [STEPS[0], STEPS[1], APPROVER_STEP] : STEPS
}

export function knownRoles(roles) {
	const have = new Set(roles || [])
	return KNOWN_ROLES.filter((role) => have.has(role))
}

export function guideSections({ showApprover, showHr, showManager }) {
	return SECTIONS.filter((section) => {
		if (section.audience === "approver") return showApprover
		if (section.audience === "hr") return showHr
		if (section.audience === "manager") return showManager
		return true
	})
}

const SECTIONS = [
	{
		id: "check-in",
		title: "Check in and hours",
		audience: "all",
		blocks: [
			{
				type: "ul",
				items: [
					{
						lead: "Check In / Check Out",
						text: "On Home. Each press creates an Employee Checkin, IN then OUT. The line under the button is the time of the last one.",
					},
					{
						lead: "Hours",
						text: "Today, this month and this year come from your Workday documents. Target hours come from Weekly Working Hours. Open workday calendar is on that card.",
					},
					{
						lead: "When a day counts",
						text: "Only a weekday that has a row in your submitted Weekly Working Hours. A row with 0 hours is a free day: punches are kept and the time counts as overtime. A weekday with no row is ignored. The day page then tells you to ask HR to add that day with 0 hours.",
					},
					{
						lead: "Overtime balance",
						text: "Shown on Home when the overtime ledger is enabled for the company. Otherwise the card says Not enabled.",
					},
				],
			},
		],
	},
	{
		id: "calendar",
		title: "Workday calendar",
		audience: "all",
		blocks: [
			{
				type: "p",
				text: "Open it from the hours card on Home. It covers the past and 12 months ahead. A past working day with no check-in and no leave is marked missing.",
			},
			{
				type: "ul",
				items: [
					{
						lead: "One day",
						text: "Shows the punches, the requests on that day, and the hours. Check-ins can be added for today or earlier, not for a future day.",
					},
					{
						lead: "Missing punch",
						text: "The day offers a suggested fix. You can add the punch you forgot, or remove a duplicate. Saving rebuilds that Workday.",
					},
					{
						lead: "A whole day with nothing",
						text: "I worked adds the punches. I was away opens vacation, sick or home office.",
					},
					{
						lead: "Several days",
						text: "Tap the first day and the last, or drag. Then choose Vacation, Sick or Home office. The panel shows how many leave days will be booked before you send.",
					},
					{
						lead: "What is not leave",
						text: "A holiday, or a weekday with 0 hours in Weekly Working Hours. Those days are not deducted. A request that falls only on them is refused.",
					},
					{
						lead: "While it is waiting",
						text: "The day has a dashed border. Open it to change the request or withdraw it. After approval the day says Approved and only HR can change it.",
					},
				],
			},
		],
	},
	{
		id: "vacation",
		title: "Vacation",
		audience: "all",
		blocks: [
			{
				type: "p",
				text: "A Leave Application. Any leave type whose name does not contain sick, illness, krank, maladie or medical is shown as vacation.",
			},
			{
				type: "ul",
				items: [
					{
						lead: "Send request",
						text: "Saves a draft: status Open, not submitted. The balance does not move yet. Insights counts the days as waiting.",
					},
					{
						lead: "Who decides",
						text: "Employee → Leave Approver. If that field is empty, the first Leave Approver on the employee's department. The name is copied onto the request when it is saved.",
					},
					{
						lead: "Approved",
						text: "The approver sets status Approved and submits. The leave balance goes down and attendance on the working days becomes On Leave. Holidays in the range are skipped unless the leave type includes holidays.",
					},
					{
						lead: "Rejected",
						text: "Status Rejected, and the request is submitted. The balance does not change.",
					},
					{
						lead: "Half day",
						text: "One half day on the request, on the date you pick.",
					},
					{
						lead: "No allocation",
						text: "The panel says no leave type is available and tells you to ask HR. Leave Without Pay can still be offered. It does not reduce a balance.",
					},
				],
			},
			{
				type: "note",
				text: "You cannot approve your own request when HR Settings → Prevent Self Leave Approval is on.",
			},
		],
	},
	{
		id: "sick",
		title: "Sick",
		audience: "all",
		blocks: [
			{
				type: "p",
				text: "The same Leave Application as vacation. The app shows it as sick when the leave type name contains sick, illness, krank, maladie or medical. There is no separate illness document.",
			},
			{
				type: "ul",
				items: [
					{
						lead: "Same rules as vacation",
						text: "Draft, same approver, same approval. Nothing is approved automatically. The balance moves only when the request is submitted as Approved.",
					},
					{
						lead: "Visible to the company",
						text: "The team calendar shows the leave type. It is not anonymised.",
					},
				],
			},
		],
	},
	{
		id: "home",
		title: "Home office",
		audience: "all",
		blocks: [
			{
				type: "p",
				text: "An Attendance Request with reason Work From Home. It has no balance and needs no allocation. The Attendance Request has no approver field.",
			},
			{
				type: "ul",
				items: [
					{
						lead: "Send request",
						text: "Saves a draft. Attendance stays unchanged until someone submits it.",
					},
					{
						lead: "Who decides it in this app",
						text: "The same person as vacation: Employee → Leave Approver, otherwise the department's first leave approver.",
					},
					{
						lead: "Approve",
						text: "Submits the request and marks those days Work From Home.",
					},
					{
						lead: "Reject",
						text: "Deletes the draft. There is no rejected home office document left behind.",
					},
					{
						lead: "Check-ins",
						text: "Count the same as in the office, including while the request is still waiting.",
					},
					{
						lead: "If it will not save",
						text: "The employee or the company has no holiday list. An employee on shifts also needs the shift on the request.",
					},
				],
			},
			{
				type: "note",
				text: "On the desk, submitting the Attendance Request is the approval. The Employee role can create it and cannot submit it. HR User, HR Manager and System Manager can.",
			},
		],
	},
	{
		id: "my-requests",
		title: "My requests",
		audience: "all",
		blocks: [
			{
				type: "ul",
				items: [
					{
						lead: "What is listed",
						text: "Your Leave Applications and your Work From Home attendance requests, newest dates first.",
					},
					{
						lead: "Change or withdraw",
						text: "Only a draft. For leave, status must still be Open. Withdraw deletes that draft. The badge on Home counts these editable rows.",
					},
					{
						lead: "After a decision",
						text: "The row stays as Approved or Rejected. This screen cannot cancel it. Ask HR.",
					},
				],
			},
		],
	},
	{
		id: "team",
		title: "Team calendar",
		audience: "all",
		blocks: [
			{
				type: "ul",
				items: [
					{
						lead: "Who",
						text: "Every active employee of your company, one row. The department filter lists only departments that are set on an employee.",
					},
					{
						lead: "A cell",
						text: "Work, vacation, sick, home office, holiday, missing or free. A waiting request is marked as pending. The leave type is visible.",
					},
					{
						lead: "Your row",
						text: "Tap a day, then the last day of the period, or drag. Then choose vacation, sick or home office. You can open and change only your own requests.",
					},
				],
			},
		],
	},
	{
		id: "projects",
		title: "Project hours",
		audience: "all",
		blocks: [
			{
				type: "p",
				text: "Books your check-in hours onto an ERPNext project. One Timesheet per month, marked with Project Hours Month (for example 2026-11). The hours are not a separate document.",
			},
			{
				type: "ul",
				items: [
					{
						lead: "When a day can be booked",
						text: "After a check-in has produced hours. The number on a day is hours not booked yet. The target on your schedule is not enough.",
					},
					{
						lead: "What you enter",
						text: "An open project of your company, an activity, the hours, and What did you do? (required, 500 characters). The stepper moves in half hours. The last step takes a remainder under half an hour.",
					},
					{
						lead: "Activities",
						text: "Only Development and Operational work. The stored names are Development and Operational. Do not rename them.",
					},
					{
						lead: "Save",
						text: "Submits that month's Timesheet. The next save replaces the whole month. Do not edit the same month on the desk at the same time.",
					},
					{
						lead: "Cost",
						text: "Activity Cost for you and that activity. Billing rate stays 0. These lines are not billable. The project gets the hours and the costing amount. You do not see the rates.",
					},
					{
						lead: "A project missing from the list",
						text: "It is not Open, or it belongs to another company. One you already booked this month stays on the list if it is closed later.",
					},
				],
			},
			{
				type: "note",
				text: "A salary structure with Salary Slip Based on Timesheet would pull these hours into payroll. That checkbox stays off for people who book here.",
			},
		],
	},
	{
		id: "insights",
		title: "Insights",
		audience: "all",
		blocks: [
			{
				type: "p",
				text: "Your own week, month, last 30 days, year, or a chosen range of up to 366 days. A chosen range longer than 62 days uses the compact year view. Nothing on this page is a team report.",
			},
			{
				type: "ul",
				items: [
					{
						lead: "Target and actual",
						text: "Hours up to today. Later days are on the chart and are not part of the balance.",
					},
					{
						lead: "Vacation and sick",
						text: "Taken in the period, still waiting, and remaining from your Leave Allocation.",
					},
					{
						lead: "Home office",
						text: "Days in the period, including days still waiting. There is no remaining balance.",
					},
					{
						lead: "Also",
						text: "Missing days, average start and end from your punches, project hours booked against hours worked, and the overtime balance when the ledger is on.",
					},
				],
			},
		],
	},
	{
		id: "organigram",
		title: "Organigram (beta)",
		audience: "all",
		blocks: [
			{
				type: "ul",
				items: [
					{
						lead: "Organisation",
						text: "The reports-to tree: Employee → Reports To. People with no manager in the company sit at the top. If nobody has a manager, people are grouped by department instead.",
					},
					{
						lead: "Approval",
						text: "The leave-approver tree: each person sits under the colleague named in Employee → Leave Approver. HR Manager and System Manager can still approve every request. A department leave approver also sees that whole department, even when they are not the person on the line.",
					},
					{
						lead: "Roles",
						text: "Groups the same people by HR role. A person with several roles appears in each group. The last choice is remembered in this browser.",
					},
					{
						lead: "What a role chip is",
						text: "An HR role on that person's user: Employee, Employee Self Service, Leave Approver, Expense Approver, HR User, HR Manager, System Manager. Stock, accounts and project roles are not listed.",
					},
					{
						lead: "Leave approver for N",
						text: "N active colleagues in the company have this person in Employee → Leave Approver.",
					},
					{
						lead: "Department leave approver",
						text: "Departments where this person is in the department's Leave Approver table.",
					},
					{
						lead: "Approved by",
						text: "The Leave Approver stored on that employee. Empty means no approver is set, so only an HR Manager or System Manager sees the request on Approvals.",
					},
					{
						lead: "Role profile",
						text: "The profile that fills the user's roles. Saving the user again replaces their roles with the profile.",
					},
				],
			},
		],
	},
	{
		id: "other",
		title: "Other screens",
		audience: "all",
		blocks: [
			{
				type: "ul",
				items: [
					{
						lead: "Request Attendance",
						text: "The standard Attendance Request, for reasons other than the home office flow above. Submitting it is still limited to HR User, HR Manager and System Manager.",
					},
					{
						lead: "Request a Shift and shift assignments",
						text: "Standard shift documents. The approver is Shift Request Approver on the employee or the department, not the leave approver.",
					},
					{
						lead: "Request Leave",
						text: "The standard leave form. The calendar and My requests cover the same Leave Application.",
					},
					{
						lead: "Claim an Expense",
						text: "Expense Claim. The approver is Employee → Expense Approver. The Expense Approver role is what the desk checks.",
					},
					{
						lead: "Request an Advance and Salary",
						text: "Your own Employee Advances and Salary Slips.",
					},
				],
			},
		],
	},
	{
		id: "who",
		title: "Who sees what",
		audience: "all",
		blocks: [
			{
				type: "ul",
				items: [
					{
						lead: "You",
						text: "Your check-ins, workdays, requests, insights, project hours, advances and salary slips.",
					},
					{
						lead: "The company",
						text: "The team calendar and the organigram: every active employee of your company.",
					},
					{
						lead: "Your leave approver",
						text: "Your open vacation, sick and home office drafts, on Approvals.",
					},
					{
						lead: "A department leave approver",
						text: "The open drafts of every active employee in that department, including people who also have their own leave approver.",
					},
					{
						lead: "HR Manager and System Manager",
						text: "Every open vacation, sick and home office draft, on Approvals. HR User does not get that list.",
					},
					{
						lead: "The desk",
						text: "Role permissions, plus a User Permission on Employee if one exists. That user permission does not apply to Approvals, the team calendar or the organigram. Those screens read the company on purpose.",
					},
				],
			},
			{
				type: "note",
				text: "Workday and the overtime ledger stay closed to the Employee role on the desk. The app reads your own rows through its own methods.",
			},
		],
	},
	{
		id: "records",
		title: "Records this app writes",
		audience: "all",
		blocks: [
			{
				type: "p",
				text: "The app does not keep a second copy. A screen that looks empty is usually a missing Employee link, Weekly Working Hours, Leave Allocation or holiday list.",
			},
			{
				type: "ul",
				items: [
					{
						lead: "Employee Checkin",
						text: "IN or OUT from Check In, Check Out, or a punch added on a day.",
					},
					{
						lead: "Workday",
						text: "One employee, one date, target and actual hours. Rebuilt from the punches. Not a form you submit in the app.",
					},
					{
						lead: "Leave Application",
						text: "Vacation and sick. Waiting: status Open, not submitted. Approved: status Approved, submitted. Rejected: status Rejected, submitted. Withdrawn: the draft is deleted.",
					},
					{
						lead: "Attendance Request",
						text: "Home office uses reason Work From Home. Waiting: not submitted. Approved: submitted, and attendance becomes Work From Home. Rejected in the app: the draft is deleted.",
					},
					{
						lead: "Attendance",
						text: "Written when a leave or home office request is submitted, not when the draft is saved.",
					},
					{
						lead: "Timesheet",
						text: "Project hours. One submitted sheet per employee and month. The next save in the app replaces that month.",
					},
				],
			},
		],
	},
	{
		id: "approvals",
		title: "Approvals",
		audience: "approver",
		blocks: [
			{
				type: "p",
				text: "Home → Approvals. Open vacation, sick and home office requests you may decide. The badge on Home counts them by kind.",
			},
			{
				type: "ul",
				items: [
					{
						lead: "Whose requests",
						text: "Active employees with you in Employee → Leave Approver, and every active employee of a department where you are a Leave Approver. The screen does not read the approver copied onto the request.",
					},
					{
						lead: "Leave Approver role",
						text: "Not checked here. You see the queue because you are named on the employee or the department. The role is what lets you submit a Leave Application on the desk.",
					},
					{
						lead: "Approve vacation or sick",
						text: "Sets status Approved and submits. The balance drops and attendance becomes On Leave.",
					},
					{
						lead: "Reject vacation or sick",
						text: "Sets status Rejected and submits.",
					},
					{
						lead: "Approve home office",
						text: "Submits the Attendance Request.",
					},
					{
						lead: "Reject home office",
						text: "Deletes the draft. The button says Remove request.",
					},
					{
						lead: "Worked hours on the card",
						text: "Check-in hours already on those dates, so you can see that the person worked on a day they also requested.",
					},
					{
						lead: "Your own request",
						text: "Blocked when Prevent Self Leave Approval is on, even if you are HR Manager.",
					},
					{
						lead: "Empty list",
						text: "Nothing is waiting for you. Either nobody you approve has a draft, or you are not set as Leave Approver on the employee or the department.",
					},
				],
			},
		],
	},
	{
		id: "hr-desk",
		title: "HR User on the desk",
		audience: "hr",
		blocks: [
			{
				type: "ul",
				items: [
					{
						lead: "Leave Application and Attendance Request",
						text: "HR User can create, read and submit both on the desk. Submitting a home office request there is the approval. There is still no approver field on it.",
					},
					{
						lead: "Approvals in this app",
						text: "HR User alone does not list other people's requests. The list appears when you are also their leave approver, a department leave approver, HR Manager or System Manager.",
					},
					{
						lead: "User Permission",
						text: "If your user is limited to your own Employee, desk lists stay on your documents. Approvals in this app ignores that limit for HR Manager and System Manager.",
					},
				],
			},
		],
	},
	{
		id: "manager-queue",
		title: "Why a manager sees every request",
		audience: "manager",
		blocks: [
			{
				type: "p",
				text: "You have HR Manager or System Manager. Approvals therefore loads every open vacation, sick and home office draft, not only the people who name you as Leave Approver.",
			},
			{
				type: "ul",
				items: [
					{
						lead: "To stop that for one person",
						text: "Take HR Manager and System Manager off that user. HR User can stay. They keep the desk and lose the full list in this app.",
					},
					{
						lead: "Role profile",
						text: "If the role comes from a profile such as a project-manager profile, remove it from the profile. Saving the user copies the profile over any role added by hand.",
					},
					{
						lead: "After that",
						text: "Set Employee → Leave Approver to the person who should decide. Until then, only the remaining HR Managers and System Managers see the draft.",
					},
				],
			},
		],
	},
	{
		id: "setup",
		title: "What has to exist before a request works",
		audience: "manager",
		blocks: [
			{
				type: "ul",
				items: [
					{
						lead: "Employee",
						text: "Active, company, date of joining, User ID of their user, department. Holiday list on the employee or on the company.",
					},
					{
						lead: "Leave Approver",
						text: "On the employee, or as the first Leave Approver of the department. Saving the employee adds the Leave Approver role. A role profile removes it again on the next save of the user unless the role is in the profile.",
					},
					{
						lead: "Weekly Working Hours",
						text: "Submitted, covering the period, one row per weekday. Working days have the target hours. Saturday and Sunday have 0 hours, otherwise an empty weekend is not a free day.",
					},
					{
						lead: "Leave type, period, allocation",
						text: "A Leave Period for the year. An allocation per type the person may take. Sick types must use one of the name words under Sick. Leave Without Pay is the fallback without an allocation.",
					},
					{
						lead: "Leave Approver Mandatory",
						text: "HR Settings. It only makes the field required on the desk form. The app still saves a draft when the approver is empty.",
					},
					{
						lead: "Home office",
						text: "No extra leave type and no extra field. The holiday list is required. Approval in this app already uses the leave approver.",
					},
					{
						lead: "Project hours",
						text: "Open projects. Activity Types Development and Operational, created the first time someone opens the page. Activity Cost per employee and activity, billing rate 0. Salary structures of these employees do not use Salary Slip Based on Timesheet.",
					},
				],
			},
		],
	},
	{
		id: "roles",
		title: "Roles",
		audience: "manager",
		blocks: [
			{
				type: "ul",
				items: [
					{
						lead: "Employee",
						text: "Uses this app. The employee record's User ID must be this user.",
					},
					{
						lead: "Employee Self Service",
						text: "Desk self-service. This app does not check it.",
					},
					{
						lead: "Leave Approver",
						text: "Desk: read and submit Leave Applications. App: not required for Approvals. Being named on the employee or the department is what fills the queue.",
					},
					{
						lead: "Expense Approver",
						text: "Expense claims. Not used for leave or home office.",
					},
					{
						lead: "HR User",
						text: "Desk access to HR documents, including submit on leave and attendance requests. Not the full Approvals list.",
					},
					{
						lead: "HR Manager",
						text: "Full Approvals list in this app, and full HR access on the desk. Give it only to people who should decide every request.",
					},
					{
						lead: "System Manager",
						text: "Full Approvals list in this app, same as HR Manager, and the rest of the system.",
					},
				],
			},
			{
				type: "note",
				text: "The organigram shows these seven roles and no others. Press ? anywhere outside a text field to open this guide.",
			},
		],
	},
]
