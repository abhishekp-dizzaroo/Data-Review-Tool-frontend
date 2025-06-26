import { useEffect, useState } from 'react';
import { feedbackService, FeedbackPayload } from '../services/feedback.service';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

const FeedBackPage = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackPayload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedbackService.getFeedback()
      .then(data => setFeedbacks(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-screen w-full p-0 m-0 bg-background">
      <div className="flex-shrink-0 px-8 pt-8 pb-4">
        <h2 className="text-2xl font-semibold">Feedback</h2>
      </div>
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="space-y-4 px-8">
            {[...Array(5)].map((_, idx) => (
              <Skeleton key={idx} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-muted-foreground px-8">No feedback yet.</div>
        ) : (
          <ScrollArea className="h-full w-full px-8 pb-16">
            <div className="grid gap-4 mb-8">
              {feedbacks.map((fb, idx) => (
                <Card key={idx} className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">User ID</div>
                      <Badge variant="secondary">{fb.user_id}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <span className="font-semibold">Prompt:</span> {fb.prompt}
                    </div>
                    {fb.sql_query && (
                      <div>
                        <span className="font-semibold">SQL Query:</span>
                        <pre className="bg-muted rounded p-2 mt-1 text-xs overflow-x-auto whitespace-pre-wrap break-all">{fb.sql_query}</pre>
                      </div>
                    )}
                    {fb.steps && (
                      <Collapsible>
                        <CollapsibleTrigger className="font-semibold underline cursor-pointer">Show Steps</CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="bg-muted rounded p-2 mt-1 text-xs whitespace-pre-wrap">{fb.steps}</div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                    <div>
                      <span className="font-semibold">Feedback:</span>{" "}
                      {fb.feedback === 1 ? '👍' : '👎'}
                    </div>
                    {fb.comment && (
                      <div>
                        <span className="font-semibold">Comment:</span> {fb.comment}
                      </div>
                    )}
                    {fb.data && Array.isArray(fb.data) && fb.data.length > 0 && typeof fb.data[0] === 'object' && (
                      <div>
                        <Separator className="my-2" />
                        <div className="font-semibold mb-1">Data Output:</div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs border rounded">
                            <thead>
                              <tr>
                                {Object.keys(fb.data![0]).map((col) => (
                                  <th key={col} className="px-2 py-1 border-b bg-muted text-left font-semibold">{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {fb.data!.map((row, i) => (
                                <tr key={i} className="bg-muted/50"> 
                                  {Object.keys(fb.data![0]).map((col) => {
                                    const value = row[col];
                                    if (value === null || value === undefined) {
                                      return <td key={col} className="px-2 py-1 border-b"><span className="text-muted-foreground">-</span></td>;
                                    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                                      return <td key={col} className="px-2 py-1 border-b">{String(value)}</td>;
                                    } else if (typeof value === 'object') {
                                      return <td key={col} className="px-2 py-1 border-b"><span className="text-muted-foreground">{JSON.stringify(value)}</span></td>;
                                    } else {
                                      return <td key={col} className="px-2 py-1 border-b"><span className="text-muted-foreground">?</span></td>;
                                    }
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {fb.summary && (
                      <div className="bg-muted rounded p-3 mt-2 text-xs whitespace-pre-wrap border border-primary/20">
                        <span className="font-semibold">Summary:</span>
                        <div>{fb.summary}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default FeedBackPage;
