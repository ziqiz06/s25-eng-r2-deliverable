"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm, FormProvider } from "react-hook-form";

// Use Zod to validate that the species selected for deletion is a valid string
import { z } from "zod";

const speciesSchema = z.object({
  species_to_delete: z.string().min(1),
});

type FormData = z.infer<typeof speciesSchema>;

export default function DeleteSpeciesDialog({
  scientificNames,
}: {
  scientificNames: string[];
}) {
  const router = useRouter();

  const [open, setOpen] = useState<boolean>(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);

  // Use react-hook-form
  const methods = useForm<FormData>({
    resolver: async (data) => {
      const result = speciesSchema.safeParse(data);
      if (result.success) {
        return { values: data, errors: {} };
      } else {
        return { values: {}, errors: result.error.formErrors.fieldErrors };
      }
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!selectedSpecies) return;

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("species")
      .delete()
      .eq("scientific_name", selectedSpecies);

    if (error) {
      return toast({
        title: "Something went wrong.",
        description: "Failed to delete species.",
        variant: "destructive",
      });
    }

    // Close the dialog and refresh the page to reflect changes
    setOpen(false);
    router.refresh();

    toast({
      title: "Species deleted!",
      description: `Successfully deleted ${selectedSpecies}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          Delete Species
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Delete Species</DialogTitle>
          <DialogDescription>
            Select a species to delete. Once deleted, this action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {/* Wrap the form in FormProvider to pass the form context down */}
        <FormProvider {...methods}>
          <Form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
              <FormItem>
                <FormLabel>Choose Species to Delete</FormLabel>
                <Select onValueChange={(value) => setSelectedSpecies(value)} value={selectedSpecies}>
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
              <div className="flex justify-between">
                <Button onClick={methods.handleSubmit(onSubmit)} className="ml-1 mr-1 flex-auto" variant="destructive">
                  Delete Species
                </Button>
                <DialogClose asChild>
                  <Button type="button" className="ml-1 mr-1 flex-auto">
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </div>
          </Form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
