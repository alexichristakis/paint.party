import React from "react";
import { useSelector } from "react-redux";
import { useContextSelector as useContext } from "use-context-selector";

import { DrawContext, drawingContextSelectors } from "@hooks";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import Label, { LabelProps } from "./Label";
import Indicator, { IndicatorProps } from "./Indicator";
import isEqual from "lodash/isEqual";

export type ContentProps = LabelProps & IndicatorProps;

const Content: React.FC<ContentProps> = React.memo(
  (props) => {
    const cell = useContext(DrawContext, drawingContextSelectors.cell);

    const { time, color } = useSelector((state: RootState) =>
      selectors.cellLatestUpdate(state, { cell })
    );

    return (
      <>
        <Label {...props} {...{ time, color }} />
        <Indicator {...props} {...{ color }} />
      </>
    );
  },
  (p, n) => isEqual(p, n)
);

export default Content;
