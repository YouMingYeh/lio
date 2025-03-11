"use client";

import NumberFlow, { NumberFlowProps } from "@number-flow/react";

type AnimatedNumberProps = NumberFlowProps;

export function AnimatedNumber(props: AnimatedNumberProps) {
  return (
    <NumberFlow
      className="text-4xl w-14 text-center font-semibold"
      {...props}
    />
  );
}
