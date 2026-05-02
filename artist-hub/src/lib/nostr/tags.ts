export const groupedTags: Record<string, string[]> = {
  'Visual Arts': [
    'BitcoinArt', 'DigitalArt', 'VisualArt', 'Illustration',
    'Painting', 'Photography', 'Sculpture', 'NFTArt',
    'Poster', 'GraphicDesign', 'Calligraphy', 'Murals',
  ],
  Music: [
    'Music', 'Mixing', 'Mastering', 'Production',
    'SoundDesign', 'Vocals', 'Guitar', 'Piano',
    'DJSet', 'Composition', 'SongWriting', 'BeatMaking',
  ],
  Film: [
    'Film', 'Animation', 'VideoEditing', 'MotionGraphics',
    'Documentary', 'ShortFilm', 'Cinematography', 'VFX',
  ],
  Writing: [
    'Writing', 'Storytelling', 'Poetry', 'Screenplay',
    'Journalism', 'Copywriting', 'Blogging', 'Translation',
  ],
  Performance: [
    'Theater', 'Dance', 'LivePerformance', 'Comedy',
    'SpokenWord', 'Improv', 'Circus', 'Opera',
  ],
  Design: [
    'WebDesign', 'UIDesign', 'BrandIdentity', 'Typography',
    'PackageDesign', 'PrintDesign', '3DDesign', 'FashionDesign',
  ],
  Collaboration: [
    'Collab', 'Commission', 'Workshop', 'Mentorship',
    'OpenSource', 'CommunityProject', 'ArtistResidency', 'Exhibition',
  ],
  Gigs: [
    'Gig', 'Freelance', 'ForHire', 'Available',
    'CustomWork', 'Rush', 'Ongoing', 'OneTime',
  ],
};

export const allTags: string[] = Object.values(groupedTags).flat();
