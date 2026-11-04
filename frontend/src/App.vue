<template>
	<ion-app>
		<ion-router-outlet id="main-content" />
		<Toasts />

		<InstallPrompt />
	</ion-app>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { IonApp, IonRouterOutlet } from "@ionic/vue"

import { Toasts } from "frappe-ui"

import InstallPrompt from "@/components/InstallPrompt.vue"
import { showNotification } from "@/utils/pushNotifications"

const router = useRouter()

function openGuide(event) {
	if (event.key !== "?" || event.metaKey || event.ctrlKey || event.altKey) return
	const tag = event.target?.tagName
	if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || event.target?.isContentEditable) return
	event.preventDefault()
	router.push({ name: "GuideView" })
}

onMounted(() => {
	window?.frappePushNotification?.onMessage((payload) => {
		showNotification(payload)
	})
	window.addEventListener("keydown", openGuide)
})

onUnmounted(() => window.removeEventListener("keydown", openGuide))
</script>
