import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Upload, Download, Search, Brain, HelpCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { CourseDocument } from "@shared/schema";

interface CourseDocumentsProps {
  courseId: string;
  courseName: string;
}

interface SearchResult {
  content: string;
  similarity: number;
  fileName: string;
  metadata: any;
}

export default function CourseDocuments({ courseId, courseName }: CourseDocumentsProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const canUpload = user?.role === 'instructor' || user?.role === 'admin';

  // Fetch course documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery<CourseDocument[]>({
    queryKey: [`/api/courses/${courseId}/documents`],
  });

  // Fetch study questions
  const { data: studyQuestionsData, isLoading: questionsLoading } = useQuery<{ questions: string[] }>({
    queryKey: [`/api/courses/${courseId}/study-questions`],
  });

  // Search documents
  const { data: searchResults, isLoading: searchLoading } = useQuery<{ results: SearchResult[] }>({
    queryKey: [`/api/courses/${courseId}/search`, searchQuery],
    enabled: searchQuery.length > 2,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await apiRequest('POST', `/api/courses/${courseId}/documents/upload`, formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document uploaded and is being processed",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/documents`] });
      setSelectedFile(null);
      setShowUpload(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a PDF file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate(selectedFile);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Course Materials</h3>
          <p className="text-sm text-muted-foreground">{courseName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            data-testid="button-search-documents"
          >
            <Search className="w-4 h-4 mr-1" />
            Search Materials
          </Button>
          {canUpload && (
            <Dialog open={showUpload} onOpenChange={setShowUpload}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-upload-document">
                  <Upload className="w-4 h-4 mr-1" />
                  Upload PDF
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Course Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      data-testid="input-file-upload"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Only PDF files up to 10MB are allowed
                    </p>
                  </div>
                  {selectedFile && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  )}
                  <Button 
                    onClick={handleUpload}
                    disabled={!selectedFile || uploadMutation.isPending}
                    className="w-full"
                    data-testid="button-confirm-upload"
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search Interface */}
      {showSearch && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Search Course Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search through course documents..."
                data-testid="input-document-search"
              />
              
              {searchQuery.length > 2 && (
                <div>
                  {searchLoading ? (
                    <div className="text-center py-4">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Searching...</p>
                    </div>
                  ) : searchResults?.results.length ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Found {searchResults.results.length} relevant passages:
                      </p>
                      {searchResults.results.map((result, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg" data-testid={`search-result-${index}`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">{result.fileName}</p>
                            <Badge variant="secondary">
                              {Math.round(result.similarity * 100)}% match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.content.slice(0, 200)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No results found.</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Questions */}
      {studyQuestionsData?.questions.length && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <HelpCircle className="w-4 h-4 mr-2" />
              AI-Generated Study Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {questionsLoading ? (
              <div className="text-center py-4">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Generating questions...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {studyQuestionsData.questions.map((question, index) => (
                  <div key={index} className="flex items-start space-x-2" data-testid={`study-question-${index}`}>
                    <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                    <p className="text-sm">{question}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Uploaded Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documentsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-10 h-10 bg-muted rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 bg-muted rounded animate-pulse w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg" data-testid={`document-${doc.id}`}>
                  <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground" data-testid={`document-name-${doc.id}`}>
                      {doc.fileName}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <Separator orientation="vertical" className="h-3" />
                      <span>{new Date(doc.createdAt!).toLocaleDateString()}</span>
                      <Separator orientation="vertical" className="h-3" />
                      <Badge variant={doc.isProcessed ? "default" : "secondary"} className="text-xs">
                        {doc.isProcessed ? "Processed" : "Processing..."}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.isProcessed && (
                      <Badge variant="secondary" className="text-xs">
                        <Brain className="w-3 h-3 mr-1" />
                        RAG Ready
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="no-documents-title">
                No course materials yet
              </h3>
              <p className="text-muted-foreground mb-4" data-testid="no-documents-message">
                {canUpload 
                  ? "Upload PDF documents to make them available for AI-powered Q&A and study assistance."
                  : "Your instructor hasn't uploaded any course materials yet."}
              </p>
              {canUpload && (
                <Button onClick={() => setShowUpload(true)} data-testid="button-upload-first-document">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload First Document
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}