import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { clientNavItems } from "@/lib/navigation";
import { SectionHeader } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Shield, Filter, Search, Calendar } from "lucide-react";

const lawyers = [
  { name: "Sarah Chen", specialty: "Employment Law", firm: "Chen & Associates", rating: 4.9, reviews: 127, location: "San Francisco, CA", hourlyRate: "$350", availability: "Available Today", verified: true, matchScore: 98, image: "SC" },
  { name: "Michael Park", specialty: "Business Law", firm: "Park Legal Group", rating: 4.8, reviews: 89, location: "Los Angeles, CA", hourlyRate: "$300", availability: "Next Available: Tomorrow", verified: true, matchScore: 94, image: "MP" },
  { name: "Lisa Wong", specialty: "Real Estate Law", firm: "Wong Business Law", rating: 4.7, reviews: 156, location: "New York, NY", hourlyRate: "$275", availability: "Available Today", verified: true, matchScore: 91, image: "LW" },
  { name: "James Miller", specialty: "IP Law", firm: "IP Shield Law", rating: 4.9, reviews: 203, location: "Austin, TX", hourlyRate: "$400", availability: "Next Week", verified: true, matchScore: 87, image: "JM" },
  { name: "Elena Rodriguez", specialty: "Immigration Law", firm: "Rodriguez Immigration", rating: 4.6, reviews: 78, location: "Miami, FL", hourlyRate: "$250", availability: "Available Today", verified: true, matchScore: 85, image: "ER" },
];

const specialties = ["All", "Employment", "Business", "Real Estate", "IP", "Immigration", "Family", "Criminal"];

export default function FindLawyers() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <DashboardLayout sidebarItems={clientNavItems} portalLabel="Client Portal" userName="Alex Johnson" userRole="Client">
      <SectionHeader
        title="Find Lawyers"
        subtitle="AI-matched lawyers for your legal needs"
      />

      {/* Search & Filter */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-card border rounded-xl px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search by name, specialty, or location..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <Button variant="outline" className="hidden sm:flex"><Filter className="mr-2 h-4 w-4" /> Filters</Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Lawyer Cards */}
      <div className="space-y-4">
        {lawyers.map((lawyer) => (
          <div key={lawyer.name} className="rounded-xl bg-card border shadow-card p-5 hover:shadow-card-hover transition-all duration-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center shrink-0 text-accent font-semibold text-lg">
                  {lawyer.image}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{lawyer.name}</h3>
                    {lawyer.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-success/10 text-success px-2 py-0.5 rounded-full">
                        <Shield className="h-3 w-3" /> Verified
                      </span>
                    )}
                    <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                      {lawyer.matchScore}% Match
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">{lawyer.specialty} · {lawyer.firm}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-accent fill-accent" /> {lawyer.rating} ({lawyer.reviews})</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {lawyer.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {lawyer.availability}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-row md:flex-col items-center md:items-end gap-3">
                <div className="text-right">
                  <div className="text-lg font-semibold text-foreground">{lawyer.hourlyRate}</div>
                  <div className="text-xs text-muted-foreground">per hour</div>
                </div>
                <Button variant="gold" size="sm">
                  <Calendar className="mr-2 h-3.5 w-3.5" /> Book Consult
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
