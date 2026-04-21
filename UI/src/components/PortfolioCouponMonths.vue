<template>
	<div class="flex min-w-[24rem] flex-wrap gap-1.5">
		<span
			v-for="(month, index) in monthLabels"
			:key="month"
			class="badge badge-sm"
			:class="activeMonths[index] ? 'badge-success' : 'badge-neutral'"
		>
			{{ month }}
		</span>
	</div>
</template>

<script setup lang="ts">
const monthLabels = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"]

withDefaults(
	defineProps<{
		activeMonths?: boolean[]
	}>(),
	{
		activeMonths: () => Array.from({ length: 12 }, () => false)
	}
)
</script>
