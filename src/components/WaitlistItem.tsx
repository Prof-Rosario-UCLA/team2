import { Paper, Text, Group } from '@mantine/core';
import classes from '../styles/WaitlistItem.module.scss';

interface WaitlistItemProps {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  partySize: number;
  time: string;
}

export function WaitlistItem({ id, firstname, lastname, phone, partySize, time }: WaitlistItemProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('waitlistItem', JSON.stringify({
      id,
      firstname,
      lastname,
      phone,
      partySize,
      time
    }));
  };

  return (
    <Paper
      className={classes.waitlistItem}
      draggable
      onDragStart={handleDragStart}
      shadow="sm"
      p="md"
    >
      <Group justify="space-between">
        <div>
          <Text fw={500}>{firstname} {lastname}</Text>
          <Text size="sm" c="dimmed">Party of {partySize}</Text>
        </div>
        <Text size="sm">{time}</Text>
      </Group>
    </Paper>
  );
} 