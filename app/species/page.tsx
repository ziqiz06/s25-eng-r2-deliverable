import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import AddSpeciesDialog from "./add-species-dialog";
import EditSpeciesDialog from "./editSpecies";
import DeleteSpeciesDialog from "./deleteSpecies";
import SpeciesCard from "./species-card";

export default async function SpeciesList() {
  // Create supabase server component client and obtain user session from stored cookie
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  const sessionId = session.user.id;
  // Get species created by the current user (author = sessionId)
  const { data: speciesList, error } = await supabase
    .from("species")
    .select("scientific_name")
    .eq("author", sessionId);  // Filter by the current user
  if (error) {
    console.error("Error fetching species:", error);
    return <p>Failed to load species</p>;
  }

  // Extract just the list of scientific names created by the user
  const scientificNames = speciesList?.map((species) => species.scientific_name) || [];

  const { data: species } = await supabase.from("species").select("*").order("id", { ascending: false });

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <TypographyH2>Species List</TypographyH2>
        <div className="flex gap-4 ml-auto">
          <AddSpeciesDialog userId={sessionId} />
          <EditSpeciesDialog userId={sessionId} scientificNames={scientificNames} />
          <DeleteSpeciesDialog userId={sessionId} scientificNames={scientificNames} />
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-wrap justify-center">
        {species?.map((species) => <SpeciesCard key={species.id} species={species} />)}
      </div>
    </>
  );
}
