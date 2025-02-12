"use client";

import { useState, useEffect, type BaseSyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { z } from "zod";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Define kingdom enum for use in Zod schema and displaying dropdown options in the form
const kingdoms = z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"]);

// Use Zod to define the shape + requirements of a Species entry
const speciesSchema = z.object({
  scientific_name: z.string().trim().min(1).transform((val) => val?.trim()),
  common_name: z.string().nullable().transform((val) => (!val || val.trim() === "" ? null : val.trim())),
  kingdom: kingdoms,
  total_population: z.number().int().positive().min(1).nullable(),
  image: z.string().url().nullable().transform((val) => (!val || val.trim() === "" ? null : val.trim())),
  description: z.string().nullable().transform((val) => (!val || val.trim() === "" ? null : val.trim())),
});

const defaultValues = {
  scientific_name: "",
  common_name: null,
  kingdom: "Animalia",
  total_population: null,
  image: null,
  description: null,
};

type FormData = z.infer<typeof speciesSchema>;

export default function EditSpeciesDialog({
  userId,
  scientificNames,
}: {
  userId: string;
  scientificNames: string[];
}) {
  const router = useRouter();

  const [open, setOpen] = useState<boolean>(false);
  const [speciesData, setSpeciesData] = useState<FormData | null>(null); // Store species data
  const form = useForm<FormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues,
    mode: "onChange",
  });

  // Fetch species data when a species is selected
  const onSpeciesSelect = async (scientificName: string) => {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from("species")
      .select("*")
      .eq("scientific_name", scientificName)
      .single();

    if (error || !data) {
      toast({
        title: "Error fetching species data.",
        description: "Could not fetch the selected species.",
        variant: "destructive",
      });
      return;
    }

    // Populate the form with the species data
    setSpeciesData(data);
    form.reset(data);
  };

  const onSubmit = async (input: FormData) => {
    const supabase = createBrowserSupabaseClient();
    const speciesToUpdate = input.scientific_name;
    let errorOccurred = false;


    // Collect only the fields that have been changed
    const updates: Record<string, any> = {};

    if (input.scientific_name && input.scientific_name !== speciesToUpdate) {
      updates.scientific_name = input.scientific_name;
    }
    if (input.common_name) {
      updates.common_name = input.common_name;
    }
    if (input.description) {
      updates.description = input.description;
    }
    if (input.kingdom) {
      updates.kingdom = input.kingdom;
    }
    if (input.total_population) {
      updates.total_population = input.total_population;
    }
    if (input.image) {
      updates.image = input.image;
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from("species")
        .update(updates)
        .eq("scientific_name", speciesToUpdate);

      if (error) {
        errorOccurred = true;
      }
    }

    if (errorOccurred) {
      return toast({
        title: "Something went wrong.",
        description: "Failed to update species.",
        variant: "destructive",
      });
    }

    // Reset form values and close the dialog
    form.reset(defaultValues);
    setOpen(false);

    // Refresh the page to reflect the changes
    router.refresh();

    toast({
      title: "Species edited!",
      description: `Successfully edited ${input.scientific_name}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Icons.add className="mr-3 h-5 w-5" />
          Edit Species
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Species</DialogTitle>
          <DialogDescription>
            Edit a species here. Click "Edit Species" below when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(e: BaseSyntheticEvent) => void form.handleSubmit(onSubmit)(e)}>
            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="change_animal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Choose Species</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        onSpeciesSelect(value); // Fetch species data when selected
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a species" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {scientificNames.map((name, index) => (
                          <SelectItem key={index} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="common_name"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Common Name</FormLabel>
                      <FormControl>
                        <Input value={value ?? ""} {...rest} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="kingdom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kingdom</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(kingdoms.parse(value))}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a kingdom" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {kingdoms.options.map((kingdom, index) => (
                            <SelectItem key={index} value={kingdom}>
                              {kingdom}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_population"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Total population</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={value ?? ""}
                          {...rest}
                          onChange={(event) => field.onChange(+event.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input value={value ?? ""} {...rest} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea value={value ?? ""} placeholder="Species description" {...rest} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <div className="flex">
                <Button type="submit" className="ml-1 mr-1 flex-auto">
                  Edit Species
                </Button>
                <DialogClose asChild>
                  <Button type="button" className="ml-1 mr-1 flex-auto">
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
