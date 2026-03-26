import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      {/* Premium SVG Animation */}
      <div className="relative mb-6 flex h-72 w-72 items-center justify-center">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full text-foreground/40 drop-shadow-2xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>
            {`
              @keyframes lift {
                0%, 15%, 100% { transform: translateY(0) rotate(0deg); }
                40%, 65% { transform: translateY(-40px) rotate(8deg); }
              }
              .cloche {
                animation: lift 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                transform-origin: 100px 155px;
              }
              
              @keyframes float-smoke {
                0%, 30% { transform: translateY(0) scale(0.8); opacity: 0; }
                45%, 55% { transform: translateY(-15px) scale(1.2); opacity: 0.6; }
                70%, 100% { transform: translateY(-30px) scale(1); opacity: 0; }
              }
              .smoke-1 { animation: float-smoke 4s ease-in-out infinite 0.2s; }
              .smoke-2 { animation: float-smoke 4s ease-in-out infinite 0.6s; }
              .smoke-3 { animation: float-smoke 4s ease-in-out infinite 1s; }
              
              @keyframes fade-in-out {
                0%, 25%, 100% { opacity: 0; transform: scale(0.9); }
                45%, 65% { opacity: 1; transform: scale(1); }
              }
              .content-fade {
                 animation: fade-in-out 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                 transform-origin: 100px 140px;
              }
            `}
          </style>

          {/* Under Cloche Base (Shadow/Inner Plate) */}
          <ellipse cx="100" cy="155" rx="60" ry="10" className="fill-muted-foreground/10" />

          {/* Question Mark or Empty Content */}
          <text 
            x="100" 
            y="145" 
            fontSize="45" 
            fontWeight="bold" 
            textAnchor="middle" 
            fontFamily="serif"
            className="fill-primary content-fade"
          >
            ?
          </text>
          
          {/* Smoke Lines */}
          <path d="M 85 130 C 80 110, 100 100, 90 80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="smoke-1" />
          <path d="M 115 130 C 120 110, 100 100, 110 80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="smoke-2" />
          <path d="M 100 125 C 105 105, 90 95, 105 75" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="smoke-3" />

          {/* Cloche Cover */}
          <g className="cloche">
            {/* Handle Base */}
            <circle cx="100" cy="80" r="10" fill="currentColor" />
            {/* Cloche Dome */}
            <path d="M 30 155 C 30 80, 170 80, 170 155 Z" fill="currentColor" className="drop-shadow-lg" />
            {/* Subtle Highlights on Dome for 3D effect */}
            <path d="M 36 150 C 36 85, 164 85, 164 150 Z" className="fill-background opacity-20" />
            <path d="M 48 143 C 48 95, 152 95, 152 143 Z" className="fill-background opacity-40" />
          </g>

          {/* Outer Plate/Tray */}
          <ellipse cx="100" cy="155" rx="80" ry="15" fill="none" stroke="currentColor" strokeWidth="6" className="drop-shadow-md" />
          
        </svg>
      </div>

      <div className="space-y-4 max-w-lg mt-4">
        <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground sm:text-6xl">
          404 <span className="text-primary font-sans text-3xl sm:text-5xl -translate-y-1 inline-block mx-2">|</span> Not Found
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          We looked everywhere in our kitchen, but the page you requested seems to be off the menu.
        </p>
      </div>

      <div className="mt-10 flex gap-4">
        <Button asChild size="lg" className="rounded-full px-8 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
