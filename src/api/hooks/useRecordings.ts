import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { kodi } from '@/api/client';
import type {
  GetRecordingsResponse,
  GetRecordingDetailsResponse,
  KodiRecording,
} from '@/api/types/pvr';
import { RECORDING_PROPERTIES } from '@/api/types/pvr';

/**
 * Hook to fetch PVR recordings
 */
export function useRecordings(
  queryOptions?: Omit<UseQueryOptions<KodiRecording[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['recordings'],
    queryFn: async ({ signal }) => {
      const response = await kodi.call<GetRecordingsResponse>(
        'PVR.GetRecordings',
        {
          properties: RECORDING_PROPERTIES,
        },
        signal
      );
      return response.recordings ?? [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    ...queryOptions,
  });
}

/**
 * Hook to fetch details for a specific recording
 */
export function useRecordingDetails(
  recordingId: number | undefined,
  queryOptions?: Omit<UseQueryOptions<KodiRecording>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['recording', recordingId],
    queryFn: async ({ signal }) => {
      if (!recordingId) {
        throw new Error('Recording ID is required');
      }

      const response = await kodi.call<GetRecordingDetailsResponse>(
        'PVR.GetRecordingDetails',
        {
          recordingid: recordingId,
          properties: RECORDING_PROPERTIES,
        },
        signal
      );
      return response.recordingdetails;
    },
    enabled: recordingId !== undefined,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    ...queryOptions,
  });
}
