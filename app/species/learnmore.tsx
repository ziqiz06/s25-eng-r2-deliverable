"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Species } from "./species-card"; // Import the Species type

type LearnMoreProps = {
  species: Species;
  onClose: () => void;
};

export default function LearnMore({ species, onClose }: LearnMoreProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{species.scientific_name}</DialogTitle>
          <DialogDescription>{species.description}</DialogDescription>
        </DialogHeader>
        <div>
          <p><strong>Common Name:</strong> {species.common_name}</p>
          <p><strong>Population:</strong> {species.total_population}</p>
          <p><strong>Kingdom:</strong> {species.kingdom}</p>
        </div>
        <DialogClose asChild>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
