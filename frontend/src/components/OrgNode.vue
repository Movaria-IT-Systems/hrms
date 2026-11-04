<template>
	<li class="hr-org-node">
		<div :class="node.dim ? 'opacity-45' : ''">
			<PersonCard :person="node" />
		</div>
		<ul v-if="node.children?.length">
			<OrgNode v-for="child in node.children" :key="child.name" :node="child" />
		</ul>
	</li>
</template>

<script setup>
import PersonCard from "@/components/PersonCard.vue"

defineProps({
	node: { type: Object, required: true },
})
</script>

<style>
.hr-org,
.hr-org ul {
	display: flex;
	justify-content: center;
	padding-left: 0;
	margin: 0;
}
.hr-org ul {
	padding-top: 1.25rem;
	position: relative;
}
.hr-org-node {
	display: flex;
	flex-direction: column;
	align-items: center;
	list-style: none;
	position: relative;
	padding: 1.25rem 0.4rem 0;
}
.hr-org > .hr-org-node {
	padding-top: 0;
}
.hr-org-node::before,
.hr-org-node::after {
	content: "";
	position: absolute;
	top: 0;
	right: 50%;
	width: 50%;
	height: 1.25rem;
	border-top: 1px solid #c8c8c8;
}
.hr-org-node::after {
	right: auto;
	left: 50%;
	border-left: 1px solid #c8c8c8;
}
.hr-org > .hr-org-node::before,
.hr-org > .hr-org-node::after,
.hr-org-node:only-child::before,
.hr-org-node:only-child::after {
	display: none;
}
.hr-org-node:only-child {
	padding-top: 0;
}
.hr-org-node:first-child::before,
.hr-org-node:last-child::after {
	border: 0 none;
}
.hr-org-node:last-child::before {
	border-right: 1px solid #c8c8c8;
	border-radius: 0 6px 0 0;
}
.hr-org-node:first-child::after {
	border-radius: 6px 0 0 0;
}
.hr-org ul::before {
	content: "";
	position: absolute;
	top: 0;
	left: 50%;
	border-left: 1px solid #c8c8c8;
	width: 0;
	height: 1.25rem;
}
</style>
