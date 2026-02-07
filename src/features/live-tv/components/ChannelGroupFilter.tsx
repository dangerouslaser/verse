import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { KodiChannelGroup } from '@/api/types/pvr';

interface ChannelGroupFilterProps {
  groups: KodiChannelGroup[];
  value: number | 'alltv' | 'allradio';
  onChange: (value: number | 'alltv' | 'allradio') => void;
}

export function ChannelGroupFilter({ groups, value, onChange }: ChannelGroupFilterProps) {
  return (
    <Select
      value={String(value)}
      onValueChange={(val) => {
        if (val === 'alltv' || val === 'allradio') {
          onChange(val);
        } else {
          onChange(parseInt(val, 10));
        }
      }}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Channel Group" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="alltv">All TV Channels</SelectItem>
        <SelectItem value="allradio">All Radio</SelectItem>
        {groups.map((group) => (
          <SelectItem key={group.channelgroupid} value={String(group.channelgroupid)}>
            {group.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
