import { Linkedin, Mail, Users, Heart, Code2, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import dev1 from "/assets/dev1.jpg";
import dev2 from "/assets/dev2.jpg";
import dev3 from "/assets/dev3.jpg";
import dev4 from "/assets/dev4.jpg";
import dev5 from "/assets/dev5.jpg";
import adm1 from "/assets/adm1.jpg";
import adm2 from "/assets/adm2.jpg";
import adm3 from "/assets/adm3.jpg";


interface AboutPageProps {
  onNavigate: (page: string) => void;
}

interface TeamMember {
  name: string;
  position: string;
  image: string;
  bio: string;
  linkedin?: string;
  github?: string;
  email?: string;
}

export function AboutPage({ onNavigate }: AboutPageProps) {

  const teamMembers: TeamMember[] = [
    
    {
      name: "Syeda Sumaiya Afreen",
      position: "Principal Investigator",
      image: adm2,
      bio: "Specializes in React, Node.js, and system architecture. 8+ years of experience building scalable web applications.",
      linkedin: "https://linkedin.com/in/alexjohnson",
      github: "https://github.com/alexjohnson",
      email: "alex@ewaste.com"
    },
    {
      name: "Gumpula Aravind",
      position: "Co Principal Investigator",
      image: adm3,
      bio: "Specializes in React, Node.js, and system architecture. 8+ years of experience building scalable web applications.",
      linkedin: "https://linkedin.com/in/alexjohnson",
      github: "https://github.com/alexjohnson",
      email: "alex@ewaste.com"
    },
    {
      name: "VENKATREDDY KARTHIK REDDY",
      position: "Software developer (front-end)",
      image: dev1,
      bio: "Specializes in React, Node.js, and system architecture. 8+ years of experience building scalable web applications.",
      linkedin: "https://linkedin.com/in/alexjohnson",
      github: "https://github.com/alexjohnson",
      email: "alex@ewaste.com"
    },
    {
      name: "SHAIK SHAHEID",
      position: "Software developer (back-end)",
      image: dev2,
      bio: "Expert in computer vision and machine learning. Developed the AI device recognition system with 95% accuracy.",
      linkedin: "https://linkedin.com/in/sarahmartinez",
      github: "https://github.com/sarahmartinez",
      email: "sarah@ewaste.com"
    },
    {
      name: "NARISETTI ASHOK KUMAR",
      position: "Data scientist",
      image: dev3,
      bio: "Specializes in database optimization, API development, and Supabase integration. Built the entire backend infrastructure.",
      linkedin: "https://linkedin.com/in/michaelchen",
      github: "https://github.com/michaelchen",
      email: "michael@ewaste.com"
    },
    {
      name: "VENNU ASHRITHA",
      position: "AI engineer",
      image: dev4,
      bio: "Creates intuitive and accessible user experiences. Designed the complete design system and all 14 pages of the platform.",
      linkedin: "https://linkedin.com/in/priyapatel",
      github: "https://github.com/priyapatel",
      email: "priya@ewaste.com"
    },
    {
      name: "KORIPALLY VAAGDEVI",
      position: "UI/UX designer",
      image: dev5,
      bio: "Expert in React, TypeScript, and responsive design. Implemented all interactive features and animations.",
      linkedin: "https://linkedin.com/in/davidkumar",
      github: "https://github.com/davidkumar",
      email: "david@ewaste.com"
    },
    // {
    //   name: "KODUKULA SAI SRUTI",
    //   position: "QA & Testing Engineer",
    //   image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=400",
    //   bio: "Ensures platform reliability, security, and performance. Manages deployment pipelines and quality assurance.",
    //   linkedin: "https://linkedin.com/in/emilyrodriguez",
    //   github: "https://github.com/emilyrodriguez",
    //   email: "emily@ewaste.com"
    // }
    {
      name: "Dr. S Rao Chintalapudi",
      position: "Mentor",
      image: adm1,
      bio: "Specializes in React, Node.js, and system architecture. 8+ years of experience building scalable web applications.",
      linkedin: "https://linkedin.com/in/alexjohnson",
      github: "https://github.com/alexjohnson",
      email: "alex@ewaste.com"
    }
  ];

  const stats = [
    { value: "6", label: "Team Members" },
    { value: "10K+", label: "Lines of Code" },
    { value: "14", label: "Pages Built" },
    { value: "100%", label: "Production Ready" }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-primary/10 via-accent/5 to-secondary py-20">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Users className="h-5 w-5" />
              <span className="font-semibold">Meet Our Team</span>
            </div>
            <h1 className="mb-6">The Minds Behind the Platform</h1>
            <p className="text-xl text-muted-foreground mb-8">
              A passionate team of developers, designers, and engineers dedicated to creating innovative solutions for sustainable e-waste management.
            </p>
            <div className="flex items-center justify-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <span>Built with passion</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-accent" />
                <span>For the environment</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>Powered by innovation</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="mb-4">Our Development Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Meet the talented individuals who brought this vision to life through dedication, expertise, and collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="absolute inset-0 bg-linear-to-br from-primary to-accent rounded-full opacity-10"></div>
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                    />
                  </div>
                  <CardTitle className="mb-1">{member.name}</CardTitle>
                  <CardDescription className="text-primary font-semibold">
                    {member.position}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* <p className="text-muted-foreground text-center mb-6">
                    {member.bio}
                  </p> */}

                  {/* Social Links */}
                  <div className="flex items-center justify-center gap-2">
                    {member.linkedin && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => window.open(member.linkedin, '_blank')}
                        aria-label="LinkedIn Profile"
                      >
                        <Linkedin className="h-4 w-4" />
                      </Button>
                    )}
                    {/* {member.github && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => window.open(member.github, '_blank')}
                        aria-label="GitHub Profile"
                      >
                        <Github className="h-4 w-4" />
                      </Button>
                    )} */}
                    {member.email && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => window.location.href = `mailto:${member.email}`}
                        aria-label="Email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="bg-secondary/30 py-20">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">Our Mission & Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're committed to making e-waste management accessible, efficient, and impactful for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Innovation First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We leverage cutting-edge AI and technology to solve real-world environmental challenges with innovative solutions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Environmental Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every line of code we write is driven by our commitment to protecting the planet and creating a sustainable future.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>User-Centric Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We prioritize accessibility, usability, and user experience to ensure everyone can contribute to e-waste reduction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">Built With Modern Technology</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We use the latest technologies to deliver a fast, secure, and scalable platform.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
            {[
              { name: "React", desc: "Frontend Framework" },
              { name: "TypeScript", desc: "Type Safety" },
              { name: "Tailwind CSS", desc: "Styling" },
              { name: "Supabase", desc: "Backend & Auth" },
              { name: "AI/ML", desc: "Device Recognition" },
              { name: "Recharts", desc: "Data Visualization" }
            ].map((tech, index) => (
              <Card key={index} className="text-center border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <Code2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="font-semibold text-foreground mb-1">{tech.name}</div>
                  <div className="text-xs text-muted-foreground">{tech.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Contact CTA */}
      <section className="bg-gradient-to-br from-primary to-accent text-white py-20">
        <div className="max-w-[1440px] mx-auto px-8 text-center">
          <h2 className="mb-6">Want to Learn More?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            We're always happy to discuss our platform, share insights, or explore collaboration opportunities.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => window.location.href = 'mailto:team@ewaste.com'}
            >
              <Mail className="mr-2 h-5 w-5" />
              Contact Our Team
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
              onClick={() => onNavigate('landing')}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
