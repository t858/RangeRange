import StepClient from './StepClient';

export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: '7' },
    { id: '8' },
    { id: '9' },
    { id: '10' },
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StepPage({ params }: PageProps) {
  const { id } = await params;
  return <StepClient stepId={id} />;
}
