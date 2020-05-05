import React, { useRef } from "react";
import useInview from "react-cool-inview";
import classNames from "classnames";

import styles from "./demo.module.scss";
import Screens from "./screens";

export interface BaseProps {
  onEnter?: (section: string) => void;
  title: string;
  text: string[];
  screenshots: [string, string];
  reverse?: boolean;
}

const Base: React.FC<BaseProps> = React.memo(
  ({ title, text, screenshots, reverse = false, onEnter }) => {
    const ref = useRef<HTMLDivElement>(null);

    const { inView } = useInview(ref, {
      onEnter: () => (onEnter ? onEnter(title) : null),
    });

    return (
      <>
        <div
          ref={ref}
          className={classNames(styles.header, { [styles.inView]: inView })}
        >
          <h2>{title}</h2>
        </div>
        <div
          className={classNames(styles.container, {
            [styles.reverse]: reverse,
          })}
        >
          <div className={styles.description}>
            {text.map((s) => (
              <>
                <br />
                <h3>{s}</h3>
              </>
            ))}
          </div>
          ,
          <div className={"gutter"} />,
          <Screens
            className={classNames({ [styles.inView]: inView })}
            src={screenshots}
          />
        </div>
      </>
    );
  }
);

export default Base;
