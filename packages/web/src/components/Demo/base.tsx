import React, { useRef, useMemo } from "react";
import useInview from "react-cool-inview";
import classNames from "classnames";

import styles from "./demo.module.scss";
import Screens from "./screens";

export interface BaseProps {
  title: string;
  text: string[];
  screenshots: [string, string];
  reverse?: boolean;
}

const Base: React.FC<BaseProps> = React.memo(
  ({ title, text, screenshots, reverse = false }) => {
    const ref = useRef<HTMLDivElement>(null);

    const { inView } = useInview(ref, {});

    const content = useMemo(
      () => [
        <div className={styles.description}>
          {text.map((s) => (
            <>
              <br />
              <h3>{s}</h3>
            </>
          ))}
        </div>,
        <div className={"gutter"} />,
        <Screens src={screenshots} />,
      ],
      []
    );

    if (reverse) content.reverse();

    return (
      <>
        <div className={classNames(styles.header, { [styles.inView]: inView })}>
          <h2>{title}</h2>
        </div>
        <div
          ref={ref}
          className={classNames(styles.container, {
            [styles.reverse]: reverse,
          })}
        >
          {content.map((e) => e)}
        </div>
      </>
    );
  }
);

export default Base;
