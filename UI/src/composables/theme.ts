import { computed, watch } from "vue"
import { useStorage } from "@vueuse/core"

type AppTheme = "dracula" | "autumn"

const STORAGE_KEY = "ui-theme"

export const theme = useStorage<AppTheme>(STORAGE_KEY, "dracula")

export const isDarkTheme = computed(() => theme.value === "dracula")

const applyTheme = (value: AppTheme) => {
  if (typeof document === "undefined") return
  document.documentElement.setAttribute("data-theme", value)
}

watch(
  theme,
  (value) => applyTheme(value),
  { immediate: true }
)

export const toggleTheme = () => {
  theme.value = theme.value === "dracula" ? "autumn" : "dracula"
}
