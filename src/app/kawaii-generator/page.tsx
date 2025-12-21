'use client';

import KawaiiGenerator from '@/components/KawaiiGenerator';

export default function KawaiiGeneratorPage() {
  return (
    <div className="min-h-screen bg-white py-10">
      <div className="container mx-auto max-w-5xl px-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-headline font-semibold">カワイイアバター ジェネレーター</h1>
          <p className="text-muted-foreground text-sm">
            メインの登録フローでジェネレーターが表示されない場合でも、ここから直接利用できます。
          </p>
        </div>
        <KawaiiGenerator />
      </div>
    </div>
  );
}
