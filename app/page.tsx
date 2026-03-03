import Link from "next/link";
import { ArrowRight, FileText, Users, Zap, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Shared Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">Simple invoicing for freelancers</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance mb-6">
              Create professional invoices in{" "}
              <span className="text-primary">seconds</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
              Fast, beautiful invoicing designed for freelancers. Manage clients, track payments, and get paid faster with our intuitive platform.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 text-base font-medium shadow-lg shadow-primary/20">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">Free to use. No credit card required.</p>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative mx-auto max-w-4xl">
              <div className="rounded-xl border border-border bg-card shadow-2xl shadow-black/10 overflow-hidden">
                {/* Mock Browser Chrome */}
                <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <div className="w-3 h-3 rounded-full bg-border" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-background/50 text-xs text-muted-foreground">
                      iforinvoice.app/invoices/new
                    </div>
                  </div>
                </div>

                {/* Mock Dashboard Preview */}
                <div className="p-6 bg-background/50">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: "Total Revenue", value: "$12,450", trend: "+12%" },
                      { label: "Outstanding", value: "$3,200", trend: "4 invoices" },
                      { label: "This Month", value: "$4,850", trend: "+24%" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-xl font-semibold text-foreground">{stat.value}</p>
                        <p className="text-xs text-primary mt-1">{stat.trend}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-32 rounded-lg border border-border bg-muted/20 flex items-center justify-center">
                    <div className="flex items-end gap-2 h-20">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div
                          key={i}
                          className="w-8 rounded-t bg-primary/80"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything you need to get paid</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful features wrapped in a simple, intuitive interface that gets out of your way.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Create and send professional invoices in under a minute. No complicated setup required.",
              },
              {
                icon: Users,
                title: "Client Management",
                description: "Keep all your client information organized. Quick access to history and contact details.",
              },
              {
                icon: TrendingUp,
                title: "Track Everything",
                description: "Monitor payments, overdue invoices, and revenue trends with beautiful dashboards.",
              },
              {
                icon: FileText,
                title: "PDF Export",
                description: "Generate polished PDF invoices ready to send or print. Your brand, professionally presented.",
              },
              {
                icon: Clock,
                title: "Status Tracking",
                description: "Know exactly where each invoice stands. Draft, sent, viewed, paid, or overdue at a glance.",
              },
              {
                icon: CheckCircle2,
                title: "Simple & Clean",
                description: "No bloat, no confusion. Just the features you need to invoice and get paid.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

            <div className="relative px-8 py-16 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to simplify your invoicing?
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Join freelancers who spend less time on paperwork and more time on what they love.
              </p>
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 text-base font-medium shadow-lg shadow-primary/20">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <FileText className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">iforinvoice</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Simple invoicing for freelancers.
          </p>
        </div>
      </footer>
    </div>
  );
}
