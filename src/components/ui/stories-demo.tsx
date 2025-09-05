'use client';

import {
  Stories,
  StoriesContent,
  Story,
  StoryOverlay,
  StoryVideo,
  StoryTitle,
} from '@/components/ui/stories-carousel';

const stories = [
  {
    id: 1,
    title: 'Luxury Experience',
    video:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4#t=20',
  },
  {
    id: 2,
    title: 'Amazing Service',
    video:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4#t=20',
  },
  {
    id: 3,
    title: 'Top Quality',
    video:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 4,
    title: 'Excellent Choice',
    video:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    id: 5,
    title: 'Outstanding',
    video:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
];

const StoriesDemo = () => (
  <div className="w-full max-w-6xl mx-auto p-8">
    <h2 className="text-3xl font-bold text-center mb-8">Video Testimonials Stories</h2>
    <Stories>
      <StoriesContent>
        {stories.map((story) => (
          <Story className="aspect-[3/4] w-[250px] group" key={story.id}>
            <StoryVideo src={story.video} />
            <StoryOverlay side="top" />
            <StoryTitle>
              <h3 className="text-white font-semibold text-xl leading-tight drop-shadow-lg">
                {story.title}
              </h3>
            </StoryTitle>
          </Story>
        ))}
      </StoriesContent>
    </Stories>
  </div>
);

export default StoriesDemo;
