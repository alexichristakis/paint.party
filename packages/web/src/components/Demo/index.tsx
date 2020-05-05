import React from "react";

import Base, { BaseProps } from "./base";

export interface DemoProps {
  onEnter?: (section: string) => void;
}

export interface CreateProps extends DemoProps {}
export const Create: React.FC<CreateProps> = React.memo(({ onEnter }) => {
  return (
    <Base
      title="Create"
      onEnter={onEnter}
      text={[
        "With paint party, you can draw pixel art with your friends in real time.",
        "Every canvas offers a unique experience with customizeable size, background color, duration, and draw interval.",
      ]}
      screenshots={["/png/create_1.png", "/png/create_2.png"]}
    />
  );
});

export interface DrawProps extends DemoProps {}
export const Draw: React.FC<DrawProps> = React.memo(({ onEnter }) => {
  return (
    <Base
      reverse
      onEnter={onEnter}
      title="Draw"
      text={[
        "Drawing fills in a single pixel. Each canvas can limit how frequently authors draw, so it helps to communicate a plan to your fellow drawers!",
        "The color wheel stores multiple palettes which are completely customizable.",
      ]}
      screenshots={["/png/draw_1.png", "/png/draw_2.png"]}
    />
  );
});

export interface ShareProps extends DemoProps {}
export const Share: React.FC<ShareProps> = React.memo(({ onEnter }) => {
  return (
    <Base
      title="Share"
      onEnter={onEnter}
      text={[
        "Share your canvases with as many friends as you want! Anyone with the unique canvas link can join.",
        "You can watch your co-authors draw in real-time, share colors, and curate a gallery of your work.",
      ]}
      screenshots={["/png/share_1.png", "/png/share_2.png"]}
    />
  );
});
