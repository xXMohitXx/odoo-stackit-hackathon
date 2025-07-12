import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/lib/api";

const popularTags = [
  "python", "api", "flask", "react", "javascript", "typescript", 
  "nodejs", "css", "html", "sql"
];

const filterOptions = [
  { label: "Newest", value: "newest" },
  { label: "Unanswered", value: "unanswered" },
  { label: "Most votes", value: "votes" },
  { label: "Most answers", value: "answers" },
];

export function FilterSidebar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentFilter = searchParams.get("filter") || "newest";

  // Fetch community stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => {
      const [questionsRes, answersRes, usersRes] = await Promise.all([
        api.get('/questions?limit=1'), // Just to get count
        api.get('/answers?limit=1'), // Just to get count
        api.get('/users?limit=1') // Just to get count
      ]);
      
      return {
        questions: questionsRes.data.total || questionsRes.data.count || 0,
        answers: answersRes.data.total || answersRes.data.count || 0,
        users: usersRes.data.total || usersRes.data.count || 0
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("filter", filter);
    params.set("page", "1"); // Reset to first page
    navigate(`/?${params.toString()}`);
  };

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    // Send the tag name as is, backend will handle the matching
    params.set("tag", tag);
    params.set("page", "1"); // Reset to first page
    navigate(`/?${params.toString()}`);
  };

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
              variant={currentFilter === option.value ? "default" : "ghost"}
              className="w-full justify-start h-8 text-sm"
              onClick={() => handleFilterChange(option.value)}
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
                onClick={() => handleTagClick(tag)}
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
          {statsLoading ? (
            <div className="flex justify-center items-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Questions</span>
                <span className="font-medium">{stats?.questions?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Answers</span>
                <span className="font-medium">{stats?.answers?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Users</span>
                <span className="font-medium">{stats?.users?.toLocaleString() || 0}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}