import { Activity, useState } from "react";
import { createRoot } from "react-dom/client";
import { CopyButton } from "@/blocks/Code/CopyButton";
import { YouTubePlayer } from "@/blocks/YouTube/YouTubePlayer";
import { LazyVideo } from "@/components/LazyVideo";

function Fixture() {
  const [visible, setVisible] = useState(true);
  return (
    <>
      <button onClick={() => setVisible((value) => !value)} type="button">
        Toggle activity
      </button>
      <Activity mode={visible ? "visible" : "hidden"}>
        <LazyVideo mp4Src="/fixture.mp4" />
        <YouTubePlayer videoId="fixture" />
        <CopyButton code="const answer = 42;" />
      </Activity>
    </>
  );
}
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<Fixture />);
}
