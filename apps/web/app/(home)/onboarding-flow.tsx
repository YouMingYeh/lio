"use client";

import FeatureOne from "@/components/onboarding/feature-one";
import FinalScreen from "@/components/onboarding/final-screen";
import ProgressIndicator from "@/components/onboarding/progress-indicator";
import WelcomeScreen from "@/components/onboarding/welcome-screen";
import { useUser } from "@/hooks/use-user";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { FastForward } from "lucide-react";
import { useState } from "react";

export function OnboardingFlow() {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(true);

  const steps = [
    <WelcomeScreen key="welcome" />,
    <FeatureOne key="feature1" />,
    <FinalScreen key="final" onComplete={() => setIsCompleted(true)} />,
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    setIsCompleted(true);
  };

  return (
    <Dialog open={!isCompleted}>
      {!user?.onboarded && (
        <DialogTrigger
          asChild
          onClick={() => {
            setIsCompleted(false);
          }}
        >
          <Button variant="shine" className="mt-4" size="lg">
            👋 第一次使用嗎？點我教學
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="w-full h-full max-w-none" isCloseHidden>
        <DialogTitle className="sr-only">Onboarding</DialogTitle>
        <div className=" max-w-xl w-full mx-auto flex justify-center  flex-col py-8">
          {/* Skip button */}
          <Button
            variant="ghost"
            className="absolute right-4 top-4 z-10 text-muted-foreground"
            onClick={skipOnboarding}
          >
            跳過
            <FastForward className="h-5 w-5 ml-2" />
          </Button>

          {/* Content area with animations */}
          <div className="flex-1 w-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {steps[currentStep]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation and progress */}
          <div className="mt-8 w-full">
            <ProgressIndicator
              totalSteps={steps.length}
              currentStep={currentStep}
            />

            <div className="mt-6 mb-12 flex w-full justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                className={currentStep === 0 ? "invisible" : ""}
              >
                上一步
              </Button>

              {currentStep !== 5 || user?.onboarded ? (
                <Button
                  onClick={nextStep}
                  className={
                    currentStep === steps.length - 1 ? "invisible" : ""
                  }
                >
                  下一步
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
