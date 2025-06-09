import { CardDemo } from "@/components/ui/aceternity-card";

export default function TestAceternityPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{
        backgroundColor: '#f8fafc !important',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important'
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              color: '#1a1a1a !important',
              fontWeight: '700 !important',
              letterSpacing: '-0.025em !important'
            }}
          >
            Aceternity UI Components
          </h1>
          <p 
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{
              color: '#6b7280 !important',
              lineHeight: '1.6 !important'
            }}
          >
            Beautiful, modern components with Apple-inspired design
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CardDemo />
          <CardDemo />
          <CardDemo />
        </div>
      </div>
    </div>
  );
} 