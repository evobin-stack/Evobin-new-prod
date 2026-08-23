import { MapPin, Navigation, Phone, Clock, Star, Filter, Search, MessageSquare } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { FeedbackRating } from "../FeedbackRating";
import { useState, useEffect } from "react";
import { centerApi } from "../../services/api";

export function MapPage() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [centers, setCenters] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async (query?: string) => {
    try {
      const res = query ? await centerApi.search(query) : await centerApi.getNearby(17.44, 78.34, 15);
      if (res.success && Array.isArray(res.data)) {
        const formatted = res.data.map((c: any) => ({
          id: c.id || c._id,
          name: c.name,
          address: c.address,
          distance: c.distance || "2.0 km",
          rating: c.rating || 4.8,
          reviews: c.reviewCount || 100,
          phone: c.phone || "+91 40 1234 5678",
          hours: c.operatingHours || "Mon-Sat: 9AM-6PM",
          types: c.acceptedTypes || c.acceptedItems || ["All Electronics"],
          open: c.capacityStatus !== "Closed"
        }));
        setCenters(formatted);
      }
    } catch (e) {
      console.error("Error fetching collection centers:", e);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCenters(searchQuery);
  };

  const filterCategories = [
    { label: "Open Now", checked: true },
    { label: "Smartphones", checked: false },
    { label: "Laptops", checked: false },
    { label: "Batteries", checked: false },
    { label: "Large Appliances", checked: false }
  ];

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl md:text-3xl font-bold">Collection Centers Map</h1>
          <p className="text-muted-foreground">
            Find the nearest e-waste collection and recycling centers from live database
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <Card className="lg:col-span-1 border-none shadow-md h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="space-y-2">
                <Label>Search Location</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Enter city, locality or device..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-input-background"
                  />
                </div>
                <Button type="submit" size="sm" className="w-full mt-2 bg-primary">
                  Search
                </Button>
              </form>

              {/* Distance */}
              <div className="space-y-2">
                <Label>Distance</Label>
                <select className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm">
                  <option>Within 5 km</option>
                  <option>Within 10 km</option>
                  <option>Within 25 km</option>
                </select>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <Label>Categories</Label>
                {filterCategories.map((category, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox id={`filter-${index}`} defaultChecked={category.checked} />
                    <label
                      htmlFor={`filter-${index}`}
                      className="text-sm cursor-pointer"
                    >
                      {category.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Map and List */}
          <div className="lg:col-span-3 space-y-6">
            {/* Map Frame */}
            <Card className="border-none shadow-md">
              <CardContent className="p-0">
                <div className="w-full h-[350px] md:h-[400px] bg-secondary rounded-lg relative overflow-hidden">
                  {/* Map Pin graphics */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-4">
                      <MapPin className="h-14 w-14 text-primary mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">Hyderabad Region E-Waste Centers</h3>
                      <p className="text-sm text-muted-foreground">
                        {centers.length} Live Collection Centers Operating
                      </p>
                    </div>
                  </div>
                  
                  {/* Pins */}
                  <div className="absolute top-[25%] left-[30%] w-10 h-10 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-bounce">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute top-[45%] right-[35%] w-10 h-10 bg-accent rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>

                  <Button 
                    size="icon"
                    className="absolute bottom-4 right-4 bg-white text-primary hover:bg-white/90 shadow-lg"
                    onClick={() => fetchCenters()}
                  >
                    <Navigation className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Centers List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Nearby Centers ({centers.length})</h3>
                <Badge variant="secondary">{centers.filter(c => c.open).length} Open Now</Badge>
              </div>

              <div className="space-y-4">
                {centers.map((center) => (
                  <Card key={center.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-base">{center.name}</h4>
                                {center.open && (
                                  <Badge className="bg-accent">Open</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {center.address}
                              </p>
                              <div className="flex items-center gap-4 text-xs md:text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Navigation className="h-3 w-3" />
                                  {center.distance}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {center.rating} ({center.reviews})
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {center.types.map((type: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {center.hours}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {center.phone}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-2">
                          <Button size="sm" className="bg-primary hover:bg-primary/90 flex-1 md:flex-none">
                            Directions
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 md:flex-none"
                            onClick={() => {
                              setSelectedCenterId(center.id);
                              setShowFeedback(true);
                            }}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Feedback Section */}
            {showFeedback && (
              <div className="mt-6">
                <FeedbackRating 
                  title="Rate Collection Center"
                  description="Share your experience to help others in the community"
                  onSubmit={async (rating, feedback) => {
                    if (selectedCenterId) {
                      await centerApi.submitReview(selectedCenterId, rating, feedback);
                    }
                    setTimeout(() => setShowFeedback(false), 2000);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
