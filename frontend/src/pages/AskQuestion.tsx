import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bold, Italic, Strikethrough, List, ListOrdered, Link, Image, AlignLeft, AlignCenter, AlignRight, Smile, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function AskQuestion() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim()) && tags.length < 5) {
        setTags([...tags, tagInput.trim()]);
      } else if (tags.length >= 5) {
        toast({
          variant: "destructive",
          title: "Tag limit reached",
          description: "You can only add up to 5 tags.",
        });
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: { title: string; description: string; tags: string[] }) => {
      return await api.post('/questions', questionData);
    },
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Your question has been submitted successfully.",
      });
      // Navigate to the newly created question
       navigate(`/question/${response.data.data._id}`);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your question. Please try again.",
      });
      setIsSubmitting(false);
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to submit a question.",
      });
      navigate('/login');
      return;
    }
    
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a title for your question.",
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a description for your question.",
      });
      return;
    }
    
    if (tags.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please add at least one tag to your question.",
      });
      return;
    }
    
    setIsSubmitting(true);
    createQuestionMutation.mutate({ title, description, tags });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <RouterLink to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Questions
            </Button>
          </RouterLink>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl">Ask a Question</CardTitle>
            <p className="text-muted-foreground">
              Get help from the community by asking a clear, detailed question.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title *
              </label>
              <Input
                id="title"
                placeholder="Be specific and imagine you're asking a question to another person"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                Make your title as descriptive as possible
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description *
              </label>
              
              {/* Rich Text Editor Toolbar */}
              <div className="border border-input rounded-t-md bg-muted/20 p-2">
                <div className="flex flex-wrap items-center gap-1">
                  <Button variant="ghost" size="icon-sm">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <Strikethrough className="h-4 w-4" />
                  </Button>
                  
                  <div className="w-px h-4 bg-border mx-1" />
                  
                  <Button variant="ghost" size="icon-sm">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  
                  <div className="w-px h-4 bg-border mx-1" />
                  
                  <Button variant="ghost" size="icon-sm">
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  
                  <div className="w-px h-4 bg-border mx-1" />
                  
                  <Button variant="ghost" size="icon-sm">
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Textarea
                id="description"
                placeholder="Include all the information someone would need to answer your question"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[200px] rounded-t-none border-t-0 text-base resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Use the toolbar above to format your question. Include code examples, error messages, and what you've tried.
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">
                Tags *
              </label>
              <div className="space-y-2">
                <Input
                  id="tags"
                  placeholder="Add up to 5 tags to describe what your question is about (press Enter to add)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="text-base"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <span className="ml-1 text-xs">×</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Add up to 5 tags to categorize your question. Press Enter to add each tag.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim() || tags.length === 0}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Question"
                )}
              </Button>
            </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="mt-6 bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-lg">Tips for a Great Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• Make sure your question title is clear and specific</li>
              <li>• Include what you've tried and what didn't work</li>
              <li>• Add relevant code examples or error messages</li>
              <li>• Use proper tags to help others find your question</li>
              <li>• Check if your question has been asked before</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}