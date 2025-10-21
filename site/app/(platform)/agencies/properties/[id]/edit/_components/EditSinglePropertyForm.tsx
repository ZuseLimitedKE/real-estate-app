"use client";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { EditPropertyDetailsForm, paymentsSchema } from "./ApartmentDetailsUpdateForm";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { TabsList } from "@radix-ui/react-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, DollarSign, Plus, Trash2, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentStatus } from "@/types/property";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

export default function EditSinglePropertyForm() {
    const {
        register,
        watch,
        setValue,
        setError,
        control,
        formState: { errors }
    } = useFormContext<EditPropertyDetailsForm>();
    const currentPaymentIndex = -1;
    const currentAdditionalPayment = watch(`single_property_details.payments.${currentPaymentIndex}`)
    const { append, remove } = useFieldArray({
        control,
        name: "single_property_details.payments"
    });
    const createdPayments = watch("single_property_details.payments") || [];

    const addPaymentHistory = () => {
        const parsed = paymentsSchema.safeParse(currentAdditionalPayment);
        if (parsed.error) {
            const errors = parsed.error.issues;

            for (const error of errors) {
                if (error.path.includes("date")) {
                    setError(`single_property_details.payments.${currentPaymentIndex}.date`, {
                        type: "manual",
                        message: error.message
                    })
                }

                if (error.path.includes("amount")) {
                    setError(`single_property_details.payments.${currentPaymentIndex}.amount`, {
                        type: "manual",
                        message: error.message
                    })
                }

                if (error.path.includes("status")) {
                    setError(`single_property_details.payments.${currentPaymentIndex}.status`, {
                        type: "manual",
                        message: error.message
                    })
                }
            }
        } else {
            append(parsed.data);
            toast.success("Payment history item added succesfully")
        }
    };

    const removePaymentHistory = (index: number) => {
        remove(index);
        toast.success("Payment history item removed succesfully")
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Single property management
                </CardTitle>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="tenant" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="tenant">Tenant Details</TabsTrigger>
                        <TabsTrigger value="payments">
                            Payment History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tenant" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="tenant.name">
                                    Tenant Name
                                </Label>
                                <Input
                                    id="tenant.name"
                                    {...register("single_property_details.tenant.name")}
                                    placeholder="Full name"
                                    className="mt-1"
                                />
                                {errors.single_property_details?.tenant?.name && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.single_property_details?.tenant?.name.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="tenant.email">
                                    Email
                                </Label>
                                <Input
                                    id="tenant.email"
                                    {...register(
                                        "single_property_details.tenant.email"
                                    )}
                                    type="email"
                                    placeholder="email@example.com"
                                    className="mt-1"
                                />
                                {errors.single_property_details?.tenant?.email && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.single_property_details?.tenant?.email.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="tenant.address">
                                    Tenant Address
                                </Label>
                                <Input
                                    id="tenant.address"
                                    {...register("single_property_details.tenant.address")}
                                    placeholder="0x....."
                                    className="mt-1"
                                />
                                {errors.single_property_details?.tenant?.address && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.single_property_details?.tenant?.address.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="tenant.number">
                                    Phone Number
                                </Label>
                                <Input
                                    id="tenant.number"
                                    {...register(
                                        "single_property_details.tenant.number",
                                    )}
                                    placeholder="+1234567890"
                                    className="mt-1"
                                />
                                {errors.single_property_details?.tenant?.number && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.single_property_details?.tenant?.number.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="tenant.rentAmount">
                                    Monthly Rent
                                </Label>
                                <Input
                                    id="tenant.rentAmount"
                                    {...register(
                                        "single_property_details.tenant.rentAmount",
                                        { valueAsNumber: true },
                                    )}
                                    type="number"
                                    placeholder="0"
                                    step={0.1}
                                    className="mt-1"
                                />
                                {errors.single_property_details?.tenant?.rentAmount && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.single_property_details?.tenant?.rentAmount.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="tenant.rentDate">
                                    Rent Date
                                </Label>
                                <Input
                                    id="tenant.rentDate"
                                    {...register(
                                        "single_property_details.tenant.rentDate",
                                        { valueAsNumber: true },
                                    )}
                                    type="number"
                                    placeholder="0"
                                    className="mt-1"
                                    min={1}
                                    max={31}
                                />
                                {errors.single_property_details?.tenant?.rentDate && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.single_property_details?.tenant?.rentDate.message}
                                    </p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <Label>
                                    Join Date
                                </Label>
                                <Controller
                                    name="single_property_details.tenant.joinDate"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="tenant.joinDate"
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    captionLayout="dropdown"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                                {errors.single_property_details?.tenant?.joinDate && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.single_property_details?.tenant?.joinDate.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="payments" className="space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Payment History
                            </h4>
                            <Button
                                type="button"
                                onClick={addPaymentHistory}
                                variant="outline"
                                size="sm"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Payment
                            </Button>
                        </div>


                        <div className="bg-slate-100 rounded-md p-2 border space-y-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Controller
                                    name={`single_property_details.payments.${currentPaymentIndex}.date`}
                                    control={control}
                                    render={({ field }) => (
                                        <Popover >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="tenant.joinDate"
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    captionLayout="dropdown"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                                {errors.single_property_details?.payments?.[currentPaymentIndex]?.date && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.single_property_details?.payments?.[currentPaymentIndex]?.date.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment_amount">Amount</Label>
                                <Input
                                    id="payment_amount"
                                    {...register(
                                        `single_property_details.payments.${currentPaymentIndex}.amount`,
                                        {
                                            valueAsNumber: true,
                                        },
                                    )}
                                    type="number"
                                    placeholder="0"
                                    className="mt-1"
                                />
                                {errors.single_property_details?.payments?.[currentPaymentIndex]?.amount && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.single_property_details?.payments?.[currentPaymentIndex]?.amount.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label >Status</Label>
                                <Controller
                                    name={`single_property_details.payments.${currentPaymentIndex}.status`}
                                    control={control}
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={PaymentStatus.PAID}>Paid</SelectItem>
                                                    <SelectItem value={PaymentStatus.PENDING}>
                                                        Pending
                                                    </SelectItem>
                                                    <SelectItem value={PaymentStatus.OVERDUE}>
                                                        Overdue
                                                    </SelectItem>
                                                    <SelectItem value={PaymentStatus.PARTIAL}>
                                                        Partial
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.single_property_details?.payments?.[currentPaymentIndex]?.status && (
                                                <p className="text-sm text-red-500 mt-1">
                                                    {errors.single_property_details?.payments?.[currentPaymentIndex]?.status.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        {createdPayments?.map((_, paymentIndex) => (
                            <Card key={paymentIndex} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Controller
                                            name={`single_property_details.payments.${paymentIndex}.date`}
                                            control={control}
                                            render={({ field }) => (
                                                <Popover >
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            id="tenant.joinDate"
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) =>
                                                                date > new Date() || date < new Date("1900-01-01")
                                                            }
                                                            captionLayout="dropdown"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        />
                                        {errors.single_property_details?.payments?.[paymentIndex]?.date && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.single_property_details?.payments?.[paymentIndex]?.date.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="payment_amount">Amount</Label>
                                        <Input
                                            id="payment_amount"
                                            {...register(
                                                `single_property_details.payments.${paymentIndex}.amount`,
                                                {
                                                    valueAsNumber: true,
                                                },
                                            )}
                                            type="number"
                                            placeholder="0"
                                            className="mt-1"
                                        />
                                        {errors.single_property_details?.payments?.[paymentIndex]?.amount && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.single_property_details?.payments?.[paymentIndex]?.amount.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label >Status</Label>
                                        <Select
                                            value={watch(
                                                `single_property_details.payments.${paymentIndex}.status`,
                                            )}
                                            onValueChange={(value) =>
                                                setValue(
                                                    `single_property_details.payments.${paymentIndex}.status`,
                                                    value as any,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={PaymentStatus.PAID}>Paid</SelectItem>
                                                <SelectItem value={PaymentStatus.PENDING}>
                                                    Pending
                                                </SelectItem>
                                                <SelectItem value={PaymentStatus.OVERDUE}>
                                                    Overdue
                                                </SelectItem>
                                                <SelectItem value={PaymentStatus.PARTIAL}>
                                                    Partial
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.single_property_details?.payments?.[paymentIndex]?.status && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.single_property_details?.payments?.[paymentIndex]?.status.message}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            removePaymentHistory(paymentIndex)
                                        }
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        )) || (
                                <p className="text-gray-500 text-center py-4">
                                    No payment history added yet
                                </p>
                            )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}