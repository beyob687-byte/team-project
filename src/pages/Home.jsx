import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Calendar, Users, Trophy, ShieldCheck } from "lucide-react";
import Button from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import useAuthStore from "../store/authStore";

const features = [
  {
    icon: <Users className="w-5 h-5 text-primary" />,
    title: "Discover clubs",
    description:
      "Browse student organizations, events, and projects designed for your interests.",
  },
  {
    icon: <Calendar className="w-5 h-5 text-primary" />,
    title: "Stay connected",
    description:
      "RSVP to events, track deadlines, and keep your campus life organized.",
  },
  {
    icon: <Trophy className="w-5 h-5 text-primary" />,
    title: "Celebrate achievements",
    description:
      "Showcase your progress, unlock badges, and share your club milestones.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-primary" />,
    title: "Admin-ready governance",
    description:
      "Manage approvals, analytics, and compliance with intelligent tools.",
  },
];

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="space-y-16 pt-8">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary ring-1 ring-primary/20">
            <Sparkles className="w-4 h-4" /> New launch: Seamless campus club
            engagement.
          </div>
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl sm:text-6xl font-display font-bold tracking-tight text-text-1">
              University club management made effortless.
            </h1>
            <p className="text-lg leading-8 text-text-2">
              UniClubs helps students, club officers, and admins discover clubs,
              manage events, and build community in one polished campus
              experience.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link to="/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium text-text-2 hover:text-text-1 transition-colors"
            >
              Already have an account?{" "}
              <span className="text-primary hover:text-primary-dim">
                Sign in
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-3xl border border-border-glow bg-surface p-4 text-center">
              <p className="text-3xl font-bold text-text-1">120+</p>
              <p className="mt-2 text-sm text-text-2">Clubs supported</p>
            </div>
            <div className="rounded-3xl border border-border-glow bg-surface p-4 text-center">
              <p className="text-3xl font-bold text-text-1">450+</p>
              <p className="mt-2 text-sm text-text-2">Events scheduled</p>
            </div>
            <div className="rounded-3xl border border-border-glow bg-surface p-4 text-center">
              <p className="text-3xl font-bold text-text-1">98%</p>
              <p className="mt-2 text-sm text-text-2">Member satisfaction</p>
            </div>
            <div className="rounded-3xl border border-border-glow bg-surface p-4 text-center">
              <p className="text-3xl font-bold text-text-1">24/7</p>
              <p className="mt-2 text-sm text-text-2">Campus support</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-primary/10 via-surface to-secondary/10 p-1 shadow-glow">
          <div className="h-full rounded-[1.75rem] bg-deep p-8 text-text-1">
            <div className="space-y-6">
              <div className="rounded-3xl bg-surface/80 p-6 border border-border-glow">
                <p className="text-sm uppercase tracking-[0.25em] text-primary">
                  Featured
                </p>
                <h2 className="mt-4 text-2xl font-bold">Join the community.</h2>
                <p className="mt-2 text-sm text-text-2">
                  Discover clubs, events, and projects curated for your campus
                  journey.
                </p>
              </div>
              <div className="rounded-3xl bg-surface/80 p-6 border border-border-glow">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-text-2">Next big event</p>
                    <h3 className="mt-2 text-xl font-bold">
                      Spring Innovation Fair
                    </h3>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Open
                  </span>
                </div>
              </div>
              <div className="rounded-3xl bg-surface/80 p-6 border border-border-glow">
                <p className="text-sm text-text-2">Campus spotlight</p>
                <h3 className="mt-3 text-xl font-bold">Cultural Club</h3>
                <p className="mt-2 text-sm text-text-2">
                  Connect with student creatives, host performances, and
                  celebrate campus culture.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-text-1">
            Designed for every campus role
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-text-2">
            From first-year students exploring clubs to officers managing events
            and university admins tracking campus engagement — UniClubs keeps
            your community aligned with one intuitive platform.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="bg-surface/95 border-border-glow"
            >
              <div className="flex items-center gap-4 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-text-1">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-text-2">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-border-glow bg-surface p-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_0.65fr] items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">
              Built for student-led impact
            </p>
            <h2 className="text-3xl font-display font-bold text-text-1">
              Launch your club, manage events, and measure success.
            </h2>
            <p className="text-base leading-7 text-text-2">
              Easily run club programs, keep members engaged, and let campus
              leadership make smarter decisions with real-time analytics and
              moderation tools.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-deep/90 p-5 border border-border-glow">
              <p className="text-3xl font-bold text-primary">Club</p>
              <p className="mt-2 text-sm text-text-2">
                Registration workflow, roles, and announcements.
              </p>
            </div>
            <div className="rounded-3xl bg-deep/90 p-5 border border-border-glow">
              <p className="text-3xl font-bold text-primary">Survey</p>
              <p className="mt-2 text-sm text-text-2">
                Collect feedback from members and campus stakeholders.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
