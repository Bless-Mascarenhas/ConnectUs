"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <header className="flex items-center justify-between px-6 py-4 lg:px-12">
        <Logo />
        <Button variant="outline" size="sm" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 -mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent font-medium text-sm">
            <Sparkles className="h-4 w-4" />
            <span>The premier network for alumni and students</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-serif text-ink tracking-tight">
            ConnectUs
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A quietly powerful network bridging the gap between current students and successful alumni. Mentorship, events, and opportunities.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="accent" size="lg" className="w-full sm:w-auto text-lg h-14 px-8" asChild>
              <Link href="/login">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
