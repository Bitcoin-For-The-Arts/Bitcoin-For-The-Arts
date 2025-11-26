import StoryEntry from "@/components/StoryEntry";

export default function StoriesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <StoryEntry
          title="FANTASTIC CAT, THE BAND THAT LIVES UP TO THE NAME"
          subtitle="TOPIC DISCUSSION"
          isFirst
        />
        <StoryEntry
          title="A FANTASTIC CAT OFFICE HOLIDAY PARTY AT THE BOWERY BALLROOM"
          subtitle="TOPIC DISCUSSION"
          reverse
        />
        <StoryEntry
          title="A MIAMI BREEZE, PROJECTOR SCREENS, AND NFTS"
          subtitle="BITCOIN FOR ART UPDATES"
        />
      </div>
    </main>
  );
}

