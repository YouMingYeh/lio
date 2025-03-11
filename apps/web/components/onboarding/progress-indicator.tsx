interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export default function ProgressIndicator({
  totalSteps,
  currentStep,
}: ProgressIndicatorProps) {
  return (
    <div className="flex w-full justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-2 w-2 rounded-full transition-all duration-300 ${
            index === currentStep
              ? "w-4 bg-primary"
              : index < currentStep
                ? "bg-primary/60"
                : "bg-muted"
          }`}
        />
      ))}
    </div>
  );
}
