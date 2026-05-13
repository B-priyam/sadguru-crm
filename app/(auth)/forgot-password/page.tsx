"use client";

import React, { useState } from "react";
import { Building2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-primary via-primary to-emerald-700">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, hsl(var(--accent)) 0%, transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--primary-foreground)) 0%, transparent 35%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground w-full">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary-foreground/15 backdrop-blur flex items-center justify-center">
              <Building2 size={20} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">EstateFlow</h1>
              <p className="text-[10px] opacity-80">Real Estate CRM</p>
            </div>
          </div>

          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              Close more deals.
              <br />
              Manage every lead.
            </h2>
            <p className="text-base opacity-90 leading-relaxed">
              The complete CRM built for real estate teams — track clients,
              schedule visits, manage properties and convert leads into
              bookings.
            </p>
          </div>

          <p className="text-xs opacity-70">
            © 2026 EstateFlow. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Building2 size={18} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold text-primary tracking-tight">
                EstateFlow
              </h1>
              <p className="text-[10px] text-muted-foreground">
                Real Estate CRM
              </p>
            </div>
          </div>

          {!submitted ? (
            <>
              <div className="space-y-1.5 mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Reset password
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send you a link to reset your
                  password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      className="pl-9 h-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11">
                  Send reset link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 py-8">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} className="text-primary" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Check your email
                </h2>
                <p className="text-sm text-muted-foreground">
                  We sent a password reset link to
                  <br />
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
