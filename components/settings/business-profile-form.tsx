"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateBusinessProfile } from "@/app/(dashboard)/settings/actions";
import { isSessionExpired } from "@/lib/client/action-helpers";

interface BusinessProfile {
  businessName: string | null;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  taxId: string | null;
  defaultCurrency: string | null;
  defaultPaymentTerms: number | null;
  invoicePrefix: string | null;
  invoiceNotes: string | null;
  invoiceFooter: string | null;
}

interface BusinessProfileFormProps {
  profile: BusinessProfile | null;
}

export function BusinessProfileForm({ profile }: BusinessProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: profile?.businessName || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    addressLine1: profile?.addressLine1 || "",
    addressLine2: profile?.addressLine2 || "",
    city: profile?.city || "",
    state: profile?.state || "",
    postalCode: profile?.postalCode || "",
    country: profile?.country || "",
    taxId: profile?.taxId || "",
    defaultPaymentTerms: profile?.defaultPaymentTerms ?? 30,
    invoicePrefix: profile?.invoicePrefix || "INV",
    invoiceNotes: profile?.invoiceNotes || "",
    invoiceFooter: profile?.invoiceFooter || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateBusinessProfile(formData);
      if (result.success) {
        toast.success("Profile updated successfully");
        router.refresh();
      } else {
        if (isSessionExpired(result)) return;
        toast.error(result.error || "Failed to update profile");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            This information will appear on your invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Your Business Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@business.com"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / VAT Number</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                placeholder="XX-XXXXXXX"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address</Label>
            <Input
              id="addressLine1"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              placeholder="123 Business Street"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="San Francisco"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="CA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="94102"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Defaults</CardTitle>
          <CardDescription>
            Default values for new invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
              <Input
                id="invoicePrefix"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                placeholder="INV"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultPaymentTerms">Payment Terms (days)</Label>
              <Input
                id="defaultPaymentTerms"
                type="number"
                min="0"
                value={formData.defaultPaymentTerms}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setFormData({ ...formData, defaultPaymentTerms: Number.isNaN(v) ? 30 : v });
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceNotes">Default Notes</Label>
            <Textarea
              id="invoiceNotes"
              value={formData.invoiceNotes}
              onChange={(e) => setFormData({ ...formData, invoiceNotes: e.target.value })}
              placeholder="Thank you for your business!"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceFooter">Invoice Footer</Label>
            <Textarea
              id="invoiceFooter"
              value={formData.invoiceFooter}
              onChange={(e) => setFormData({ ...formData, invoiceFooter: e.target.value })}
              placeholder="Payment is due within 30 days..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
