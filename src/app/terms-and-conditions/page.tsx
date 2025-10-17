
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function TermsAndConditionsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
          <CardDescription>Last Updated: October 17, 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <section>
            <h3 className="font-semibold text-lg mb-2">1. Acceptance of Terms</h3>
            <p className="text-muted-foreground">
              By creating an account and using the BudgetWise web application
              ("Service"), you agree to be bound by these Terms and Conditions.
              If you do not agree with any part of these terms, you may not use
              the Service.
            </p>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2">2. Description of Service</h3>
            <p className="text-muted-foreground">
              BudgetWise is a personal finance management tool designed to help
              users track their income, expenses, budget goals, and savings goals. The Service
              is provided on an "as is" and "as available" basis.
            </p>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2">3. User Responsibilities</h3>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your
              account and password. You are also responsible for all activities
              that occur under your account. You agree to provide accurate and
              current information and to update it as necessary.
            </p>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2">4. Limitation of Liability</h3>
            <p className="text-muted-foreground">
              BudgetWise is a tool for informational purposes only and is not
              intended to provide legal, tax, or financial advice. We shall not
              be liable for any damages or losses arising from your use of the
              Service or your reliance on any information provided by the
              Service.
            </p>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2">5. Termination</h3>
            <p className="text-muted-foreground">
              We may terminate or suspend your access to the Service at any
              time, without prior notice or liability, for any reason,
              including a breach of these Terms.
            </p>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2">6. Governing Law</h3>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which the company is based,
              without regard to its conflict of law provisions.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
