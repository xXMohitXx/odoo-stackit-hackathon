import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ChevronUp, ChevronDown, Check, MessageSquare, Share, Bookmark, Flag, Bold, Italic, Strikethrough, List, ListOrdered, Link, Image, AlignLeft, AlignCenter, AlignRight, Smile, Home, Loader2 } from "lucide-react";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatTimeAgo } from "@/lib/utils";

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [answerContent, setAnswerContent] = useState('');
  
  // Fetch question details
  const { data, isLoading, isError } = useQuery({
    queryKey: ['question', id],
    queryFn: async () => {
      if (!id) throw new Error('Question ID is required');
      const response = await api.get(`/questions/${id}`);
      return response.data;
    }
  });

  // Handle error with useEffect
  React.useEffect(() => {
    if (isError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load question details. Please try again.",
      });
    }
  }, [isError, toast]);
  
  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!id) throw new Error('Question ID is required');
      return await api.post(`/questions/${id}/answers`, { content });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your answer has been submitted.",
      });
      setAnswerContent('');
      queryClient.invalidateQueries({ queryKey: ['question', id] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your answer. Please try again.",
      });
    }
  });
  
  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ type, target, targetId }: { type: 'upvote' | 'downvote', target: 'question' | 'answer', targetId: string }) => {
      return await api.post(`/votes`, { type, target, targetId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question', id] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to register your vote. Please try again.",
      });
    }
  });
  
  // Accept answer mutation
  const acceptAnswerMutation = useMutation({
    mutationFn: async (answerId: string) => {
      return await api.put(`/answers/${answerId}/accept`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Answer marked as accepted.",
      });
      queryClient.invalidateQueries({ queryKey: ['question', id] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept answer. Please try again.",
      });
    }
  });
  
  // Handle vote
  const handleVote = (type: 'upvote' | 'downvote', target: 'question' | 'answer', targetId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to vote.",
      });
      navigate('/login');
      return;
    }
    
    voteMutation.mutate({ type, target, targetId });
  };
  
  // Handle answer submission
  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to submit an answer.",
      });
      navigate('/login');
      return;
    }
    
    if (!answerContent.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Answer content cannot be empty.",
      });
      return;
    }
    
    submitAnswerMutation.mutate(answerContent);
  };
  
  // Handle accept answer
  const handleAcceptAnswer = (answerId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to accept an answer.",
      });
      navigate('/login');
      return;
    }
    
    acceptAnswerMutation.mutate(answerId);
  };
  
  // Extract data
  const question = data?.data;
  const answers = question?.answers || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <RouterLink to="/">
            <Button variant="ghost" size="sm" className="gap-2 p-0 h-auto">
              <Home className="h-4 w-4" />
              Questions
            </Button>
          </RouterLink>
          <span>›</span>
          <span className="text-foreground line-clamp-1">
            {isLoading ? "Loading..." : question?.title ? question.title.substring(0, 30) + (question.title.length > 30 ? '...' : '') : "Question not found"}
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading question details...</span>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load question details</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : !question ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Question not found</p>
            <RouterLink to="/">
              <Button className="mt-4">
                Back to Questions
              </Button>
            </RouterLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
            {/* Question */}
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Vote Section */}
                  <div className="flex flex-col items-center space-y-2 flex-shrink-0">
                    <Button 
                      variant={question.userVote === "upvote" ? "vote-active" : "vote"} 
                      size="icon"
                      onClick={() => handleVote('upvote', 'question', question._id)}
                      disabled={voteMutation.isPending}
                    >
                      <ChevronUp className="h-5 w-5" />
                    </Button>
                    <span className="text-lg font-medium text-foreground">{question.votes || 0}</span>
                    <Button 
                      variant={question.userVote === "downvote" ? "vote-active" : "vote"} 
                      size="icon"
                      onClick={() => handleVote('downvote', 'question', question._id)}
                      disabled={voteMutation.isPending}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                    <Button variant="vote" size="icon" className="mt-2">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                      {question.title}
                    </h1>
                    
                    <div className="prose prose-invert max-w-none mb-6">
                      <div className="text-foreground" dangerouslySetInnerHTML={{ __html: question.description }} />
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {question.tags && question.tags.map((tag: any) => (
                        <Badge key={tag._id || tag} variant="secondary">
                          {tag.name || tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Question Meta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Share className="h-4 w-4" />
                          Share
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Flag className="h-4 w-4" />
                          Flag
                        </Button>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        asked {formatTimeAgo(question.createdAt)} by{" "}
                        <span className="text-primary font-medium">{question.user?.name || "Anonymous"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Answers Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                {answers.length} Answer{answers.length !== 1 ? 's' : ''}
              </h2>
              </div>

              {answers.map((answer: any) => (
                <Card key={answer.id} className={`shadow-card ${answer.isAccepted ? 'ring-2 ring-success' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center space-y-2 flex-shrink-0">
                        <Button 
                          variant={answer.userVote === "upvote" ? "vote-active" : "vote"} 
                          size="icon"
                          onClick={() => handleVote('upvote', 'answer', answer._id)}
                          disabled={voteMutation.isPending}
                        >
                          <ChevronUp className="h-5 w-5" />
                        </Button>
                        <span className="text-lg font-medium text-foreground">{answer.votes || 0}</span>
                        <Button 
                          variant={answer.userVote === "downvote" ? "vote-active" : "vote"} 
                          size="icon"
                          onClick={() => handleVote('downvote', 'answer', answer._id)}
                          disabled={voteMutation.isPending}
                        >
                          <ChevronDown className="h-5 w-5" />
                        </Button>
                        {answer.isAccepted ? (
                          <div className="mt-2 p-2 bg-success rounded-full">
                            <Check className="h-4 w-4 text-success-foreground" />
                          </div>
                        ) : user && question.user && user._id === question.user._id && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="mt-2 text-muted-foreground hover:text-success hover:bg-success/10"
                            onClick={() => handleAcceptAnswer(answer._id)}
                            disabled={acceptAnswerMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Answer Content */}
                      <div className="flex-1 min-w-0">
                        {answer.isAccepted && (
                          <div className="flex items-center gap-2 mb-3">
                            <Check className="h-4 w-4 text-success" />
                            <span className="text-sm font-medium text-success">Accepted Answer</span>
                          </div>
                        )}
                        
                        <div className="prose prose-invert max-w-none mb-6">
                          <div className="text-foreground" dangerouslySetInnerHTML={{ __html: answer.content }} />
                        </div>

                        {/* Answer Meta */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Share className="h-4 w-4" />
                              Share
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Flag className="h-4 w-4" />
                              Flag
                            </Button>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            answered {formatTimeAgo(answer.createdAt)} by{" "}
                            <span className="text-primary font-medium">{answer.user?.name || "Anonymous"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submit Answer */}
            {user ? (
              <Card className="shadow-card">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Submit Your Answer</h3>
                  <p className="text-sm text-muted-foreground">
                    Please make sure your answer is helpful and adds value to the discussion.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSubmitAnswer}>
                    {/* Rich Text Editor Toolbar */}
                    <div className="border border-input rounded-t-md bg-muted/20 p-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <Button type="button" variant="ghost" size="icon-sm">
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm">
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm">
                          <Strikethrough className="h-4 w-4" />
                        </Button>
                        
                        <div className="w-px h-4 bg-border mx-1" />
                        
                        <Button type="button" variant="ghost" size="icon-sm">
                          <List className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm">
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                        
                        <div className="w-px h-4 bg-border mx-1" />
                        
                        <Button type="button" variant="ghost" size="icon-sm">
                          <Link className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm">
                          <Image className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm">
                          <Smile className="h-4 w-4" />
                        </Button>
                        
                        <div className="w-px h-4 bg-border mx-1" />
                        
                        <Button type="button" variant="ghost" size="icon-sm">
                          <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm">
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm">
                          <AlignRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <Textarea
                      placeholder="Write your answer here..."
                      className="min-h-[150px] rounded-t-none border-t-0 resize-none"
                      value={answerContent}
                      onChange={(e) => setAnswerContent(e.target.value)}
                      required
                    />
                    
                    <div className="flex justify-end mt-4">
                      <Button 
                        type="submit" 
                        className="min-w-[120px]"
                        disabled={submitAnswerMutation.isPending}
                      >
                        {submitAnswerMutation.isPending ? "Submitting..." : "Submit Answer"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <p className="mb-4 text-muted-foreground">You need to be logged in to answer this question.</p>
                  <RouterLink to="/login">
                    <Button>Log in to Answer</Button>
                  </RouterLink>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Question Stats */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-medium">Question Stats</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Asked</span>
                  <span>{formatTimeAgo(question.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Viewed</span>
                  <span>{question.views || 0} times</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active</span>
                  <span>{answers.length > 0 ? formatTimeAgo(answers[0].createdAt) : formatTimeAgo(question.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Related Questions */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-medium">Related Questions</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {/* This would be populated with real related questions from the API */}
                  <p className="text-sm text-muted-foreground">Related questions will appear here</p>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-medium">Tags</h3>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {question.tags && question.tags.map((tag: any) => (
                    <Badge key={tag._id || tag} variant="outline" className="cursor-pointer">
                      {tag.name || tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}