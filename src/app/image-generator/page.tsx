import { ImageGeneratorInterface } from '@/components/image-generator/image-generator-interface';
import { AppHeader } from '@/components/layout/app-header';

export default function ImageGeneratorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto">
        <ImageGeneratorInterface />
      </main>
    </div>
  );
}
