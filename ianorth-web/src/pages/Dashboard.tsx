import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { CameraSelector } from '../components/CameraSelector';
import { VideoFeed } from '../components/VideoFeed';
import { AnalysisPanel } from '../components/AnalysisPanel';
import { useState } from 'react';

export default function Dashboard() {
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>(undefined);

  const videoStreams: Record<string, string> = {
    'cam-001': '/stream1.gif',
    'cam-002': '/stream2.gif',
    'cam-003': '/stream3.gif',
    'cam-004': '/stream4.gif',
  };

  const streamUrl = selectedCameraId ? videoStreams[selectedCameraId] ?? undefined : undefined;

  return (
    <MainLayout>
      <div className="lg:col-span-3 space-y-4 min-h-[60vh]">
        <CameraSelector selectedCameraId={selectedCameraId} onSelect={setSelectedCameraId} />
        <VideoFeed streamUrl={streamUrl} />
      </div>
      <div className="lg:col-span-2">
        <AnalysisPanel />
      </div>
    </MainLayout>
  );
}


