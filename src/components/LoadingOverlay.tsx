import { Loader, Center, Text } from '@mantine/core';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <Center
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}
    >
      <Loader size="xl" color="white" />
      <Text c="white" size="lg">{message}</Text>
    </Center>
  );
} 