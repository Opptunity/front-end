import { EngineerRankingTool } from '@/components/engineer-ranking';

export default function EngineerRankingPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI Engineer Ranking</h1>
          <p className="text-gray-600 mt-2">
            Use artificial intelligence to identify the best engineers for each task
          </p>
        </div>
        
        <EngineerRankingTool />
      </div>
    </div>
  );
}