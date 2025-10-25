'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="outline" size="icon" asChild>
            <Link href="/login">
                <ChevronLeft className="h-4 w-4" />
            </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight font-headline">Privacy Policy</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
          <CardDescription>Last Updated: October 17, 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <section>
            <h3 className="font-semibold text-lg mb-2">1. Introduction</h3>
            <p className="text-muted-foreground">
              Welcome to BudgetWise. We are committed to protecting your
              privacy and ensuring that your personal data is handled in a safe
              and responsible manner. This Privacy Policy outlines how we
              collect, use, and protect your information when you use our web
              application.
            </p>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2">2. Information We Collect</h3>
            <p className="text-muted-foreground">
              We collect the following types of information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>
                <strong>Personal Identification Information:</strong> Your
                full name and email address, collected during the account
                sign-up process.
              </li>
              <li>
                <strong>Financial Data:</strong> Information you provide
                about your income, expenses, and budget goals, including
                transaction names, amounts, categories, and dates.
              </li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2">3. How We Use Your Information</h3>
            <p className="text-muted-foreground">
              Your data is used exclusively to provide and improve the
              BudgetWise service. This includes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Personalizing your dashboard and financial summaries.</li>
              <li>Tracking your income, expenses, and budget progress.</li>
              <li>
                Generating AI-powered suggestions to help you optimize your
                budget (data is anonymized where possible).
              </li>
              <li>Authenticating and securing your account.</li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2">4. Data Storage and Security</h3>
            <p className="text-muted-foreground">
              All of your data is securely stored and managed by Google
              Firebase, a trusted and robust backend service. We rely on
              Firebase's industry-standard security measures, including data
              encryption and secure access protocols, to protect your
              information from unauthorized access.
            </p>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2">5. Data Sharing and Third Parties</h3>
            <p className="text-muted-foreground">
              We do not sell, trade, or otherwise transfer your personally
              identifiable information to outside parties. Your financial data
              is processed by our integrated AI service (Genkit) solely for the
              purpose of providing you with budget suggestions. We have ensured
              that these services adhere to strict data privacy and
              confidentiality standards.
            </p>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2">6. Your Rights</h3>
            <p className="text-muted-foreground">
              You have the right to access, update, or request the deletion of
              your personal data at any time by contacting our support.
            </p>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2">7. Changes to This Policy</h3>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on this page.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
