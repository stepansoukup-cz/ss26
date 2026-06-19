import type { AudioMediaItem } from "@/lib/content-block-constants";

function trackTitle(track: AudioMediaItem, index: number) {
  return track.caption?.trim() || `Stopa ${index + 1}`;
}

export function ArticleAudioPlayer({ tracks }: { tracks: AudioMediaItem[] }) {
  if (tracks.length === 0) {
    return null;
  }

  return (
    <figure className="article-audio-player my-8">
      <div className="space-y-4">
        {tracks.map((track, index) => (
          <div key={track.id} className="article-audio-track">
            <p className="article-audio-track-title">{trackTitle(track, index)}</p>
            <audio
              controls
              preload="metadata"
              src={track.url}
              className="article-audio-element"
            />
          </div>
        ))}
      </div>
    </figure>
  );
}
