import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, MessageSquare, Check } from "lucide-react";

interface QuestionCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  votes: number;
  answerCount: number;
  hasAcceptedAnswer?: boolean;
  userVote?: "up" | "down" | null;
  timeAgo: string;
  author: string;
}

export function QuestionCard({
  title,
  description,
  tags,
  votes,
  answerCount,
  hasAcceptedAnswer,
  userVote,
  timeAgo,
  author,
}: QuestionCardProps) {
  return (
    <Card className="glass-effect hover:shadow-hover glow-on-hover transition-all duration-300 cursor-pointer group border-0 shadow-card bg-gradient-surface backdrop-blur-lg">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Vote and Answer Section - Horizontal on mobile, vertical on desktop */}
          <div className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-2 flex-shrink-0 order-2 sm:order-1">
            {/* Vote Section */}
            <div className="flex sm:flex-col items-center space-x-2 sm:space-x-0 sm:space-y-2">
              <Button 
                variant={userVote === "up" ? "vote-active" : "vote"} 
                size="icon-sm"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-foreground min-w-[2rem] text-center">{votes}</span>
              <Button 
                variant={userVote === "down" ? "vote-active" : "vote"} 
                size="icon-sm"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Answer Count */}
            <div className="flex sm:flex-col items-center space-x-1 sm:space-x-0 sm:space-y-1">
              <div className={`flex items-center justify-center w-12 h-8 rounded text-sm font-medium ${
                hasAcceptedAnswer 
                  ? "bg-success text-success-foreground" 
                  : answerCount > 0 
                    ? "bg-muted text-muted-foreground" 
                    : "bg-background text-muted-foreground"
              }`}>
                {hasAcceptedAnswer && <Check className="h-3 w-3 mr-1" />}
                {answerCount}
              </div>
              <span className="text-xs text-muted-foreground">answers</span>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 min-w-0 order-1 sm:order-2">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-2 leading-relaxed">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
              {description}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer interactive-scale"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 sm:px-6 py-4 border-t border-border/50 bg-gradient-to-r from-muted/10 to-muted/5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{answerCount} answers</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span>asked {timeAgo} by</span>
            <span className="text-primary font-medium">{author}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}