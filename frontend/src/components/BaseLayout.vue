<template>
	<ion-page>
		<ion-header class="ion-no-border app-shell-header">
			<div class="brand-bar w-full app-shell text-white">
				<div class="flex flex-row items-center justify-between gap-3 px-4 py-3">
					<div class="flex min-w-0 flex-row items-center gap-3">
						<router-link
							:to="{ name: 'Home' }"
							class="inline-flex shrink-0 items-center"
							aria-label="Movaria"
						>
							<Wordmark class="h-7 mix-blend-screen sm:h-8" />
						</router-link>
						<h2 v-if="props.pageTitle" class="truncate text-sm font-medium text-gray-300">
							{{ props.pageTitle }}
						</h2>
					</div>
					<div class="flex shrink-0 flex-row items-center gap-3">
						<span v-if="displayName" class="hidden max-w-[8rem] truncate text-sm text-gray-300 sm:inline">
							{{ displayName }}
						</span>
						<router-link
							:to="{ name: 'Notifications' }"
							v-slot="{ navigate }"
							class="flex flex-col items-center text-gray-300"
						>
							<span class="relative inline-block" @click="navigate">
								<FeatherIcon name="bell" class="h-6 w-6" />
								<span
									v-if="unreadNotificationsCount.data"
									class="absolute top-0 right-0.5 inline-block w-2 h-2 bg-red-600 rounded-full border border-gray-900"
								>
								</span>
							</span>
						</router-link>
						<router-link
							:to="{ name: 'Profile' }"
							class="flex flex-col items-center"
						>
							<Avatar
								:image="user.data.user_image"
								:label="user.data.first_name"
								size="xl"
							/>
						</router-link>
					</div>
				</div>
			</div>
		</ion-header>

		<ion-content class="ion-no-padding app-shell-content">
			<div class="flex flex-col min-h-full w-full app-shell">
				<slot name="body"></slot>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup>
import { IonHeader, IonContent, IonPage } from "@ionic/vue"
import { FeatherIcon, Avatar } from "frappe-ui"

import { unreadNotificationsCount } from "@/data/notifications"

import { computed, inject } from "vue"
import Wordmark from "@/components/Wordmark.vue"

const user = inject("$user")
const displayName = computed(() => user.data?.full_name || user.data?.first_name || "")

const props = defineProps({
	pageTitle: {
		type: String,
		required: false,
		default: "",
	},
})
</script>
