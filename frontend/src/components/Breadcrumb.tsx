import { ChevronRight, Home } from "lucide-react";
import { pageMetadata } from "../config/navigation";

interface BreadcrumbProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Breadcrumb({ currentPage, onNavigate }: BreadcrumbProps) {
  const metadata = pageMetadata[currentPage];
  
  if (!metadata || !metadata.breadcrumb || metadata.breadcrumb.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      {metadata.breadcrumb.map((crumb, index) => {
        const isLast = index === metadata.breadcrumb!.length - 1;
        const page = index === 0 ? 'landing' : currentPage;
        
        return (
          <div key={index} className="flex items-center gap-2">
            {index === 0 && <Home className="h-4 w-4" />}
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {isLast ? (
              <span className="text-foreground">{crumb}</span>
            ) : (
              <button
                onClick={() => onNavigate(page)}
                className="hover:text-foreground transition-colors"
              >
                {crumb}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
