import { Star, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useState } from "react";

interface FeedbackRatingProps {
  title?: string;
  description?: string;
  onSubmit?: (rating: number, feedback: string) => void;
}

export function FeedbackRating({ 
  title = "Rate Your Experience", 
  description = "Help us improve our service",
  onSubmit 
}: FeedbackRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(rating, feedback);
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setFeedback("");
    }, 3000);
  };

  if (submitted) {
    return (
      <Card className="border-none shadow-md bg-accent/10">
        <CardContent className="p-6 text-center">
          <ThumbsUp className="h-12 w-12 text-accent mx-auto mb-3" />
          <h3 className="mb-2">Thank You for Your Feedback!</h3>
          <p className="text-muted-foreground">
            Your input helps us improve our platform for everyone.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Additional Comments (Optional)</label>
          <Textarea
            placeholder="Tell us more about your experience..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="bg-input-background min-h-[100px]"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
        >
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
}
