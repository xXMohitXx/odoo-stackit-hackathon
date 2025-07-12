import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const popularTags = [
  "React", "JavaScript", "TypeScript", "Node.js", "Python", 
  "CSS", "HTML", "SQL", "Git", "API"
];

const filterOptions = [
  { label: "Newest", value: "newest" },
  { label: "Unanswered", value: "unanswered" },
  { label: "Most votes", value: "votes" },
  { label: "Most answers", value: "answers" },
];

export function FilterSidebar() {
  return (
    <div className="space-y-6">
      {/* Sort Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Sort by</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              className="w-full justify-start h-8 text-sm"
            >
              {option.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Separator />

      {/* Popular Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Popular Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Community Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Questions</span>
            <span className="font-medium">1,234</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Answers</span>
            <span className="font-medium">3,456</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Users</span>
            <span className="font-medium">789</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}