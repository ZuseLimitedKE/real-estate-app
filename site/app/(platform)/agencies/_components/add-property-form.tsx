"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

const addPropertySchema = z.object({});

export function AddPropertyForm() {
  const form = useForm<z.infer<typeof addPropertySchema>>({
    resolver: zodResolver(addPropertySchema),
    defaultValues: {},
  });

  return <form></form>;
}
