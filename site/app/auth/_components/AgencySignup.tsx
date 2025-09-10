"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Building,
  FileText,
  User,
  MapPin,
  Lock,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { registerAgency } from "@/server-actions/auth/auth";
import { agencyRegistrationSchema } from "@/types/auth";

const steps = [
  {
    id: 1,
    title: "Company Information",
    icon: Building,
    fields: ["companyName", "tradingName", "businessType"],
  },
  {
    id: 2,
    title: "Business Details",
    icon: FileText,
    fields: [
      "registrationNumber",
      "licenseNumber",
      "taxId",
      "establishedDate",
      "website",
      "description",
    ],
  },
  {
    id: 3,
    title: "Contact Person",
    icon: User,
    fields: [
      "contactPerson.firstName",
      "contactPerson.lastName",
      "contactPerson.position",
      "contactPerson.email",
      "contactPerson.phoneNumber",
    ],
  },
  {
    id: 4,
    title: "Business Address",
    icon: MapPin,
    fields: [
      "businessAddress.street",
      "businessAddress.city",
      "businessAddress.state",
      "businessAddress.zipCode",
      "businessAddress.country",
    ],
  },
  {
    id: 5,
    title: "Account Setup",
    icon: Lock,
    fields: ["email", "password", "confirmPassword", "acceptTerms"],
  },
];

const businessTypeOptions = [
  { value: "REAL_ESTATE_AGENCY", label: "Real Estate Agency" },
  { value: "PROPERTY_DEVELOPER", label: "Property Developer" },
  { value: "INVESTMENT_FIRM", label: "Investment Firm" },
  { value: "OTHER", label: "Other" },
];

type FormData = z.infer<typeof agencyRegistrationSchema>;

const AgencySignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(agencyRegistrationSchema),
    mode: "onBlur",
    defaultValues: {
      companyName: "",
      tradingName: "",
      registrationNumber: "",
      licenseNumber: "",
      taxId: "",
      website: "",
      description: "",
      contactPerson: {
        firstName: "",
        lastName: "",
        position: "",
        email: "",
        phoneNumber: "",
      },
      businessAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = (values: z.infer<typeof agencyRegistrationSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("companyName", values.companyName);
      formData.append("tradingName", values.tradingName || "");
      formData.append("businessType", values.businessType);
      formData.append("registrationNumber", values.registrationNumber);
      formData.append("licenseNumber", values.licenseNumber);
      formData.append("taxId", values.taxId);
      formData.append("establishedDate", values.establishedDate || "");
      formData.append("website", values.website || "");
      formData.append("description", values.description || "");
      formData.append("contactFirstName", values.contactPerson.firstName);
      formData.append("contactLastName", values.contactPerson.lastName);
      formData.append("contactPosition", values.contactPerson.position);
      formData.append("contactEmail", values.contactPerson.email);
      formData.append("contactPhone", values.contactPerson.phoneNumber || "");
      formData.append("businessStreet", values.businessAddress.street);
      formData.append("businessCity", values.businessAddress.city);
      formData.append("businessState", values.businessAddress.state);
      formData.append("businessZipCode", values.businessAddress.zipCode);
      formData.append("businessCountry", values.businessAddress.country);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("confirmPassword", values.confirmPassword);
      formData.append("acceptTerms", values.acceptTerms ? "on" : "off");

      const results = await registerAgency(null, formData);
      if (results.success) {
        toast.success(
          results.message ||
          "Registration successful! Please check your email to verify your account.",
        );
        form.reset();
      } else {
        toast.error(results.message || "An unknown error occurred.");
      }
    });
  };
  const nextStep = async () => {
    const fields = steps[currentStep - 1].fields;
    const isStepValid = await form.trigger(fields as any, {
      shouldFocus: true,
    });
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Agency Registration
          </CardTitle>
          <CardDescription>
            Join our platform as a verified real estate agency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stepper */}
          <div className="mb-8 flex items-center justify-between gap-2">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className="flex-1 flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                        isActive &&
                        "bg-primary text-primary-foreground border-primary",
                        isCompleted &&
                        "bg-green-600 text-white border-green-600",
                        !isActive &&
                        !isCompleted &&
                        "bg-muted border-border text-muted-foreground",
                      )}
                    >
                      {isCompleted ? <Check size={16} /> : step.id}
                    </div>
                    <p
                      className={cn(
                        "text-xs mt-2 text-center",
                        isActive && "text-primary font-semibold",
                      )}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 w-full",
                        isCompleted ? "bg-green-600" : "bg-border",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Content */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Step 1: Company Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your company name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tradingName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trading Name (if different)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Awesome Properties"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {businessTypeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {/* Step 2: Business Details */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="C-123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="RE-98765" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax ID / PIN *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter tax identification number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="establishedDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Established Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) =>
                                field.onChange(
                                  date ? date.toISOString().split("T")[0] : "",
                                )
                              }
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://www.yourcompany.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description of your company"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              {/* Step 3: Contact Person */}
              {currentStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="contactPerson.firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPerson.lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPerson.position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position *</FormLabel>
                        <FormControl>
                          <Input placeholder="Managing Director" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPerson.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="contact@company.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="contactPerson.phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              {/* Step 4: Business Address */}
              {currentStep === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="businessAddress.street"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Street Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Business Rd" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessAddress.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nairobi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessAddress.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nairobi County" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessAddress.zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP/Postal Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="00100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessAddress.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <FormControl>
                          <Input placeholder="Kenya" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {/* Step 5: Account Setup */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="admin@yourcompany.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter a strong password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password *</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I accept the terms and conditions and privacy policy
                            *
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentStep < steps.length ? (
            <Button type="button" onClick={nextStep}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgencySignup;
