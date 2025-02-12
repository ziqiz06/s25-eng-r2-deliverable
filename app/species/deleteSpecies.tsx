"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DeleteSpeciesDialog({
  scientificNames,
}: {
  scientificNames: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string | "">("");

  const onDelete = async () => {
    if (!selectedSpecies) {
      toast({
        title: "No species selected.",
        description: "Please select a species to delete.",
        variant: "destructive",
      });
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("species")
      .delete()
      .eq("scientific_name", selectedSpecies);

    if (error) {
      return toast({
        title: "Error deleting species.",
        description: "Failed to delete the selected species.",
        variant: "destructive",
      });
    }

    toast({
      title: "Species deleted!",
      description: `Successfully deleted ${selectedSpecies}.`,
    });

    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Icons.trash className="mr-3 h-5 w-5" />
          Delete Species
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Species</DialogTitle>
          <DialogDescription>
            Select a species to permanently delete. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <Select onValueChange={(value) => setSelectedSpecies(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a species" />
          </SelectTrigger>
          <SelectContent>
            {scientificNames.map((name, index) => (
              <SelectItem key={index} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex justify-between mt-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
