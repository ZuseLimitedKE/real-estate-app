"use client";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { apartmentUnitSchema, EditPropertyDetailsForm, paymentsSchema } from "./ApartmentDetailsUpdateForm";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { TabsList } from "@radix-ui/react-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, DollarSign, Home, Plus, Trash2, User } from "lucide-react";
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
import { form } from "viem/chains";

export default function EditApartmentPropertyForm({ templates }: { templates: { name: string, id: string }[] }) {
    const {
        control,
        register,
        watch,
        formState: { errors },
        setError,
        getValues,
        setValue
    } = useFormContext<EditPropertyDetailsForm>();

    const currentIndex = -1;
    const currentUnit = watch(`apartment_details.units.${currentIndex}`);
    const unitFields = watch("apartment_details.units");

    const { append, remove } = useFieldArray({
        control,
        name: "apartment_details.units"
    });

    const removeUnit = (index: number) => {
        remove(index);
        toast.success("Unit has been removed succesfully");
    }

    const appendUnit = () => {
        const parsed = apartmentUnitSchema.safeParse(currentUnit);
        if (parsed.error) {
            const errors = parsed.error.issues;

            for (const error of errors) {
                if (error.path.includes("name")) {
                    setError(`apartment_details.units.${currentIndex}.name`, {
                        type: "manual",
                        message: error.message
                    })
                }

                if (error.path.includes("templateID")) {
                    setError(`apartment_details.units.${currentIndex}.templateID`, {
                        type: "manual",
                        message: error.message
                    })
                }

                if (error.path.includes("floor")) {
                    setError(`apartment_details.units.${currentIndex}.floor`, {
                        type: "manual",
                        message: error.message
                    })
                }

                if (error.path.includes("tenant")) {
                    setError(`apartment_details.units.${currentIndex}.tenant`, {
                        type: "manual",
                        message: error.message
                    })
                }

                if (error.path.includes("payments")) {
                    setError(`apartment_details.units.${currentIndex}.payments`, {
                        type: "manual",
                        message: error.message
                    })
                }
            }
        } else {
            append(parsed.data);
            toast.success("Added unit to apartment succesfully");
        }
    }

    const addPaymentHistory = (unitIndex: number) => {
        const currentPayments =
            getValues(`apartment_details.units.${unitIndex}.payments`) || [];

        const currentPaymentIndex = -1;
        const newPayment = watch(`apartment_details.units.${unitIndex}.payments.${currentPaymentIndex}`);
        const parsed = paymentsSchema.safeParse(newPayment);
        if (parsed.error) {
            const errors = parsed.error.issues;

            for (const error of errors) {
                if (error.path.includes("date")) {
                    setError(`apartment_details.units.${unitIndex}.payments.${currentPaymentIndex}.date`, {
                        type: "manual",
                        message: error.message
                    })
                }

                if (error.path.includes("amount")) {
                    setError(`apartment_details.units.${unitIndex}.payments.${currentPaymentIndex}.amount`, {
                        type: "manual",
                        message: error.message
                    })
                }

                if (error.path.includes("status")) {
                    setError(`apartment_details.units.${unitIndex}.payments.${currentPaymentIndex}.status`, {
                        type: "manual",
                        message: error.message
                    })
                }
            }
        } else {
            setValue(`apartment_details.units.${unitIndex}.payments`, [
                ...currentPayments,
                parsed.data
            ]);
            toast.success("Payment history item added succesfully")
        }
    };

    const removePaymentHistory = (unitIndex: number, paymentIndex: number) => {
        const currentPayments =
            getValues(`apartment_details.units.${unitIndex}.payments`) || [];
        const updatedPayments = currentPayments.filter(
            (_, index) => index !== paymentIndex,
        );
        setValue(`apartment_details.units.${unitIndex}.payments`, updatedPayments);
    };

    return (
        <article className="space-y-6">
            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        Building Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="floors">Number of Floors</Label>
                        <Input
                            id="floors"
                            type="number"
                            {...register("apartment_details.num_floors", { valueAsNumber: true })}
                            className="mt-1"
                        />
                        {errors.apartment_details?.num_floors && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.apartment_details?.num_floors.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="parkingSpace">Parking Spaces</Label>
                        <Input
                            id="parkingSpace"
                            type="number"
                            {...register("apartment_details.parking_spaces", { valueAsNumber: true })}
                            className="mt-1"
                        />
                        {errors.apartment_details?.parking_spaces && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.apartment_details?.parking_spaces?.message}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Units Management */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Units Management ({unitFields.length} units)
                    </CardTitle>
                    <Button
                        type="button"
                        onClick={() => appendUnit()}
                        variant="outline"
                        size="sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Unit
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {unitFields.map((field, unitIndex) => (
                        <Card key={unitIndex} className="border-l-4 border-l-primary">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Home className="h-4 w-4" />
                                        Unit #{unitIndex + 1} - {field.name}
                                    </CardTitle>
                                    {unitFields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeUnit(unitIndex)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Unit Name */}
                                <div>
                                    <Label htmlFor={`apartment_details.units.${unitIndex}.name`}>Unit Name</Label>
                                    <Input
                                        {...register(`apartment_details.units.${unitIndex}.name`)}
                                        placeholder="e.g., Unit 101, Apartment A"
                                        className="mt-1"
                                    />
                                    {errors.apartment_details?.units?.[unitIndex]?.name && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.apartment_details?.units?.[unitIndex]?.name?.message}
                                        </p>
                                    )}
                                </div>

                                {/* Unit Floor */}
                                <div>
                                    <Label htmlFor={`apartment_details.units.${unitIndex}.floor`}>Unit Floor</Label>
                                    <Input
                                        {...register(`apartment_details.units.${unitIndex}.floor`, {valueAsNumber: true})}
                                        placeholder="e.g., Unit 101, Apartment A"
                                        className="mt-1"
                                    />
                                    {errors.apartment_details?.units?.[unitIndex]?.floor && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.apartment_details?.units?.[unitIndex]?.floor?.message}
                                        </p>
                                    )}
                                </div>

                                {/* Unit Template */}
                                <div>
                                    <Label htmlFor={`apartment_details.units.${unitIndex}.templateID`}>Unit Template</Label>
                                    <Controller
                                        name={`apartment_details.units.${unitIndex}.templateID`}
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
                                                        {templates.map((t) => (
                                                            <SelectItem value={t.id}>{t.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.apartment_details?.units?.[unitIndex]?.templateID && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors.apartment_details?.units?.[unitIndex]?.templateID.message}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>

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
                                                <Label htmlFor="unit.tenant.name">
                                                    Tenant Name
                                                </Label>
                                                <Input
                                                    id="unit.tenant.name"
                                                    {...register(`apartment_details.units.${unitIndex}.tenant.name`)}
                                                    placeholder="Full name"
                                                    className="mt-1"
                                                />
                                                {errors.apartment_details?.units?.[unitIndex]?.tenant?.name && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors.apartment_details?.units?.[unitIndex]?.tenant?.name.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="unit.tenant.email">
                                                    Email
                                                </Label>
                                                <Input
                                                    id="unit.tenant.email"
                                                    {...register(
                                                        `apartment_details.units.${unitIndex}.tenant.email`
                                                    )}
                                                    type="email"
                                                    placeholder="email@example.com"
                                                    className="mt-1"
                                                />
                                                {errors.apartment_details?.units?.[unitIndex]?.tenant?.email && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors.apartment_details?.units?.[unitIndex]?.tenant?.email.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="unit.tenant.address">
                                                    Tenant Address
                                                </Label>
                                                <Input
                                                    id="unit.tenant.address"
                                                    {...register(`apartment_details.units.${unitIndex}.tenant.address`)}
                                                    placeholder="0x....."
                                                    className="mt-1"
                                                />
                                                {errors.apartment_details?.units?.[unitIndex]?.tenant?.address && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors.apartment_details?.units?.[unitIndex]?.tenant?.address.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="unit.tenant.number">
                                                    Phone Number
                                                </Label>
                                                <Input
                                                    id="unit.tenant.number"
                                                    {...register(
                                                        `apartment_details.units.${unitIndex}.tenant.number`,
                                                    )}
                                                    placeholder="+1234567890"
                                                    className="mt-1"
                                                />
                                                {errors.apartment_details?.units?.[unitIndex]?.tenant?.number && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors.apartment_details?.units?.[unitIndex]?.tenant?.number.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="unit.tenant.rentAmount">
                                                    Monthly Rent
                                                </Label>
                                                <Input
                                                    id="unit.tenant.rentAmount"
                                                    {...register(
                                                        `apartment_details.units.${unitIndex}.tenant.rentAmount`,
                                                        { valueAsNumber: true },
                                                    )}
                                                    type="number"
                                                    placeholder="0"
                                                    step={0.1}
                                                    className="mt-1"
                                                />
                                                {errors.apartment_details?.units?.[unitIndex]?.tenant?.rentAmount && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors.apartment_details?.units?.[unitIndex]?.tenant?.rentAmount.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="unit.tenant.rentDate">
                                                    Rent Date
                                                </Label>
                                                <Input
                                                    id="unit.tenant.rentDate"
                                                    {...register(
                                                        `apartment_details.units.${unitIndex}.tenant.rentDate`,
                                                        { valueAsNumber: true },
                                                    )}
                                                    type="number"
                                                    placeholder="0"
                                                    className="mt-1"
                                                    min={1}
                                                    max={31}
                                                />
                                                {errors.apartment_details?.units?.[unitIndex]?.tenant?.rentDate && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors.apartment_details?.units?.[unitIndex]?.tenant?.rentDate.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label>
                                                    Join Date
                                                </Label>
                                                <Controller
                                                    name={`apartment_details.units.${unitIndex}.tenant.joinDate`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Popover >
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    id="unit.tenant.joinDate"
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
                                                {errors.apartment_details?.units?.[unitIndex]?.tenant?.joinDate && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors.apartment_details?.units?.[unitIndex]?.tenant?.joinDate.message}
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
                                                onClick={() => addPaymentHistory(unitIndex)}
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
                                                    name={`apartment_details.units.${unitIndex}.payments.${-1}.date`}
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
                                                {errors.apartment_details?.units?.[unitIndex]?.payments?.[-1]?.date && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors.apartment_details?.units?.[unitIndex]?.payments?.[-1]?.date?.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="payment_amount">Amount</Label>
                                                <Input
                                                    id="payment_amount"
                                                    {...register(
                                                        `apartment_details.units.${unitIndex}.payments.${-1}.amount`,
                                                        {
                                                            valueAsNumber: true,
                                                        },
                                                    )}
                                                    type="number"
                                                    placeholder="0"
                                                    className="mt-1"
                                                />
                                                {errors.apartment_details?.units?.[unitIndex]?.payments?.[-1]?.amount && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors.apartment_details?.units?.[unitIndex]?.payments?.[-1]?.amount?.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label >Status</Label>
                                                <Controller
                                                    name={`apartment_details.units.${unitIndex}.payments.${-1}.status`}
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
                                                            {errors.apartment_details?.units?.[unitIndex]?.payments?.[-1]?.status && (
                                                                <p className="text-sm text-red-500 mt-1">
                                                                    {errors.apartment_details?.units?.[unitIndex]?.payments?.[-1]?.status?.message}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {field.payments?.map((_, paymentIndex) => (
                                            <Card key={paymentIndex} className="p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                                    <div className="space-y-2">
                                                        <Label>Date</Label>
                                                        <Controller
                                                            name={`apartment_details.units.${unitIndex}.payments.${paymentIndex}.date`}
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
                                                        {errors.apartment_details?.units?.[unitIndex]?.payments?.[paymentIndex]?.date && (
                                                            <p className="text-sm text-red-500 mt-1">
                                                                {errors.apartment_details?.units?.[unitIndex]?.payments?.[paymentIndex]?.date?.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="payment_amount">Amount</Label>
                                                        <Input
                                                            id="payment_amount"
                                                            {...register(
                                                                `apartment_details.units.${unitIndex}.payments.${paymentIndex}.amount`,
                                                                {
                                                                    valueAsNumber: true,
                                                                },
                                                            )}
                                                            type="number"
                                                            placeholder="0"
                                                            className="mt-1"
                                                        />
                                                        {errors.apartment_details?.units?.[unitIndex]?.payments?.[paymentIndex]?.amount && (
                                                            <p className="text-sm text-red-500 mt-1">
                                                                {errors.apartment_details?.units?.[unitIndex]?.payments?.[paymentIndex]?.amount?.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label >Status</Label>
                                                        <Controller
                                                            name={`apartment_details.units.${unitIndex}.payments.${paymentIndex}.status`}
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
                                                                    {errors.apartment_details?.units?.[unitIndex]?.payments?.[paymentIndex]?.status && (
                                                                        <p className="text-sm text-red-500 mt-1">
                                                                            {errors.apartment_details?.units?.[unitIndex]?.payments?.[paymentIndex]?.status?.message}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            removePaymentHistory(unitIndex, paymentIndex)
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
                    ))}
                </CardContent>
            </Card>
        </article>
    );
}