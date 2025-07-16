import { prisma } from "@/lib/db"
import { cache } from "react"

export type SettingsMap = Record<string, string>

/**
 * Helper to extract LLM provider settings from SettingsMap.
 */
export function getLLMSettings(settings: SettingsMap) {
  const priorities = (settings.llm_providers || "").split(",").map(p => p.trim()).filter(Boolean)

  const providers = priorities.map((provider) => {
    if (provider === "openai") {
      return {
        provider: provider,
        apiKey: settings.openai_api_key || "",
        model: settings.openai_model_name,
      }
    }
    if (provider === "google") {
      return {
        provider: provider,
        apiKey: settings.google_api_key || "",
        model: settings.google_model_name,
      }
    }
    if (provider === "mistral") {
      return {
        provider: provider,
        apiKey: settings.mistral_api_key || "",
        model: settings.mistral_model_name,
      }
    }
    return null
  }).filter(Boolean)

  return {
    providers,
  }
}

export const getSettings = cache(async (userId: string): Promise<SettingsMap> => {
  const settings = await prisma.setting.findMany({
    where: { userId },
  })

  return settings.reduce((acc, setting) => {
    acc[setting.code] = setting.value || ""
    return acc
  }, {} as SettingsMap)
})

export const updateSettings = cache(async (userId: string, code: string, value: string | undefined) => {
  return await prisma.setting.upsert({
    where: { userId_code: { code, userId } },
    update: { value },
    create: {
      code,
      value,
      name: code,
      userId,
    },
  })
})
