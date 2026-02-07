import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type {
  SettingLevel,
  KodiSettingSection,
  KodiSettingCategory,
  KodiSetting,
  GetSectionsResponse,
  GetCategoriesResponse,
  GetSettingsResponse,
} from '@/api/types/settings';

/** Query keys for settings */
export const settingsKeys = {
  all: ['settings'] as const,
  sections: (level: SettingLevel) => [...settingsKeys.all, 'sections', level] as const,
  categories: (level: SettingLevel, section: string) =>
    [...settingsKeys.all, 'categories', level, section] as const,
  settings: (level: SettingLevel) => [...settingsKeys.all, 'list', level] as const,
  settingsByCategory: (level: SettingLevel, section: string, category: string) =>
    [...settingsKeys.all, 'byCategory', level, section, category] as const,
  setting: (id: string) => [...settingsKeys.all, 'detail', id] as const,
};

/** Fetch all settings sections */
export function useKodiSettingSections(level: SettingLevel = 'standard') {
  return useQuery({
    queryKey: settingsKeys.sections(level),
    queryFn: async ({ signal }): Promise<KodiSettingSection[]> => {
      const response = await kodi.call<GetSectionsResponse>(
        'Settings.GetSections',
        { level },
        signal
      );
      return response.sections;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - sections rarely change
  });
}

/** Fetch categories for a section */
export function useKodiSettingCategories(section: string, level: SettingLevel = 'standard') {
  return useQuery({
    queryKey: settingsKeys.categories(level, section),
    queryFn: async ({ signal }): Promise<KodiSettingCategory[]> => {
      const response = await kodi.call<GetCategoriesResponse>(
        'Settings.GetCategories',
        { level, section },
        signal
      );
      return response.categories;
    },
    enabled: !!section,
    staleTime: 1000 * 60 * 5,
  });
}

/** Fetch all settings */
export function useKodiSettings(level: SettingLevel = 'standard') {
  return useQuery({
    queryKey: settingsKeys.settings(level),
    queryFn: async ({ signal }): Promise<KodiSetting[]> => {
      const response = await kodi.call<GetSettingsResponse>(
        'Settings.GetSettings',
        { level },
        signal
      );
      return response.settings;
    },
    staleTime: 1000 * 60, // 1 minute - settings may change
  });
}

/** Fetch settings filtered by section and category */
export function useKodiSettingsByCategory(
  section: string,
  category: string,
  level: SettingLevel = 'standard'
) {
  return useQuery({
    queryKey: settingsKeys.settingsByCategory(level, section, category),
    queryFn: async ({ signal }): Promise<KodiSetting[]> => {
      const response = await kodi.call<GetSettingsResponse>(
        'Settings.GetSettings',
        { level, filter: { section, category } },
        signal
      );
      return response.settings;
    },
    enabled: !!section && !!category,
    staleTime: 1000 * 60,
  });
}

/** Get settings grouped by section and category */
export function useKodiSettingsGrouped(level: SettingLevel = 'standard') {
  const { data: settings, ...rest } = useKodiSettings(level);

  // Group settings by their ID prefix (section.category pattern)
  const grouped = settings?.reduce(
    (acc, setting) => {
      const parts = setting.id.split('.');
      // Setting IDs are like "videoplayer.usedisplayasclock"
      // The first part is typically the category
      const category = parts[0] ?? 'other';

      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(setting);
      return acc;
    },
    {} as Record<string, KodiSetting[]>
  );

  return { data: grouped, ...rest };
}

/** Filter settings by category ID prefix */
export function filterSettingsByCategory(
  settings: KodiSetting[],
  categoryId: string
): KodiSetting[] {
  return settings.filter((s) => s.id.startsWith(categoryId + '.') || s.id.startsWith(categoryId));
}

/** Mutation to update a setting value */
export function useUpdateKodiSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      setting,
      value,
    }: {
      setting: string;
      value: boolean | number | string | string[];
    }) => {
      return kodi.call<boolean>('Settings.SetSettingValue', {
        setting,
        value,
      });
    },
    onSuccess: (_data, variables) => {
      // Invalidate all settings queries to refresh values
      void queryClient.invalidateQueries({ queryKey: settingsKeys.all });

      // Also update the specific setting in cache optimistically
      queryClient.setQueryData<KodiSetting[]>(settingsKeys.settings('standard'), (old) =>
        old?.map((s) =>
          s.id === variables.setting ? { ...s, value: variables.value as never } : s
        )
      );
      queryClient.setQueryData<KodiSetting[]>(settingsKeys.settings('expert'), (old) =>
        old?.map((s) =>
          s.id === variables.setting ? { ...s, value: variables.value as never } : s
        )
      );
    },
  });
}

/** Reset a setting to default */
export function useResetKodiSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setting: string) => {
      return kodi.call<boolean>('Settings.ResetSettingValue', {
        setting,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

/** Addon info returned from Addons.GetAddons */
interface KodiAddon {
  addonid: string;
  name: string;
  type: string;
}

interface GetAddonsResponse {
  addons?: KodiAddon[];
}

/** Fetch addons of a specific type (for addon-type settings) */
export function useKodiAddons(addonType: string | undefined) {
  return useQuery({
    queryKey: ['addons', addonType],
    queryFn: async ({ signal }): Promise<KodiAddon[]> => {
      if (!addonType) return [];
      const response = await kodi.call<GetAddonsResponse>(
        'Addons.GetAddons',
        { type: addonType, properties: ['name'] },
        signal
      );
      return response.addons ?? [];
    },
    enabled: !!addonType,
    staleTime: 1000 * 60 * 5, // 5 minutes - addons rarely change
  });
}
