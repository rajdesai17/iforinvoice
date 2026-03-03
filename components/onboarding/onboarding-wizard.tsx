"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { completeOnboarding } from "@/app/onboarding/actions";

const STEPS = ["Business Info", "Invoice Defaults", "Payment Details"];

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "JPY", label: "JPY - Japanese Yen" },
];

const FORMAT_EXAMPLES = [
  { value: "{PREFIX}-{YYYY}-{NUM:4}", example: "INV-2026-0001" },
  { value: "{PREFIX}{NUM:4}", example: "INV0001" },
  { value: "{YYYY}/{MM}/{NUM:3}", example: "2026/03/001" },
  { value: "{PREFIX}-{NUM}", example: "INV-1" },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    businessName: "",
    email: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    invoicePrefix: "INV",
    invoiceNumberFormat: "{PREFIX}-{YYYY}-{NUM:4}",
    defaultCurrency: "USD",
    defaultPaymentTerms: 30,
    defaultTaxRate: 0,
    paymentInstructions: "",
  });

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 0) return form.businessName.trim().length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await completeOnboarding(form);
      if (result.success) {
        toast.success("You're all set!");
        // Defer navigation so we don't update a component (e.g. Toaster/Dialog ForwardRef)
        // while another is still rendering (avoids "setState in render" React error).
        setTimeout(() => {
          router.replace("/dashboard");
        }, 0);
      } else {
        if (result.code === "UNAUTHORIZED") {
          toast.error("Session expired. Please sign in again.");
          setTimeout(() => {
            router.replace("/auth/sign-in");
          }, 0);
          return;
        }
        toast.error(result.error || "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary h-10";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">
          Set up your business
        </h1>
        <p className="text-sm text-muted-foreground">
          This takes about a minute. You can change everything later in Settings.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: i <= step ? "100%" : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      {/* Step Content */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        {step === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                placeholder="Your business or freelance name"
                value={form.businessName}
                onChange={(e) => updateField("businessName", e.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="billing@company.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1 555 000 0000"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address</Label>
              <Input
                id="addressLine1"
                placeholder="Street address"
                value={form.addressLine1}
                onChange={(e) => updateField("addressLine1", e.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  placeholder="10001"
                  value={form.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="United States"
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                <Input
                  id="invoicePrefix"
                  placeholder="INV"
                  value={form.invoicePrefix}
                  onChange={(e) =>
                    updateField("invoicePrefix", e.target.value.toUpperCase())
                  }
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Currency</Label>
                <Select
                  value={form.defaultCurrency}
                  onValueChange={(v) => updateField("defaultCurrency", v)}
                >
                  <SelectTrigger className={inputClassName}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Number Format</Label>
              <div className="grid grid-cols-2 gap-2">
                {FORMAT_EXAMPLES.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() =>
                      updateField("invoiceNumberFormat", f.value)
                    }
                    className={`p-3 rounded-xl border text-left text-sm transition-colors ${
                      form.invoiceNumberFormat === f.value
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <span className="font-mono block">{f.example}</span>
                    <span className="text-xs text-muted-foreground">
                      {f.value}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultPaymentTerms">Payment Terms (days)</Label>
                <Input
                  id="defaultPaymentTerms"
                  type="number"
                  min={0}
                  max={365}
                  value={form.defaultPaymentTerms}
                  onChange={(e) =>
                    updateField(
                      "defaultPaymentTerms",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                <Input
                  id="defaultTaxRate"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={form.defaultTaxRate}
                  onChange={(e) =>
                    updateField(
                      "defaultTaxRate",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className={inputClassName}
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="paymentInstructions">
                Payment Instructions
              </Label>
              <p className="text-xs text-muted-foreground">
                Bank details, UPI, PayPal, etc. This will appear on every
                invoice by default.
              </p>
              <Textarea
                id="paymentInstructions"
                placeholder={`Bank: Example Bank\nAccount: 1234567890\nIFSC: EXBK0001234\n\nOr pay via UPI: you@upi`}
                rows={6}
                value={form.paymentInstructions}
                onChange={(e) =>
                  updateField("paymentInstructions", e.target.value)
                }
                className="bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This is optional — you can always add it later in Settings.
            </p>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !canProceed()}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
          >
            {isSubmitting ? "Setting up..." : "Complete Setup"}
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
