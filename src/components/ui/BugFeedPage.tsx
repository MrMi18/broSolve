import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";
import { Button } from "./button";

const BugFeedPage = () => {
  return (
    <div> 
      <Card>
        <CardHeader>
          <CardTitle>❗ Error: Cannot read properties of undefined</CardTitle>
          <CardDescription>Tag: React, useEffect</CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-muted">
            🤖 GPT Suggestion: Make sure `data` is not null before accessing
            `.length`....
          </p>
        </CardContent>

        <CardFooter>
          <Button variant="outline">View Details</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BugFeedPage;
