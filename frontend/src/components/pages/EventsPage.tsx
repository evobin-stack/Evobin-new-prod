import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useState, useEffect } from "react";
import { eventsApi } from "../../services/api";
import { toast } from "sonner";

export function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await eventsApi.getEvents();
      if (res.success && Array.isArray(res.data)) {
        setEvents(res.data);
      }
    } catch (e) {
      console.error("Error loading events:", e);
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      const res = await eventsApi.registerForEvent(eventId);
      toast.success(res.message || "Registered for event!");
      loadEvents();
    } catch (e) {
      toast.error("Registration failed.");
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl md:text-3xl font-bold">E-Waste Drives & Events</h1>
          <p className="text-muted-foreground">
            Join local collection drives, workshops, and community recycling initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((evt) => (
            <Card key={evt.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <Badge className="bg-primary">{evt.type}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {evt.registeredCount} / {evt.capacity} registered
                  </span>
                </div>
                <CardTitle className="text-xl font-bold">{evt.title}</CardTitle>
                <CardDescription className="text-sm mt-1">{evt.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{evt.date} | {evt.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span>{evt.location}</span>
                </div>
                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Organizer: {evt.organizer}</span>
                  <Button size="sm" onClick={() => handleRegister(evt.id)} className="bg-primary">
                    Register Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
