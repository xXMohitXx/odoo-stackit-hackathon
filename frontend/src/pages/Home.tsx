import { Header } from "@/components/Header";
import { QuestionCard } from "@/components/QuestionCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { formatTimeAgo } from "@/lib/utils";

export default function Home() {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFilter, setSelectedFilter] = useState(searchParams.get("filter") || "newest");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const { toast } = useToast();
  
  // Fetch questions from API
  const { data, isLoading, isError } = useQuery({
    queryKey: ["questions", selectedFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add filter parameters
      if (selectedFilter === "newest") {
        params.append("newest", "true");
      } else if (selectedFilter === "unanswered") {
        params.append("unanswered", "true");
      } else if (selectedFilter === "votes") {
        params.append("sort", "votes");
      } else if (selectedFilter === "answers") {
        params.append("sort", "answers");
      }
      
      // Add pagination
      params.append("page", currentPage.toString());
      params.append("limit", "10");
      
      const response = await api.get(`/questions?${params.toString()}`);
      return response.data;
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load questions. Please try again.",
      });
    }
  });
  
  // Update URL when filter changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("filter", selectedFilter);
    params.set("page", currentPage.toString());
    setSearchParams(params);
  }, [selectedFilter, currentPage, setSearchParams, searchParams]);
  
  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filterOptions = [
    { label: "Newest", value: "newest" },
    { label: "Unanswered", value: "unanswered" },
    { label: "Most votes", value: "votes" },
    { label: "Most answers", value: "answers" },
  ];
  
  // Transform API data to match QuestionCard props
  const questions = data?.data.map((question: any) => ({
    id: question._id,
    title: question.title,
    description: question.description.replace(/<[^>]*>/g, ''), // Strip HTML tags
    tags: question.tags.map((tag: any) => tag.name || tag),
    votes: question.votes || 0,
    answerCount: question.answers?.length || 0,
    hasAcceptedAnswer: question.answers?.some((answer: any) => answer.isAccepted) || false,
    timeAgo: formatTimeAgo(question.createdAt),
    author: question.user?.name || "Anonymous"
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20"></div>
        <div className="container mx-auto px-4 py-12 relative">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground">
              Welcome to <span className="text-gradient">StackIt</span>
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              A community-driven platform where developers ask questions, share knowledge, and build solutions together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/ask">
                <Button size="lg" className="text-lg px-8 py-3 animate-pulse-glow">
                  <Plus className="h-5 w-5 mr-2" />
                  Ask Your Question
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-white/10 text-white border-white/30 hover:bg-white/20">
                Browse Questions
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Header with Ask Question button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Latest Questions</h2>
                <p className="text-muted-foreground">
                  {isLoading ? "Loading questions..." : 
                   `${data?.count || 0} questions from our community`}
                </p>
              </div>
              <Link to="/ask">
                <Button className="flex items-center gap-2 w-full sm:w-auto hover-lift">
                  <Plus className="h-4 w-4" />
                  Ask Question
                </Button>
              </Link>
            </div>

            {/* Mobile Filters */}
            <div className="flex flex-wrap items-center gap-2 lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant={selectedFilter === option.value ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleFilterChange(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Mobile Filter Sidebar */}
            {showMobileFilters && (
              <div className="lg:hidden">
                <FilterSidebar />
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading questions...</span>
                </div>
              ) : isError ? (
                <div className="text-center py-12">
                  <p className="text-destructive">Failed to load questions</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No questions found</p>
                  <Link to="/ask">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Ask the First Question
                    </Button>
                  </Link>
                </div>
              ) : (
                questions.map((question, index) => (
                  <div 
                    key={question.id} 
                    className="animate-fade-in hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Link to={`/question/${question.id}`}>
                      <QuestionCard {...question} />
                    </Link>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {!isLoading && !isError && data?.pagination && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: data.pagination.pages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current page
                        return page === 1 || 
                               page === data.pagination.pages || 
                               Math.abs(page - currentPage) <= 1;
                      })
                      .map((page, index, array) => {
                        // Add ellipsis between non-consecutive pages
                        if (index > 0 && page - array[index - 1] > 1) {
                          return (
                            <React.Fragment key={`ellipsis-${page}`}>
                              <span className="px-2 text-muted-foreground">...</span>
                              <Button
                                key={page}
                                variant={page === currentPage ? "default" : "ghost"}
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Button>
                            </React.Fragment>
                          );
                        }
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "ghost"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage >= data.pagination.pages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  className="sm:hidden"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= data.pagination.pages}
                >
                  Load More Questions
                </Button>
              </div>
            )}

          </div>

          {/* Desktop Sidebar */}
          <div className="lg:col-span-1 hidden lg:block">
            <FilterSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}